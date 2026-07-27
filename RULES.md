# Deploying security rules & managing admins

This assumes you've never touched Firebase Security Rules before. It covers
two things: (1) deploying `firestore.rules` so it's actually enforced, and
(2) adding/removing an admin (yourself or a co-host).

There's no `storage.rules` in this project — images are hosted on Cloudinary,
not Firebase Storage, specifically so the whole Firebase project can stay on
the free "Spark" plan with no billing account attached (see `SCHEMA.md` and
`LEGAL_NOTES.md`). Upload access there is enforced by `api/cloudinary-sign.ts`
(a Vercel function checking the same `/admins` allowlist this file describes
below), not by a Firebase rule.

## Why this matters

There's no traditional backend server in this project — the React app talks
to Firestore directly from the browser (the only server-side code at all is
the two small Vercel functions handling Cloudinary uploads). That means
**`firestore.rules` is the only thing standing between "anyone on the
internet" and your Firestore data**. Firebase projects start in a test mode
that allows all reads/writes for 30 days; if you never deploy this rules
file, that's what you're running on. Deploy it before you put any real
content in.

## One-time setup: Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

This opens a browser to sign into the Google account that owns your Firebase
project.

From the repo root, connect this folder to your Firebase project (replace
`your-project-id` with the actual project ID from the Firebase console —
Project settings → General → Project ID):

```bash
firebase use --add
```

Pick your project when prompted, and give it the alias `default`. This
writes a `.firebaserc` file (safe to commit — it just names the project ID,
not a secret). `firebase.json` already exists in this repo and points at
`firestore.rules` / `firestore.indexes.json`, so there's no need to run
`firebase init` — that would only risk overwriting these files with fresh
defaults.

## Deploying the rules

Any time you change `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

That's it — this pushes the rules file to your live project. There's no
build step and no downtime. You can also paste the file's contents directly
into the Firebase Console (Firestore Database → Rules tab) and click
"Publish" if you'd rather not use the CLI — functionally identical, just
more manual and easier to forget to keep in sync with the repo.

**Do this now, before adding real content**, so you're never running on
Firebase's default test-mode rules (which allow anyone to read/write
everything).

## Adding an admin

The app treats "signed in with Firebase Auth" and "is an admin" as two
different things on purpose (see the `isAdmin()` comment in
`firestore.rules`) — creating a Firebase Auth account is easy for anyone who
has your web app's config, so the actual gate is a separate allowlist: a
document in the `admins` collection, keyed by that person's Firebase Auth
UID.

Adding an admin is a two-step process:

**Step 1 — create their login.**
Firebase Console → Authentication → Users → "Add user". Enter their email
and a temporary password (tell them to change it after first login — this
app doesn't currently have a "reset password" UI flow, so for now do this
via Console → Users → the "⋮" menu → "Reset password" if needed).

**Step 2 — allowlist their UID.**
Copy the UID shown next to the user you just created in the Authentication →
Users list. Then, Firebase Console → Firestore Database → Start collection
(or open the existing) `admins` collection → Add document:

- Document ID: paste the UID exactly (this is what the rule checks —
  `exists(/databases/.../admins/$(request.auth.uid))`)
- Fields: `email` (string, their email, for your own reference when looking
  at the list later), `addedAt` (timestamp, now)

That's it — no redeploy needed, this is data, not rules. They can now log
into the admin panel, and both their Firestore writes (checked by
`firestore.rules`) and their Cloudinary image uploads (checked independently
by `api/cloudinary-sign.ts` against this same `admins` collection) will be
allowed.

**Why this can't be done from the admin panel itself:** the rules
deliberately block writes to `/admins` from the client (`allow write: if
false`), even for existing admins. If they could write it from the app, a
single compromised admin session could grant itself (or an attacker)
permanent access with no out-of-band trace. Doing it via the Console/CLI
means it always requires access to the actual Firebase project, not just a
logged-in browser tab.

## Removing an admin

Delete their document from the `admins` collection (Console → Firestore →
`admins` → find their doc by UID → delete). Optionally also disable or
delete their user in Authentication → Users if they should no longer be able
to log in at all.

## Rotating the shared house-manual code

This happens from inside the app (Admin → House Manual → "Rotate guest
code"), not here — it's a Firestore *data* operation (copying documents,
then updating `appConfig/settings.currentGuestCode`), not a rules change, so
there's nothing to deploy. See `SCHEMA.md` → "Guest-code gate design" for why
rotation needs to copy content rather than just changing one field.

## Sanity-checking your rules

Firebase Console → Firestore Database → Rules tab has a "Rules playground"
where you can simulate a read/write as a specific (or anonymous) user
against a specific path, without touching real data. Useful checks before
trusting a deploy:

- Simulate a **read** on `/restaurants/anything` as **unauthenticated** →
  should be **allowed**.
- Simulate a **read** on `/appConfig/settings` as **unauthenticated** →
  should be **denied**.
- Simulate a **write** on `/restaurants/anything` as **unauthenticated** →
  should be **denied**.
- Simulate a **read** on `/houseManual/wrong-code/sections/wifi` as
  unauthenticated → should be **denied**.

This playground only covers `firestore.rules`. To sanity-check the Cloudinary
upload gate, try uploading a photo in the admin panel while logged out (or
logged in as a non-admin account) — the browser network tab should show
`api/cloudinary-sign` returning 403, and no file should reach Cloudinary.
