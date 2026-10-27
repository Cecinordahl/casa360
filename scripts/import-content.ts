// Adds or updates guide content from a JSON file, so Claude (or anyone with
// the repo) can prepare items in bulk instead of typing them into admin.
//
//   npm run content -- list activities                  print what's there now
//   npm run content -- import content/x.json            dry run: validate + show plan
//   npm run content -- import content/x.json --commit   actually write
//
// Uses the Firebase Admin SDK with the service-account key from .env.local
// (the same one api/ uses), so it bypasses firestore.rules. Guards in place
// of the rules:
//   - dry run unless --commit
//   - new items are always created as drafts (published: false), so nothing
//     reaches guests until a host ticks "Published" in admin
//   - an item whose name already exists is skipped unless the file says
//     "update": true, which then patches only the fields given
//
// Text only: photos still go through admin, whose upload path strips EXIF
// (see LEGAL_NOTES.md) — this script has no equivalent.
import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import type { Activity } from "../src/types/content.ts";

const ACTIVITY_CATEGORIES = new Set([
  "golf",
  "tennis_padel",
  "beach_club",
  "beach",
  "running",
  "family",
  "fitness",
  "other",
]);

type FieldKind = "string" | "string?" | "number?" | "boolean" | "categories" | "location?";

// Every field an activity document may carry, minus the ones this script
// manages itself (images, order, published, timestamps).
const ACTIVITY_FIELDS: Record<string, FieldKind> = {
  name: "string",
  categories: "categories",
  description_en: "string",
  description_no: "string",
  distanceWalkMin: "number?",
  distanceDriveMin: "number?",
  seasonNote_en: "string?",
  seasonNote_no: "string?",
  openingHours: "string?",
  openOnSunday: "boolean",
  bookingUrl: "string?",
  websiteUrl: "string?",
  hostTip_en: "string?",
  hostTip_no: "string?",
  priceFrom: "number?",
  location: "location?",
};

const ACTIVITY_DEFAULTS: Partial<Activity> = {
  distanceWalkMin: null,
  distanceDriveMin: null,
  seasonNote_en: null,
  seasonNote_no: null,
  openingHours: null,
  openOnSunday: true,
  bookingUrl: null,
  websiteUrl: null,
  hostTip_en: null,
  hostTip_no: null,
  priceFrom: null,
  location: null,
};

const SCHEMAS: Record<string, { fields: Record<string, FieldKind>; defaults: Record<string, unknown> }> = {
  activities: { fields: ACTIVITY_FIELDS, defaults: ACTIVITY_DEFAULTS },
};

function checkField(kind: FieldKind, value: unknown): string | null {
  const optional = kind.endsWith("?");
  if (optional && value === null) return null;
  switch (kind.replace("?", "")) {
    case "string":
      return typeof value === "string" ? null : "must be text";
    case "number":
      return typeof value === "number" && Number.isFinite(value) ? null : "must be a number";
    case "boolean":
      return typeof value === "boolean" ? null : "must be true or false";
    case "categories":
      return Array.isArray(value) && value.length > 0 && value.every((c) => ACTIVITY_CATEGORIES.has(c))
        ? null
        : `must be a non-empty list from: ${[...ACTIVITY_CATEGORIES].join(", ")}`;
    case "location": {
      const p = value as { lat?: unknown; lng?: unknown } | null;
      const ok =
        p !== null &&
        typeof p === "object" &&
        Object.keys(p).sort().join() === "lat,lng" &&
        typeof p.lat === "number" &&
        typeof p.lng === "number" &&
        Math.abs(p.lat) <= 90 &&
        Math.abs(p.lng) <= 180;
      return ok ? null : "must be { \"lat\": number, \"lng\": number }";
    }
  }
  return "unknown field type";
}

