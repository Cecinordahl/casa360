import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUid } from "./_lib/firebaseAdmin";
import { cloudinaryEnv, signCloudinaryParams } from "./_lib/cloudinary";

/**
 * Called by src/utils/image.ts before every upload. Verifies the caller is
 * an allowlisted admin (see _lib/firebaseAdmin.ts), then hands back a
 * short-lived signature so the browser can upload the file bytes *directly*
 * to Cloudinary (not through this function — keeps us well under Vercel's
 * serverless payload limits and avoids paying for bandwidth we don't need
 * to touch). The API secret never leaves this function.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const uid = await requireAdminUid(req.headers.authorization);
  if (!uid) {
    res.status(403).json({ error: "Not an admin" });
    return;
  }

  const folder = typeof req.body?.folder === "string" ? req.body.folder : null;
  if (!folder || folder.includes("..")) {
    res.status(400).json({ error: "Invalid folder" });
    return;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = signCloudinaryParams({ folder, timestamp });
  const { cloudName, apiKey } = cloudinaryEnv();

  res.status(200).json({ cloudName, apiKey, timestamp, signature, folder });
}
