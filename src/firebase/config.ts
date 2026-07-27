import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// All values come from Vite env vars (see .env.example / README.md).
// These are safe to expose to the browser: Firebase web config is not a
// secret, it just identifies which project to talk to. The real security
// boundary is firestore.rules. There is no Firebase Storage bucket in this
// project on purpose — see LEGAL_NOTES.md / README.md for why images are
// hosted on Cloudinary instead, which keeps this whole project on Firebase's
// free "Spark" plan (no billing account attached, ever).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
