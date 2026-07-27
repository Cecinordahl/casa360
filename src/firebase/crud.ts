import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "./config";
import type { BaseItem } from "../types/content";

/** Live public list: published items only, sorted by `order`. Used by the
 * public guide pages. */
export function subscribePublished<T extends BaseItem>(
  collectionName: string,
  onData: (items: T[]) => void,
): () => void {
  const q = query(
    collection(db, collectionName),
    where("published", "==", true),
    orderBy("order", "asc"),
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
  });
}

/** Live full list (drafts included) for the admin panel. */
export function subscribeAll<T extends BaseItem>(
  collectionName: string,
  onData: (items: T[]) => void,
): () => void {
  const q = query(collection(db, collectionName), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
  });
}

export async function nextOrder(collectionName: string): Promise<number> {
  const snap = await getDocs(collection(db, collectionName));
  let max = -1;
  snap.forEach((d) => {
    const order = (d.data() as DocumentData).order;
    if (typeof order === "number" && order > max) max = order;
  });
  return max + 1;
}

export async function createItem(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<string> {
  const order = await nextOrder(collectionName);
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    order,
    published: data.published ?? true,
    images: data.images ?? [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateItem(
  collectionName: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItem(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

/** Persists a new display order after a drag-and-drop reorder in the admin
 * UI — rewrites the `order` field on every affected document in one batch. */
export async function reorderItems(
  collectionName: string,
  orderedIds: string[],
): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, collectionName, id), { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}
