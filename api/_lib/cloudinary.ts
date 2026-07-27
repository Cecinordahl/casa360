import { createHash } from "node:crypto";

/**
 * Cloudinary's signing algorithm: sort every param that will be sent to the
 * upload/destroy API (except file, cloud_name, resource_type, api_key),
 * join as "key=value&key=value...", append the API secret, SHA-1 it. The
 * client must send back exactly the params that were signed here — adding
 * or dropping one on the client side makes Cloudinary reject the signature.
 */
export function signCloudinaryParams(params: Record<string, string | number>): string {
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) throw new Error("CLOUDINARY_API_SECRET is not set");

  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(toSign + secret).digest("hex");
}

export function cloudinaryEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey) throw new Error("Cloudinary env vars are not set");
  return { cloudName, apiKey };
}
