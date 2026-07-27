import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./config";
import type { HouseShowcase } from "../types/content";

const REF = () => doc(db, "houseShowcase", "main");

export async function getHouseShowcase(): Promise<HouseShowcase | null> {
  const snap = await getDoc(REF());
  return snap.exists() ? (snap.data() as HouseShowcase) : null;
}

export function subscribeHouseShowcase(onData: (data: HouseShowcase | null) => void): () => void {
  return onSnapshot(REF(), (snap) => {
    onData(snap.exists() ? (snap.data() as HouseShowcase) : null);
  });
}

export async function saveHouseShowcase(data: Partial<HouseShowcase>): Promise<void> {
  await setDoc(REF(), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
