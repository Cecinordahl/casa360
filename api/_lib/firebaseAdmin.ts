// Server-only Firebase Admin setup used by the /api functions to verify a
// caller is (a) a real signed-in Firebase user and (b) on the /admins
// allowlist, before handing out anything Cloudinary-related. Never import
// this from src/ — it needs FIREBASE_PRIVATE_KEY, a real secret that must
// only ever live in Vercel's server-side environment variables, never in
// the Vite-bundled client env (see .env.example for the public/private
// split).
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function adminApp() {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel's env var UI stores newlines as literal "\n" — undo that.
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * Verifies the Firebase ID token in `Authorization: Bearer <token>` and
 * checks the resulting UID against the /admins allowlist (the same check
 * firestore.rules' isAdmin() does, just re-implemented here because Admin
 * SDK calls bypass security rules entirely and must enforce this
 * themselves). Returns the admin's UID, or null if the caller isn't one.
 */
export async function requireAdminUid(authHeader: string | undefined): Promise<string | null> {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) return null;

  try {
    const decoded = await getAuth(adminApp()).verifyIdToken(token);
    const adminDoc = await getFirestore(adminApp()).doc(`admins/${decoded.uid}`).get();
    return adminDoc.exists ? decoded.uid : null;
  } catch {
    return null;
  }
}
