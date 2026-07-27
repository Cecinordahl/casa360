import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { HOUSE_MANUAL_SECTION_KEYS } from "../types/content";
import type { AppConfig, HouseManualSectionBody, HouseManualSectionKey } from "../types/content";

export async function getAppConfig(): Promise<AppConfig | null> {
  const snap = await getDoc(doc(db, "appConfig", "settings"));
  return snap.exists() ? (snap.data() as AppConfig) : null;
}

export async function getSectionBody(
  code: string,
  key: HouseManualSectionKey,
): Promise<HouseManualSectionBody | null> {
  const snap = await getDoc(doc(db, "houseManual", code, "sections", key));
  return snap.exists() ? (snap.data() as HouseManualSectionBody) : null;
}

export async function saveSectionBody(
  code: string,
  key: HouseManualSectionKey,
  data: Partial<HouseManualSectionBody>,
): Promise<void> {
  await setDoc(
    doc(db, "houseManual", code, "sections", key),
    { key, images: [], ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/**
 * Rotates the shared guest code: copies every section document from the
 * current code's path to a brand-new one, points appConfig at the new
 * code, then deletes the old path. All in a single batch, so guests never
 * see a half-migrated manual. See SCHEMA.md "Guest-code gate design" for
 * why rotation has to work this way instead of just changing one field.
 */
export async function rotateGuestCode(newCode: string): Promise<void> {
  const config = await getAppConfig();
  const oldCode = config?.currentGuestCode;

  const batch = writeBatch(db);

  if (oldCode) {
    const oldSectionsSnap = await getDocs(collection(db, "houseManual", oldCode, "sections"));
    oldSectionsSnap.forEach((sectionDoc) => {
      batch.set(doc(db, "houseManual", newCode, "sections", sectionDoc.id), sectionDoc.data());
      batch.delete(sectionDoc.ref);
    });
  } else {
    // First-ever setup: seed empty bodies for all fixed section keys.
    HOUSE_MANUAL_SECTION_KEYS.forEach((key) => {
      batch.set(doc(db, "houseManual", newCode, "sections", key), {
        key,
        body_en: "",
        body_no: "",
        images: [],
        order: HOUSE_MANUAL_SECTION_KEYS.indexOf(key),
      });
    });
  }

  batch.set(
    doc(db, "appConfig", "settings"),
    { currentGuestCode: newCode, updatedAt: serverTimestamp() },
    { merge: true },
  );

  await batch.commit();
}
