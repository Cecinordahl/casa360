# Legal / GDPR notes

Not legal advice — a plain-language risk assessment of what this app does
with personal data, and what's been done in the code to reduce the risk.
You (the host) are the data controller; Google/Firebase, Cloudinary (image
hosting), and Vercel (hosting + the two serverless functions) are
processors. If you're ever unsure, a lawyer, not this file, has the final
word.

## What personal data this app actually touches

1. **Admin account emails** (Firebase Authentication) — you and any
   co-hosts. This is the main real personal data in the system.
2. **EXIF metadata in uploaded photos**, potentially including GPS
   coordinates, camera/phone model, and timestamp. Mitigated — see below.
3. **Hosting/access logs** — Vercel and Firebase log IP addresses for
   security/operational purposes as any web host does. This is normal and
   covered by their own privacy terms as processors; it's not something
   this app's code controls, but worth knowing it exists.
4. **The shared guest code is deliberately NOT personal data** — it's one
   password shared by every guest of the property, never tied to a name,
   booking, or reservation. This was a deliberate design choice specifically
   to avoid having to track "which guest has this code," which would have
   turned a convenience feature into a second identity system with its own
   GDPR obligations.

Guests browsing the public guide or house manual never create an account,
enter their name, or submit any data — there is no guest-facing form
anywhere in this app.

## Lawful basis

Admin email storage: **legitimate interest** (GDPR Art. 6(1)(f)) — necessary
to operate the shared editing tool, limited to the minimum data needed
(email address only), for people who've opted in to help run the property.
See `src/pages/public/PrivacyPage.tsx` for the guest-facing wording.

## EXIF stripping — implemented, not just documented

`src/utils/image.ts` (`stripExifAndResize`) decodes every uploaded image
onto an HTML canvas and re-encodes it as a fresh JPEG before it's uploaded
to Cloudinary. Canvas pixel data carries no metadata channel, so this is a
real strip, not a "hope the library respects a flag" situation — nothing
else in the pipeline (`ImageManager.tsx`, `ItemForm.tsx`) can bypass it,
because `uploadImage()` is the only path that uploads anywhere. (Cloudinary
also strips metadata from uploaded images by default on its end, so this is
belt-and-suspenders rather than the only line of defense.)

**Residual risk this does NOT cover**: EXIF stripping removes metadata, not
pixel content. If someone uploads a photo that itself *shows* an
identifiable person (a guest's face, a car's license plate, etc.), that
photo is still personal data about that person by virtue of what's visible
in it — stripping EXIF doesn't change that. Since this app's photos are meant
to be of the house, pool, golf course views, and local restaurants, this
should rarely come up, but it's the host's judgment call at upload time, not
something code can enforce. Don't upload identifiable photos of guests
without their consent.

## Liability disclaimer — implemented

`src/components/Disclaimer.tsx` renders on every public guide list page
(restaurants, groceries, activities) stating that recommendations are
provided in good faith, may change, and aren't guarantees. This addresses
the real risk that a restaurant's Sunday hours or a golf course's booking
link goes stale and a guest relies on it.

## Things flagged but not fully solved by code — decide these when you set up Firebase

- **Data residency / region**: when you create the Firestore database, pick
  an EU region (e.g. `eur3 (europe-west)`) rather than a US one, since you
  (the controller) are in Norway and guests are likely EU residents. This is
  a one-time choice made in the Firebase Console when the database is
  created — the code doesn't and can't set this after the fact, so do it at
  setup time. See `README.md`.
- **Firebase project creation offers to enable Google Analytics by
  default** — decline it. The brief explicitly asks for no analytics by
  default; this app's code never initializes the Analytics SDK, but if you
  click through Firebase's setup wizard too fast you could still enable GA
  at the *project* level for no reason. Skip that step.
- **Google as a sub-processor**: Firebase Authentication and Firestore are
  run by Google. This is normal for a Firebase-based app and covered by
  Google's own data processing terms, but it's worth being aware that admin
  emails and (briefly, in EU-region infrastructure) all app data pass
  through Google Cloud infrastructure.
- **Cloudinary as a sub-processor**: images (potentially including photos
  showing identifiable people, if a host ever uploads one — see above) are
  stored on Cloudinary's infrastructure rather than Google's, specifically
  to avoid Firebase Storage's mandatory paid plan (see `SCHEMA.md`). Check
  Cloudinary's own data processing terms and choose a data-center region
  there too if that option is available on your plan.
- **OpenStreetMap map tiles**: the map view on the activities page loads
  its map images from `tile.openstreetmap.org`, so a guest's browser sends
  its IP address (and the page as referrer) to the OpenStreetMap
  Foundation's servers — but only once the guest taps "Map"; Leaflet isn't
  even downloaded before then. No cookies, no account. This is mentioned on
  the privacy page. If you ever expect heavy traffic, OSM's tile usage
  policy asks you to switch to a commercial tile provider instead.
- **The Firebase service account key** (`FIREBASE_PRIVATE_KEY` and friends,
  used by `api/*.ts`) grants full administrative access to your Firebase
  project — broader than any single admin account. It's not personal data
  itself, but treat it with at least as much care as a password: only ever
  store it in Vercel's environment variables (never in the repo, never in a
  `VITE_`-prefixed variable that would ship to the browser), and rotate it
  via Firebase Console → Service accounts if you ever suspect it's leaked.
- **No cookie consent banner** is included, and none is needed as currently
  built — there are no cookies and no analytics. If you ever add analytics,
  make it opt-in and cookieless (e.g. a self-hosted, non-cookie tool) rather
  than adding a consent banner to justify tracking; that was an explicit
  requirement in the brief and is the simpler compliant path anyway.

## If you add anything later

Adding a booking form, a contact form, a mailing list signup, or real guest
accounts would all introduce new categories of personal data (names, phone
numbers, individual guest identity tied to the house-manual code) and would
need this document — and likely the privacy policy — revisited before
shipping. None of that is in this MVP's scope.
