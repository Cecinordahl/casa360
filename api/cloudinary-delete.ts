import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUid } from "./_lib/firebaseAdmin.js";
import { cloudinaryEnv, signCloudinaryParams } from "./_lib/cloudinary.js";

/**
 * Unlike upload, delete is small (just a public_id string) so this function
 * calls Cloudinary's destroy API itself rather than handing the client a
 * signature — one less thing the client needs to get right, and the API
 * secret still never leaves the server.
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

  const publicId = typeof req.body?.publicId === "string" ? req.body.publicId : null;
  if (!publicId) {
    res.status(400).json({ error: "Missing publicId" });
    return;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = signCloudinaryParams({ public_id: publicId, timestamp });
  const { cloudName, apiKey } = cloudinaryEnv();

  const form = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  const cloudinaryRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body: form },
  );

  if (!cloudinaryRes.ok) {
    res.status(502).json({ error: "Cloudinary delete failed" });
    return;
  }

  res.status(200).json({ ok: true });
}