/** Returns the problems with one item; empty means it's fine to write. */
function validate(
  item: Record<string, unknown>,
  fields: Record<string, FieldKind>,
  isUpdate: boolean,
): string[] {
  const problems: string[] = [];
  for (const key of Object.keys(item)) {
    if (key === "update") continue;
    const kind = fields[key];
    if (!kind) {
      problems.push(`unknown field "${key}"`);
      continue;
    }
    const problem = checkField(kind, item[key]);
    if (problem) problems.push(`"${key}" ${problem}`);
  }
  if (!isUpdate) {
    for (const [key, kind] of Object.entries(fields)) {
      if (!kind.endsWith("?") && kind !== "boolean" && !(key in item)) problems.push(`missing "${key}"`);
    }
  }
  return problems;
}

function db() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error("Firebase service-account vars missing — is .env.local filled in? (see .env.example)");
  }
  initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
  return getFirestore();
}

const normalize = (name: unknown) => String(name ?? "").trim().toLowerCase();

async function list(collectionName: string) {
  const snap = await db().collection(collectionName).orderBy("order").get();
  const docs = snap.docs.map((d) => {
    // Image objects are long and irrelevant for writing new copy.
    const { images, createdAt, updatedAt, ...rest } = d.data();
    void createdAt;
    void updatedAt;
    return { id: d.id, ...rest, imageCount: Array.isArray(images) ? images.length : 0 };
  });
  console.log(JSON.stringify(docs, null, 2));
}

async function importFile(path: string, commit: boolean) {
  const file = JSON.parse(readFileSync(path, "utf8")) as { collection?: string; items?: unknown[] };
  const schema = file.collection ? SCHEMAS[file.collection] : undefined;
  if (!schema || !file.collection) {
    throw new Error(`"collection" must be one of: ${Object.keys(SCHEMAS).join(", ")}`);
  }
  if (!Array.isArray(file.items) || file.items.length === 0) throw new Error(`"items" must be a non-empty list`);

  const firestore = db();
  const col = firestore.collection(file.collection);
  const existing = await col.get();
  let nextOrder = Math.max(-1, ...existing.docs.map((d) => Number(d.get("order")) || 0)) + 1;

  let failed = false;
  const plan: (() => Promise<unknown>)[] = [];

  for (const raw of file.items as Record<string, unknown>[]) {
    const label = String(raw.name ?? "(no name)");
    const isUpdate = raw.update === true;
    const matches = existing.docs.filter((d) => normalize(d.get("name")) === normalize(raw.name));
    const problems = validate(raw, schema.fields, isUpdate);

    if (problems.length > 0) {
      failed = true;
      console.log(`✗ ${label}\n    ${problems.join("\n    ")}`);
      continue;
    }

    const { update: _update, ...data } = raw;
    void _update;

    if (isUpdate) {
      if (matches.length !== 1) {
        failed = true;
        console.log(`✗ ${label}: "update" needs exactly one existing item with this name, found ${matches.length}`);
        continue;
      }
      const ref = matches[0].ref;
      console.log(`~ update ${label} (${ref.id}): ${Object.keys(data).join(", ")}`);
      plan.push(() => ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() }));
      continue;
    }

    if (matches.length > 0) {
      console.log(`- skip   ${label}: already exists (${matches.map((d) => d.id).join(", ")}). Add "update": true to change it.`);
      continue;
    }

    const order = nextOrder++;
    console.log(`+ create ${label} as a draft`);
    plan.push(() =>
      col.add({
        ...schema.defaults,
        ...data,
        images: [],
        order,
        published: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }),
    );
  }

  if (failed) {
    console.log("\nNothing written: fix the items marked ✗ first.");
    process.exitCode = 1;
    return;
  }
  if (!commit) {
    console.log(`\nDry run — nothing written. Re-run with --commit to apply ${plan.length} change(s).`);
    return;
  }
  for (const step of plan) await step();
  console.log(`\nDone: ${plan.length} change(s) written. New items are drafts — publish them in admin.`);
}

const [command, target, ...flags] = process.argv.slice(2);
const run =
  command === "list" && target
    ? list(target)
    : command === "import" && target
      ? importFile(target, flags.includes("--commit"))
      : Promise.reject(new Error("Usage: list <collection> | import <file.json> [--commit]"));

run.catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
