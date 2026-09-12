# Toviho Segun David — Portfolio & Project Studio

A premium dark-studio developer portfolio with a **hidden, password-protected admin
dashboard** at `/admin`. Projects are stored in MongoDB Atlas, published from the
dashboard, and appear on the public site instantly — no code changes, no redeploy.

**Live:** https://my-portfolio-tqxt.vercel.app · **Admin:** `…/admin` (not linked anywhere)

> Read **SETUP.md** first — it walks through MongoDB Atlas, the first admin login,
> Vercel Blob, Formspree and deployment in ~15 minutes.

---

## Stack

- **React 19 + TypeScript + Vite 8**
- **Motion** (the new home of Framer Motion) for every animation
- **Express 5** API, deployed as a Vercel serverless function (`api/index.ts`)
- **MongoDB Atlas** for projects + the admin account
- **Vercel Blob** for uploaded screenshots (inline fallback when unconfigured)
- **Formspree** for the contact form (mail-client fallback when unconfigured)

## Scripts

```bash
npm run dev        # Vite + API together (web :5173, api :8787)
npm run dev:web    # frontend only
npm run dev:api    # API only
npm run build      # typecheck + production build
npm run typecheck  # tsc across app, server and api
npm run lint       # oxlint
node scripts/smoke.mjs   # headless-browser smoke test + screenshots (needs the dev server)
```

## Structure

```
api/index.ts            Vercel serverless entry (same Express app as dev)
server/                 Express app: auth, projects CRUD, upload, seed, health
  app.ts                all routes
  auth.ts               scrypt password hashing + HS256 JWT
  db.ts                 Mongo client + store abstraction (Mongo ⇄ in-memory)
  memory-db.ts          local-only dev store (ENABLE_DEV_MEMORY_DB=true)
shared/                 types + seed projects used by BOTH server and client
src/
  components/
    layout/             navbar (scroll-aware), footer, site shell
    sections/           hero, about, projects, skills, experience, contact
    projects/           project card + designed no-image placeholder
    ui/                 preloader, cursor, masked text, magnetic button, …
  admin/                hidden dashboard: login, overview, projects, settings
  context/              public project provider
  lib/                  api client, motion presets, cursor store
  styles/               design tokens + public + admin stylesheets
scripts/smoke.mjs       Playwright smoke test that screenshots every surface
screenshots/            output of the smoke test
```

## How the pieces behave

### Public site
- Cinematic preloader → word-mask hero reveal → scroll-driven section animations,
  parallax, magnetic buttons, custom cursor ("VIEW" over project tiles), marquee.
- Custom cursor + heavy parallax are disabled on touch devices and when the
  visitor prefers reduced motion.
- Project grid: first two tiles render as large editorial cards, the rest as a
  5-column rhythm; filters animate with shared layout transitions.

### Images — the important rule
The site **never generates artwork**. `Project.image` is optional:
- image present → lazy-loaded screenshot with a zoom-on-hover and clip-path reveal
- image missing → `<ProjectPlaceholder />`: dark engineered surface, oversized
  initials, scanning line, "Preview coming soon" chip. The card still looks finished.
Broken image URLs fall back to the same placeholder automatically.

### Cards handle every data combination
| image | live | github | result |
| --- | --- | --- | --- |
| ✔ | ✔ | ✔ | full media + both actions |
| ✔ | ✘ | any | media + "Live demo unavailable" chip |
| ✘ | ✔ | any | placeholder + live action |
| ✘ |  | ✘ | placeholder, name, story, tech only |

### Admin (`/admin`)
- Hidden from navigation; login required (scrypt-hashed password, signed JWT).
- First run: one-time bootstrap with the server's `SETUP_TOKEN`.
- Dashboard: totals (published / drafts / missing images / links), recent projects,
  system health.
- Projects: search, status + missing-image filters, ↑ ↓ ordering, edit drawer with
  drag-and-drop image upload, drafts that stay invisible publicly, delete with a
  confirmation modal.
- Settings: connection status, env-var reference, one-click seed of the launch
  projects.
- Admin code is lazy-loaded — public visitors never download it.

### Local development without any cloud
With `ENABLE_DEV_MEMORY_DB=true` (already in `.env.local`) the API keeps everything
in memory so you can exercise the whole admin flow offline. Setting `MONGODB_URI`
switches to Atlas automatically; in production the flag is ignored.

## Design tokens

| Role | Value |
| --- | --- |
| Background | `#0B0D0F` |
| Surface | `#171A1D` |
| Forest (deep accent) | `#12372A` |
| Text | `#F5F3EE` |
| Muted text | `#A7A7A0` |
| Electric lime accent | `#C8FF3D` |

Type: Space Grotesk (display) · Inter (body) · JetBrains Mono (labels/code).
Lime is used surgically — CTAs, states, stats, small highlights — never as a wash.

## Content

All copy, links and statistics were carried over from the previous portfolio
(https://my-portfolio-tqxt.vercel.app) and extended with DAVICELL and
Fluffy'n'Yummy Mall. Nothing was invented; numbers live in `src/data/site.ts`
and can be adjusted there.
