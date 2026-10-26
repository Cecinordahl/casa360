# Casa Hoyo 8 Guest Guide

A bilingual (English / Norwegian) guest guide for a holiday home at Hoyo 17,
San Roque Club, Sotogrande. Three surfaces, one Vite + React + TypeScript app:

- **Public guide** — restaurants, groceries, activities, practical info. No
  login, publicly readable.
- **House manual** — WiFi, appliances, house rules, emergency info. Behind a
  single shared guest code (soft protection — see `SCHEMA.md`).
- **Admin panel** — Firebase-authenticated CRUD for everything above, image
  upload with automatic EXIF stripping, drag-and-drop image reordering, and
  guest-code rotation.

There's no traditional backend — the app talks to Firestore directly from
the browser, and `firestore.rules` is the actual access-control layer (see
`RULES.md`). The one exception is images: they're hosted on Cloudinary
rather than Firebase Storage, uploaded via two small Vercel serverless
functions (`api/cloudinary-sign.ts`, `api/cloudinary-delete.ts`) — this is
deliberate, not a shortcut: it keeps the entire Firebase project on the free
"Spark" plan with **no billing account attached at all**, ever. Firebase
Storage requires the paid "Blaze" plan; Cloudinary's free tier doesn't
require a card. See `SCHEMA.md` for the full reasoning.

Because of those two functions, **this project deploys to Vercel
specifically** (not Cloudflare Pages or similar) — they're plain Node.js
serverless functions using the Firebase Admin SDK, which needs a Node
runtime.

Related docs: `SCHEMA.md` (data model), `RULES.md` (deploying security rules
+ managing admins), `LEGAL_NOTES.md` (GDPR risk assessment).

This guide assumes you're comfortable with Java/React but haven't set up a
Firebase project, a serverless function, or a static-site deploy before —
every step below is concrete, not "obviously."

## 1. Prerequisites

- Node.js 20+ and npm (check with `node --version`).
- A Google account to create a free Firebase project.
- A Cloudinary account (free, no card required) for image hosting.
- A GitHub repo for this project (Vercel deploys from Git).

## 2. Create the Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) → "Add
   project". Name it anything (e.g. "hoyo17-guide"). When asked about Google
   Analytics, **turn it off** — this project deliberately ships with no
   analytics (see `LEGAL_NOTES.md`).
2. **Authentication**: left sidebar → Build → Authentication → "Get
   started" → Sign-in method tab → enable **Email/Password**. This is the
   only sign-in method the app uses (for admins only; guests never sign in).
3. **Firestore**: left sidebar → Build → Firestore Database → "Create
   database". Choose a **region in the EU** (e.g. `eur3 (europe-west)`) —
   you're in Norway and guests are likely EU residents, so keeping data in
   the EU is the sensible default (see `LEGAL_NOTES.md`). Start in
   **production mode** (not test mode) — you'll deploy the real rules from
   this repo next, in step 4.
4. **Skip Storage entirely** — there's no Storage bucket in this project.
   That's what keeps the whole Firebase project on the free Spark plan (no
   pay-as-you-go, no card on file, ever): Spark's daily quotas just fail the
   request if exceeded rather than charging you anything. Images are hosted
   on Cloudinary instead (step 3 below).
5. **Register a web app**: Project settings (gear icon) → General → "Your
   apps" → the `</>` (web) icon → give it a nickname → Register app. Firebase
   shows you a `firebaseConfig` object — you'll need five of these values
   shortly. (You don't need Firebase Hosting — this project deploys to
   Vercel instead, see step 10.)
6. **Generate a service account key** (needed by the two Vercel functions to
   check the admin allowlist server-side — this is separate from the web
   app config above): Project settings → Service accounts tab → "Generate
   new private key". This downloads a JSON file. **Treat it like a
   password** — it grants full admin access to your Firebase project. Never
   commit it. You'll need three fields out of it (`project_id`,
   `client_email`, `private_key`) in step 4.

## 3. Create a Cloudinary account

1. Sign up at [cloudinary.com](https://cloudinary.com/) (free plan, no card
   required for signup).
2. Dashboard → you'll see your **Cloud name**, **API Key**, and **API
   Secret** right on the front page (click "reveal" for the secret). You'll
   need all three in the next step. The secret is exactly that — never put
   it in a `VITE_`-prefixed variable or anywhere that ships to the browser;
   it only ever belongs in the Vercel function environment.

## 4. Local setup

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in:

- The five `VITE_FIREBASE_*` values from the `firebaseConfig` object (step
  2.5). These are **not secret** — they identify which Firebase project to
  talk to, not a credential (the real access control is `firestore.rules`).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  (step 3.2) — **no `VITE_` prefix**, these are server-only.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
  from the service account JSON (step 2.6) — also server-only. Paste
  `private_key` exactly as it appears in the JSON file (it already contains
  literal `\n` sequences — leave them as-is, in quotes).

`.env.local` is git-ignored by default, so none of this leaves your machine.

```bash
npm run dev
```

Opens the app at `http://localhost:5173`. The public guide, house manual,
and admin CRUD all work at this point once you deploy rules and seed an
admin (steps 5–6) — but **image upload will not work yet** under plain
`npm run dev`, because Vite's dev server doesn't run the `/api` functions.
To test uploads locally, use the Vercel CLI instead:

```bash
npm install -g vercel
vercel dev
```

`vercel dev` serves the Vite frontend *and* the `/api` functions together
(reading the same `.env.local`), so it's the closest thing to production
you can run on your machine. Use `npm run dev` for everyday frontend work
and `vercel dev` whenever you need to test an upload.

