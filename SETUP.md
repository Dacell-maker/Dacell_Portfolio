# Setup Guide — Portfolio + Admin System

Everything the public site needs runs **without any setup** (it serves the bundled
project list as read-only "preview data"). This guide connects the pieces that make
`/admin` real: MongoDB Atlas (projects), Vercel Blob (images), Formspree (contact form).

Estimated time: **15–20 minutes**, most of it copy-pasting.

---

## 0. Run it locally

```bash
npm install
npm run dev          # starts Vite (5173) + the API (8787) together
```

Open http://localhost:5173 for the portfolio and http://localhost:5173/admin for the dashboard.

While `ENABLE_DEV_MEMORY_DB=true` is in `.env.local`, the admin dashboard is fully
usable locally with an **in-memory** store (data resets when the server restarts).
Once MongoDB Atlas is connected below, that flag is ignored automatically.

---

## 1. MongoDB Atlas (where projects live)

1. Create a free account at https://cloud.mongodb.com and build a **free M0 cluster**
   (any region close to you, e.g. `eu-west-1`).
2. **Database Access → Add New Database User**
   - username: `portfolio-admin`
   - password: generate a strong one and save it somewhere safe.
3. **Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`).
   (Vercel serverless functions rotate IPs, so this is required.)
4. **Database → Connect → Drivers** → copy the connection string:

   ```
   mongodb+srv://portfolio-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. Replace `<password>` with the real password. That full string is your `MONGODB_URI`.

Collections (`projects`, `users`) and their indexes are created automatically the
first time the API needs them.

---

## 2. Environment variables

Set these in **two places**: `.env.local` for local development, and
**Vercel → Project → Settings → Environment Variables** for production
(copy to Production, Preview *and* Development).

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | ✅ | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority` | From step 1 |
| `MONGODB_DB` | optional | `portfolio` | Defaults to `portfolio` |
| `JWT_SECRET` | ✅ | *long random string* | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SETUP_TOKEN` | ✅ (once) | *any secret string* | Used exactly once to create the first admin account |
| `BLOB_READ_WRITE_TOKEN` | recommended | `vercel_blob_...` | Step 4. Without it, images are stored inline in Mongo (works, but heavier) |
| `VITE_FORMSPREE_ID` | optional | `xyzabcde` | Step 5. Without it the contact form opens the visitor's mail app |

`.env.local` is git-ignored. **Never commit real values.**

After changing env vars: restart `npm run dev` locally, and redeploy on Vercel
(env changes need a fresh deployment).

---

## 3. Create your admin account (one time)

1. Visit `https://<your-domain>/admin` (or `/admin/login`).
2. Because no admin exists yet, you'll see **“Create your admin account”**.
3. Fill in name, email, and a password of 8+ characters.
4. **Setup token:** this is the `SETUP_TOKEN` value from your server environment —
   *not* something you make up:
   - **Local (`npm run dev`):** open `.env.local` in the project root. A fresh copy of
     this repo ships with `SETUP_TOKEN=local-setup-token`, so type exactly
     `local-setup-token` (no quotes, no spaces). If your `.env.local` is missing,
     copy `.env.example` to `.env.local`, set the value, and **restart `npm run dev`**
     (env vars are only read when the server starts).
   - **Vercel:** whatever you entered in Settings → Environment Variables, then redeploy.
5. Submit → you're signed in and the dashboard opens.

The endpoint refuses to run a second time, so nobody else can create an admin.
After this, **rotate or remove `SETUP_TOKEN`** in your env vars for extra safety
(the dashboard keeps working with just `JWT_SECRET`).

If you ever forget the password: delete the document in the Atlas `users`
collection (or drop the collection) and repeat step 3 with a new `SETUP_TOKEN`.

### Seed the eight launch projects

On first login the database is empty. Two options:

