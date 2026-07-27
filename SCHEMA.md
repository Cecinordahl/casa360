# Firestore data model

This document defines the collections, fields, and access-control shape for the
guide before any UI is built. See `firestore.rules` for the enforced version
of the access rules described here, and `RULES.md` for how to deploy them.

**Images are not stored in Firebase.** This project deliberately keeps
Firestore + Auth on Firebase's free "Spark" plan (no billing account
attached, ever — hitting a quota fails the request instead of costing
money). Firebase Storage requires the paid "Blaze" plan, so image hosting
lives on Cloudinary instead (generous free tier, no card required) via a
signed-upload flow — see "Image objects" below and `api/cloudinary-sign.ts`.

## Conventions used throughout

- **Bilingual fields**: any host-written prose field is stored as two flat
  fields, `<field>_en` and `<field>_no` (not a nested map), per the project
  brief. Proper nouns (restaurant names, WiFi SSID, etc.) are stored once,
  untranslated.
- **`order` field**: every list a guest sees (restaurants, groceries,
  activities, practicalInfo items, houseManualSections, and each item's
  `images` array) carries an explicit numeric `order` field. The admin UI's
  drag-and-drop reordering rewrites this field; the UI always sorts by it
  rather than relying on Firestore's natural/insertion order.
- **`published` field**: boolean, defaults to `true`. Lets a co-host save a
  draft item (e.g. still missing a translation or a photo) without it
  appearing on the public guide. Admin list views show unpublished items with
  a visible "draft" badge; public queries filter `published == true`.