## 5. Deploy the security rules

**Do this before adding any real content.** Follow `RULES.md` in full — it
covers installing the Firebase CLI, connecting it to your project, and
running:

```bash
firebase deploy --only firestore:rules
```

## 6. Create your admin account

Also covered in detail in `RULES.md` ("Adding an admin"), in short:

1. Firebase Console → Authentication → Users → Add user (your email + a
   password).
2. Copy that user's UID.
3. Firestore Database → create collection `admins` → document ID = that UID
   → fields `email` (string) and `addedAt` (timestamp, now).

Now go to `/admin/login` in the running app and sign in. You should land on
the admin dashboard. If you see "this account isn't on the admin allowlist,"
double check the document ID in `admins` matches your UID exactly.

## 7. Seed the house manual

The first time you (as admin) open **Admin → House manual**, the app
automatically generates the first shared guest code and creates empty
section documents for you — there's nothing manual to seed by hand. Fill in
the WiFi password, arrival instructions, etc. there, and note the generated
code (shown at the top of that page) to give to guests.

## 8. Add real content

Admin → Restaurants / Groceries / Activities / Practical info: use "+ New
item" on each. Fill in both EN and NO fields — the admin list flags any item
with an incomplete translation. Add photos via the image section of each
item's edit form (appears once the item has been saved once); drag
thumbnails to reorder them. Remember: uploading photos needs `vercel dev`
locally, or the deployed site (next step) — not plain `npm run dev`.

## 9. Build

```bash
npm run build
```

This runs `tsc -b && vite build`. Output goes to the **`dist/`** folder —
that's the "build output directory" Vercel uses below. `npm run preview`
serves that `dist/` folder locally if you want to sanity-check a production
build (note: same as `npm run dev`, `preview` won't serve `/api` either —
use `vercel dev` for that).

## 10. Deploy — Vercel

1. Push this repo to GitHub if it isn't already there.
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub → "Add New…"
   → "Project" → import this repo.
3. Vercel auto-detects Vite for the frontend and auto-detects the `/api`
   folder as serverless functions — no extra config needed. Confirm these
   build settings (should already be filled in):
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
4. Before clicking Deploy, expand **Environment Variables** and add **all
   eight**:
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
     `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
     `VITE_FIREBASE_APP_ID` — same five as `.env.local`.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
     — for the private key, Vercel's environment variable field accepts
     multi-line values directly, so you can paste the whole
     `-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----` block
     including real line breaks, rather than the escaped `\n` form.

   Without the `VITE_*` ones the deployed site builds fine but Firebase
   calls fail at runtime, since Vite bakes `import.meta.env.VITE_*` values
   in **at build time** — set them before you deploy, and re-deploy
   (Vercel → Deployments → "Redeploy") if you ever change one. Without the
   server-only ones, image upload fails with a 500 from `/api/cloudinary-sign`
   (check Vercel → Deployments → your deployment → Functions logs if that
   happens).
5. Click Deploy. You get a `*.vercel.app` URL. Add a custom domain later via
   Project Settings → Domains, if you have one.

## 11. Authorize your deployed domain in Firebase

Firebase Authentication only allows sign-in from domains you've explicitly
allowed. Firebase Console → Authentication → Settings → Authorized domains →
add your `*.vercel.app` URL (and any custom domain later). Without this,
admin login will fail on the live site even though it worked on
`localhost`.

## Everyday maintenance

- **Editing content**: just use the admin panel at `/admin` — no redeploy
  needed, Firestore updates show up immediately (the public guide uses live
  `onSnapshot` listeners, not a build-time data fetch).
- **Changing code** (this repo): push to your Git branch — Vercel redeploys
  automatically on push to the connected branch (this includes changes to
  `api/*.ts`).
- **Rotating the guest code**: Admin → House manual → "Rotate guest code."
  No redeploy needed, this is a data operation (see `SCHEMA.md`).
- **Changing security rules**: edit `firestore.rules`, then
  `firebase deploy --only firestore:rules` (see `RULES.md`). This does NOT
  happen automatically on git push — it's a separate, deliberate step.
- **Rotating the Cloudinary API secret or the Firebase service account
  key**: update the corresponding environment variable in Vercel → Project
  Settings → Environment Variables, then redeploy (Deployments →
  "Redeploy" on the latest deployment, or just push a commit).

## Tech stack

React 19 + TypeScript + Vite, Firebase (Auth + Firestore only — no Storage),
Cloudinary (image hosting) with two Vercel Node.js serverless functions
gating uploads/deletes via the Firebase Admin SDK, react-router-dom,
react-i18next, @dnd-kit (drag-and-drop image/list reordering).

## Ideas for later versions (not in scope now)

Deliberately not built yet — noted here so they don't get lost, not a
commitment or a roadmap:

- **Auto-translate admin fields**: when an admin fills in the Norwegian side
  of a bilingual field and leaves English blank (or vice versa), auto-fill
  the empty side via machine translation as an editable draft rather than
  leaving it blank. If this happens, use **DeepL's free API tier**
  specifically — unlike Google Translate/Azure, it doesn't require a
  pay-as-you-go billing account (hard monthly character cap, then requests
  just fail instead of billing you — same fails-safe shape as Cloudinary).
  The "missing translation" badge in the admin UI would need to become
  "auto-translated, not yet reviewed" rather than strictly "empty," and a
  human should still skim auto-filled text before publishing — machine
  translation is fine for factual copy, shakier for a host's personal tone
  in tips/notes.
- (Add more here as they come up.)