- **Settings → Data tools → “Seed bundled projects”** — inserts DAVICELL,
  Fluffy'n'Yummy Mall and the six projects from your old portfolio, in the right
  order, with real links and **no images** (that's intentional).
- Or start clean and add projects yourself with **Add project**.

Seeding never overwrites a project that already exists, so it is safe to press twice.

---

## 4. Vercel Blob (project screenshots on a CDN)

1. Vercel dashboard → your project → **Storage → Create Database → Blob**.
2. Open the store → **Connect** → copy the `BLOB_READ_WRITE_TOKEN`.
3. Add it to your environment variables and redeploy.

Uploads from **/admin → Add/Edit project** now go to the CDN and the project saves
the public URL. Without the token, uploads still work — the image is stored inline
in MongoDB (fine for a handful of screenshots, but set Blob up when you can).

**No image is ever generated for you.** If you skip the upload, the public card
shows the designed “Preview coming soon” placeholder and the layout stays perfect.

---

## 5. Formspree (contact form → your inbox)

1. Sign up at https://formspree.io and create a form pointing at
   `davidsegun044@gmail.com`.
2. Copy the form id (the part after `https://formspree.io/f/`).
3. Set `VITE_FORMSPREE_ID=<that id>` and redeploy.

Until then the form falls back to opening the visitor's email client — same
behaviour as your old site.

---

## 6. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Vercel → **Add New → Project** → import the repo.
   - Framework preset: **Vite** (auto-detected)
   - Build command: `npm run build` · Output: `dist`
3. Add all env vars from step 2 (Production + Preview).
4. Deploy. `/api/*` is served by `api/index.ts` (the same Express app used in dev),
   and every other path rewrites to the SPA via `vercel.json`.

Your hidden admin lives at `https://<your-domain>/admin`. It is **not linked
anywhere** in the public navigation.

---

## 7. Your CV

Drop your PDF into `public/` named exactly `Toviho-Segun-David-CV.pdf` — the
“Download CV” button in the contact section already points at it. Delete the button
in `src/components/sections/Contact.tsx` if you'd rather not ship a CV.

---

## 8. Everyday workflow

1. Build something cool.
2. `/admin` → **Projects → Add project**.
3. Name + short description (required). Screenshot optional. Live URL + GitHub optional.
4. Choose **Published** (visible instantly) or **Draft** (hidden until you're ready).
5. Set the display order with the ↑ ↓ arrows in the table.
6. Done — the public portfolio updates on the next visit. No code, no redeploy.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| “preview data” badge on the projects section | `MONGODB_URI` missing/wrong, or Atlas Network Access blocking. Check **Settings** in the admin for live status. |
| Login page says “Database not connected” | Same as above — env vars not loaded. Restart the dev server / redeploy after editing them. |
| “Authentication is not configured” | `JWT_SECRET` missing. |
| Upload warns “stored inline” | Add `BLOB_READ_WRITE_TOKEN`. |
| Admin works locally but not on Vercel | Env vars were added after the last deploy — redeploy. |
| Login shows “answered with a web page instead of JSON” | The `/api` serverless function isn't routed. Make sure `vercel.json` (with the `/api/:path*` rewrite) and `api/index.ts` (default export) are in the repo, then redeploy. Check Vercel → Deployments → Functions to confirm `api/index` exists. |
| “Create your admin account” appears on Vercel after it existed locally | Correct and expected: the local dev admin lives in the throwaway in-memory store. The real admin lives in Atlas — create it once (anywhere) and the same login works on Vercel *and* locally, as long as both use the same `MONGODB_URI`. |
| Forgot admin password | Delete the doc in Atlas `users`, then recreate via `/admin/login` with `SETUP_TOKEN`. |

## Security notes

- Passwords are stored as salted scrypt hashes; sessions are signed JWTs
  (`JWT_SECRET`), 12-hour expiry, kept in the browser's localStorage for the
  admin only.
- Login returns identical errors for unknown email and wrong password
  (no account enumeration).
- `/admin` endpoints require a valid token; project data endpoints validate and
  sanitise every field server-side.
- This is a single-admin system by design. If you ever need multiple editors,
  add rows to the `users` collection and extend the login flow.
