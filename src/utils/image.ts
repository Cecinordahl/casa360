import { auth } from "../firebase/config";
import type { ImageItem } from "../types/content";

const MAX_DIMENSION = 2000; // px, keeps uploads reasonable on Cloudinary's free tier
const JPEG_QUALITY = 0.85;

/**
 * Strips EXIF (including GPS) from an uploaded photo by decoding it and
 * re-encoding the raw pixels onto a canvas. Canvas image data has no
 * metadata channel, so whatever the browser draws is all that comes back
 * out — this is a deliberate, real strip, not a "hope for the best."
 * (Cloudinary also strips metadata on its own by default, so this is
 * belt-and-suspenders — see LEGAL_NOTES.md.)
 */
async function stripExifAndResize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

async function authHeader(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  return `Bearer ${await user.getIdToken()}`;
}

/** The upload-signing function isn't running (local `npm run dev`). */
export class UploadUnavailableError extends Error {
  constructor() {
    super("Upload signing endpoint not available");
  }
}

/**
 * Uploads directly from the browser to Cloudinary (not through our Vercel
 * function — that only ever hands out a short-lived signature, see
 * api/cloudinary-sign.ts). This keeps image bytes off our serverless
 * function entirely, so there's no payload-size limit to worry about and
 * no bandwidth cost on our side.
 */
export async function uploadImage(
  collection: string,
  docId: string,
  file: File,
  order: number,
): Promise<ImageItem> {
  const cleanBlob = await stripExifAndResize(file);

  const signRes = await fetch("/api/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: await authHeader() },
    body: JSON.stringify({ folder: `${collection}/${docId}` }),
  });
  // Plain `npm run dev` doesn't serve api/, so the request 404s.
  if (signRes.status === 404) throw new UploadUnavailableError();
  if (!signRes.ok) throw new Error("Could not get an upload signature");
  const { cloudName, apiKey, timestamp, signature, folder } = await signRes.json();

  const form = new FormData();
  form.append("file", cleanBlob, "image.jpg");
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
  const uploaded = await uploadRes.json();

  return { publicId: uploaded.public_id, url: uploaded.secure_url, order };
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await fetch("/api/cloudinary-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: await authHeader() },
      body: JSON.stringify({ publicId }),
    });
  } catch {
    // Already gone, or a hiccup — either way, not worth blocking the
    // admin's edit on cleaning up a Cloudinary asset.
  }
}