- **Timestamps**: `createdAt`, `updatedAt` (Firestore `serverTimestamp()`).
- **Images**: embedded as an array on the owning document (not a separate
  top-level collection) — see [Image objects](#image-objects) below.
- Every collection below is top-level unless noted otherwise.

## Image objects

Embedded in the `images: ImageItem[]` field of any content document:

```ts
interface ImageItem {
  publicId: string; // Cloudinary public_id, e.g. "restaurants/{docId}/{uuid}"
  url: string;       // Cloudinary secure_url
  order: number;     // display order within this item's gallery
  alt_en?: string;
  alt_no?: string;
}
```

Upload flow (see `src/utils/image.ts`): the browser strips EXIF (including
GPS) itself by re-encoding the image on a canvas — see `LEGAL_NOTES.md` —
then calls `api/cloudinary-sign.ts` (a Vercel serverless function) for a
short-lived signature, then uploads the stripped image bytes **directly to
Cloudinary** (not through our function — keeps large file bytes off our
serverless function entirely). The sign function verifies the caller against
the `/admins` allowlist using the Firebase Admin SDK before handing out a
signature, so upload is still cryptographically admin-only, just enforced by
that function instead of a Storage security rule. Deleting an image goes
through `api/cloudinary-delete.ts`, which performs the same admin check and
then calls Cloudinary's destroy API itself.

## `restaurants`

| Field | Type | Notes |
|---|---|---|
| `name` | string | not translated |
| `description_en` / `description_no` | string | |
| `cuisineTags` | string[] | fixed vocabulary (e.g. `spanish`, `seafood`, `tapas`, `italian`, `international`); labels are translated in the UI via i18n, not per-item |
| `priceLevel` | number (1–4) | rendered as €–€€€€ |
| `distanceWalkMin` | number \| null | minutes on foot from the house |
| `distanceDriveMin` | number \| null | minutes by car |
| `openingHours` | string | free text, e.g. `"Tue–Sun 13:00–16:00, 20:00–23:30, closed Mon"` — not translated, it's just times |
| `openOnSunday` | boolean | drives the Sunday filter |
| `mapUrl` | string \| null | |
| `websiteUrl` | string \| null | |
| `hostNote_en` / `hostNote_no` | string \| null | host's personal recommendation |
| `images` | ImageItem[] | |
| `order` | number | |
| `published` | boolean | |
| `createdAt` / `updatedAt` | timestamp | |

## `groceries`

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `type` | `"supermarket" \| "small_shop" \| "pharmacy" \| "other"` | |
| `distanceWalkMin` / `distanceDriveMin` | number \| null | |
| `openingHours` | string | |
| `openOnSunday` | boolean | |
| `mapUrl` | string \| null | |
| `note_en` / `note_no` | string \| null | |
| `images` | ImageItem[] | |
| `order`, `published`, `createdAt`, `updatedAt` | | |

## `activities`

Golf courses, tennis/padel, beach clubs, beaches, running routes, and
everything else guests might want to do.

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `categories` | string[] | fixed vocabulary: `golf`, `tennis_padel`, `beach_club`, `beach`, `running`, `family`, `fitness`, `other` — this is what the filter UI facets on |
| `description_en` / `description_no` | string | |
| `distanceWalkMin` / `distanceDriveMin` | number \| null | |
| `seasonNote_en` / `seasonNote_no` | string \| null | e.g. "closed Nov–Feb" — free text, so bilingual |
| `openingHours` | string \| null | |
| `openOnSunday` | boolean | |
| `bookingUrl` / `websiteUrl` | string \| null | |
| `hostTip_en` / `hostTip_no` | string \| null | |
| `images` | ImageItem[] | |
| `order`, `published`, `createdAt`, `updatedAt` | | |

## `practicalInfo`

Nearest pharmacy, doctor, ATM, petrol station, airports, the marina — the
"area facts" list.

| Field | Type | Notes |
|---|---|---|
| `kind` | `"pharmacy" \| "doctor" \| "atm" \| "petrol_station" \| "airport" \| "port" \| "other"` | |
| `name` | string | |
| `distanceKm` | number \| null | straight-line/drive distance, e.g. Málaga airport |
| `driveMin` | number \| null | |
| `note_en` / `note_no` | string \| null | |
| `mapUrl` | string \| null | |
| `order`, `published`, `createdAt`, `updatedAt` | | |

## House-manual sections: fixed list, no separate metadata collection

The seven sections (`arrival`, `wifi`, `climate`, `appliances`,
`commonAreas`, `rulesPractical`, `emergency`) are a fixed enum, not
admin-creatable content — there's no "add a new section" feature, so their
titles are ordinary static UI strings in `src/i18n/locales/{en,no}.json`
(`manual.sections.*`), not per-item Firestore fields. This intentionally
avoids a second collection whose only job would be to hold a title guests
never see rendered any differently from the fixed label anyway. Only the
actual body content — which genuinely is host-authored and needs a
translation workflow — lives in Firestore, gated (see below).

## `houseManual/{guestCode}/sections/{sectionKey}` — the gated content

This is the one collection whose **path**, not just its rules, enforces the
guest-code gate (see [Guest-code gate design](#guest-code-gate-design)
below). Each document:

| Field | Type | Notes |
|---|---|---|
| `key` | same enum as above, matches the doc ID | |
| `body_en` / `body_no` | string | the actual manual text (arrival instructions, WiFi troubleshooting, pool rules, etc.); supports simple line breaks, rendered as plain paragraphs |
| `wifiSsid` / `wifiPassword` | string \| null | only populated on the `wifi` doc; dedicated fields so the UI can show a copy-to-clipboard button instead of guests copy-pasting out of prose |
| `hostPhone` / `hospitalName` / `hospitalMapUrl` | string \| null | only populated on the `emergency` doc |
| `images` | ImageItem[] | e.g. a photo of the router, the fuse box, the bin storage area. Uploaded to the stable Cloudinary folder `houseManual/{sectionKey}/...` — **not** under the rotating code — so images never need re-uploading when the code rotates, only the Firestore doc referencing them gets copied |
| `order` | number | fixed by section key; not currently reorderable in the admin UI (the 7 sections aren't user-addable, so there's nothing to drag) |
| `updatedAt` | timestamp | |

## `appConfig/settings` (single document)

Admin-only, never publicly readable — this is the one doc that must stay
locked down, since it's what the guest-gate rule checks against.

| Field | Type | Notes |
|---|---|---|
| `currentGuestCode` | string | the live shared code; changing this is what "rotating the code" means |
| `updatedAt` | timestamp | |

## `admins/{uid}` (allowlist, referenced by rules)

Not really "content" — this is the allowlist the security rules consult to
decide who can write. One document per admin, doc ID = their Firebase Auth
UID, e.g. `{ email: "cecilie@example.com", addedAt: <timestamp> }`. See
`RULES.md` for how to add a co-host here.

## Guest-code gate design

The brief is explicit that a shared code is **soft protection** and asks for
the least-bad implementable pattern given "no backend server." Here's the
reasoning:

Firestore Security Rules can only see three things about an incoming read: the
**document path** being requested, the caller's **auth token/claims**, and
(for list queries) the query's filters. There is no way to hand a rule an
arbitrary "here's the code the guest typed" value on a plain document read —
that would require either a signed-in session with a custom claim (which
needs a server or Cloud Function to mint) or a callable Cloud Function that
checks the code itself. The brief explicitly names both as options; this
project avoids Cloud Functions to stay on the free static-hosting + Firestore
plan with nothing to deploy/maintain server-side.

That leaves the **document path itself** as the only channel available to a
plain client-side Firestore read. So the gated content lives at
`houseManual/{code}/sections/{sectionKey}` — the code is literally a path
segment. The rule (see `firestore.rules`) allows the read only if `{code}`
equals `appConfig/settings.currentGuestCode`, fetched inside the rule via
`get()` (rule-internal reads are not subject to `appConfig`'s own — locked
down — rules, so this doesn't require making `appConfig` public).

Practically: the guest-manual screen asks the visitor for the code, then
reads `houseManual/{enteredCode}/sections/*`. If the code is wrong, every
read in that path 404s/permission-denies — there's no separate "is this code
valid" check to leak information either way.

**Consequence of this design — rotation isn't free.** Because content lives
*at* the code path rather than behind a separate lookup, rotating the code
means the admin panel must copy all `houseManualSections` documents from the
old code path to the new one (a single Firestore batched write — there are
only ~7 section docs, well under the 500-write batch limit) before flipping
`appConfig.currentGuestCode` and deleting the old path. The admin "rotate
code" button does all of this as one operation; see the admin panel
implementation.

**Being honest about the residual risk** (also called out in code comments
and README): this only keeps the manual out of search engines and away from
people who don't have the code. It does **not** rate-limit guesses — someone
who wanted to brute-force a short/numeric code by hammering Firestore reads
technically could, since Firestore itself doesn't throttle per-caller read
attempts. Mitigation: use a long-ish random code (e.g. 8+ mixed
alphanumeric characters, not a 4-digit PIN) — the admin UI's code generator
defaults to this. This is not equivalent to a real per-guest login and should
never be treated as one.
