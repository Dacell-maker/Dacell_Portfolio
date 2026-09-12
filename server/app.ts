import express from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ObjectId } from 'mongodb';
import type { Project } from '../shared/types.ts';
import { seedProjects } from '../shared/seed.ts';
import { config, hasBlob, hasDatabase, isMemoryDb } from './config.ts';
import { hashPassword, signToken, verifyPassword, verifyToken } from './auth.ts';
import {
  ensureIndexes,
  isDatabaseReady,
  projectsStore,
  serializeProject,
  usersStore,
} from './db.ts';


/* ------------------------------------------------------------------ helpers */

const wrap =
  (handler: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    handler(req, res).catch(next);
  };

const now = () => new Date().toISOString();

function toId(value: string | string[]): ObjectId | string | null {
  if (Array.isArray(value)) value = value[0] ?? '';
  if (ObjectId.isValid(value)) return new ObjectId(value);
  // Seed documents use readable ids such as "seed-davicell".
  return typeof value === 'string' && value.length > 0 && value.length < 128 ? value : null;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function nullableUrl(value: unknown): string | null {
  const url = str(value);
  if (!url) return null;
  return /^(https?:\/\/|mailto:|\/)/i.test(url) ? url : `https://${url}`;
}

function strArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => str(item)).filter(Boolean).slice(0, 24);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 24);
  }
  return [];
}

function clampOrder(value: unknown, fallback = 99): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(9999, Math.round(parsed)));
}

/** Builds a clean project document from untrusted request input. */
function buildProject(body: Record<string, unknown>, fallbackOrder: number): Project {
  return {
    _id: '',
    name: str(body.name).slice(0, 120),
    category: str(body.category, 'Web App').slice(0, 60),
    shortDescription: str(body.shortDescription).slice(0, 600),
    fullDescription: str(body.fullDescription) ? str(body.fullDescription).slice(0, 4000) : undefined,
    image: str(body.image) ? str(body.image) : null,
    imageAlt: str(body.imageAlt) ? str(body.imageAlt).slice(0, 200) : undefined,
    liveUrl: nullableUrl(body.liveUrl),
    githubUrl: nullableUrl(body.githubUrl),
    extraLabel: str(body.extraLabel) ? str(body.extraLabel).slice(0, 40) : undefined,
    extraUrl: nullableUrl(body.extraUrl),
    technologies: strArray(body.technologies),
    status: body.status === 'draft' ? 'draft' : 'published',
    featured: body.featured === true || body.featured === 'true',
    year: str(body.year) ? str(body.year).slice(0, 8) : undefined,
    displayOrder: clampOrder(body.displayOrder, fallbackOrder),
    createdAt: now(),
    updatedAt: now(),
  };
}

function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : str(req.body?.token);

  if (!config.jwtSecret) {
    res.status(503).json({ error: 'Authentication is not configured. Set JWT_SECRET in your environment variables.' });
    return;
  }
  if (!token) {
    res.status(401).json({ error: 'Sign in required.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }

  res.locals.admin = { email: String(payload.email ?? ''), name: String(payload.name ?? '') };
  next();
}

function requireDatabase(res: Response): boolean {
  if (hasDatabase) return true;
  res.status(503).json({
    error: 'MongoDB is not connected yet. Add MONGODB_URI to your environment variables (see SETUP.md).',
  });
  return false;
}

/* --------------------------------------------------------------------- app */

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));

/* Health ------------------------------------------------------------------ */

app.get(
  '/api/health',
  wrap(async (_req, res) => {
    const database = await isDatabaseReady();
    res.json({
      ok: true,
      database,
      memory: isMemoryDb,
      blob: hasBlob,
      configured: Boolean(hasDatabase && config.jwtSecret),
      mode: database ? (isMemoryDb ? 'memory' : 'database') : 'seed-fallback',
    });
  }),
);

/* Public projects ---------------------------------------------------------- */

app.get(
  '/api/projects',
  wrap(async (_req, res) => {
    if (!hasDatabase) {
      res.json({
        projects: seedProjects.filter((project) => project.status === 'published'),
        source: 'seed-fallback',
      });
      return;
    }

    try {
      const store = await projectsStore();
      if (!store) throw new Error('no store');
      const docs = await store.find({ status: 'published' }, { displayOrder: 1, createdAt: -1 });
      res.json({ projects: docs.map(serializeProject), source: isMemoryDb ? 'memory' : 'database' });
    } catch {
      res.json({
        projects: seedProjects.filter((project) => project.status === 'published'),
        source: 'seed-fallback',
      });
    }
  }),
);

/* Auth --------------------------------------------------------------------- */

app.get(
  '/api/auth/status',
  wrap(async (_req, res) => {
    if (!hasDatabase) {
      res.json({ configured: false, needsAdmin: true, database: false });
      return;
    }
    const users = await usersStore();
    const count = users ? await users.count() : 0;
    res.json({ configured: true, needsAdmin: count === 0, database: true, memory: isMemoryDb });
  }),
);

app.post(
  '/api/auth/login',
  wrap(async (req, res) => {
    if (!requireDatabase(res)) return;

    const email = str(req.body?.email).toLowerCase();
    const password = str(req.body?.password);
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const users = await usersStore();
    const user = users ? await users.findOne({ email }) : null;

    // Same error for "no such user" and "wrong password" — no account enumeration.
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Incorrect email or password.' });
      return;
    }

    const token = signToken({ sub: String(user._id), email: user.email, name: user.name });
    res.json({ token, user: { email: user.email, name: user.name } });
  }),
);

app.get('/api/auth/me', authenticate, (_req, res) => {
  res.json({ user: res.locals.admin });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ ok: true });
});

/* One-time bootstrap of the first admin ------------------------------------ */

app.post(
  '/api/admin/setup',
  wrap(async (req, res) => {
    if (!requireDatabase(res)) return;
    if (!config.setupToken) {
      res.status(503).json({ error: 'SETUP_TOKEN is not configured on the server.' });
      return;
    }
    if (str(req.body?.setupToken) !== config.setupToken) {
      res.status(403).json({ error: 'Invalid setup token.' });
      return;
    }

    const users = await usersStore();
    if (!users) {
      res.status(503).json({ error: 'Database unavailable.' });
      return;
    }
    if ((await users.count()) > 0) {
      res.status(409).json({ error: 'An admin already exists. Sign in instead.' });
      return;
    }

    const name = str(req.body?.name, 'Admin').slice(0, 80);
    const email = str(req.body?.email).toLowerCase();
    const password = str(req.body?.password);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Enter a valid email address.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters.' });
      return;
    }

    await users.insert({
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: now(),
    });
    await ensureIndexes().catch(() => undefined);

    const token = signToken({ sub: email, email, name });
    res.status(201).json({ token, user: { email, name } });
  }),
);

/* Seed bundled projects ---------------------------------------------------- */

app.post(
  '/api/admin/seed',
  authenticate,
  wrap(async (req, res) => {
    if (!requireDatabase(res)) return;
    const store = await projectsStore();
    if (!store) {
      res.status(503).json({ error: 'Database unavailable.' });
      return;
    }

    let inserted = 0;
    for (const project of seedProjects) {
      const existing = await store.findOne({ _id: project._id });
      if (existing) continue;

      await store.insert({ ...project, updatedAt: now() });
      inserted += 1;
    }

    await ensureIndexes().catch(() => undefined);
    const total = await store.count();
    void req;
    res.json({ inserted, total });
  }),
);

/* Image upload ------------------------------------------------------------- */

app.post(
  '/api/admin/upload',
  authenticate,
  express.raw({ type: 'multipart/form-data', limit: '8mb' }),
  wrap(async (req, res) => {
    if (!req.body || !(req.body instanceof Buffer) || req.body.length === 0) {
      res.status(400).json({ error: 'No file received.' });
      return;
    }

    const contentType = req.header('content-type') ?? 'multipart/form-data';
    const request = new Request('http://localhost/api/admin/upload', {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: new Uint8Array(req.body),
    });
    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      res.status(400).json({ error: 'A file field named "file" is required.' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      res.status(413).json({ error: 'Image must be smaller than 8 MB.' });
      return;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = file.type || 'image/png';

    // Preferred path: Vercel Blob (CDN hosted, keeps the database small).
    if (hasBlob) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`projects/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '-')}`, buffer, {
        access: 'public',
        contentType: type,
        addRandomSuffix: true,
        token: config.blobToken,
      });
      res.status(201).json({ url: blob.url, storage: 'blob' });
      return;
    }

    // Fallback: store the image inline so the admin still works before Blob is set up.
    res.status(201).json({
      url: `data:${type};base64,${buffer.toString('base64')}`,
      storage: 'inline',
      warning:
        'Vercel Blob is not configured (BLOB_READ_WRITE_TOKEN), so this image is stored inline in the database. Add the token for CDN-hosted images.',
    });
  }),
);

/* Admin: projects CRUD ------------------------------------------------------ */

app.get(
  '/api/admin/projects',
  authenticate,
  wrap(async (_req, res) => {
    if (!requireDatabase(res)) return;
    const store = await projectsStore();
    if (!store) {
      res.status(503).json({ error: 'Database unavailable.' });
      return;
    }
    const docs = await store.find({}, { displayOrder: 1, createdAt: -1 });
    res.json({ projects: docs.map(serializeProject), source: isMemoryDb ? 'memory' : 'database' });
  }),
);

app.post(
  '/api/admin/projects',
  authenticate,
  wrap(async (req, res) => {
    if (!requireDatabase(res)) return;
    const store = await projectsStore();
    if (!store) {
      res.status(503).json({ error: 'Database unavailable.' });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    if (!str(body.name)) {
      res.status(400).json({ error: 'Project name is required.' });
      return;
    }

    const count = await store.count();
    const project = buildProject(body, count + 1);
    const { _id, ...rest } = project;
    void _id;

    const insertedId = await store.insert(rest as Project);
    res.status(201).json(serializeProject({ ...rest, _id: insertedId }));
  }),
);

/** Reorder must be registered before "/:id" so it is not treated as an id. */
app.post(
  '/api/admin/projects/reorder',
  authenticate,
  wrap(async (req, res) => {
    if (!requireDatabase(res)) return;
    const store = await projectsStore();
    if (!store) {
      res.status(503).json({ error: 'Database unavailable.' });
      return;
    }

    const ids = Array.isArray(req.body?.ids) ? (req.body.ids as unknown[]).map((id) => str(id)) : [];
    if (!ids.length) {
      res.status(400).json({ error: 'Provide an "ids" array in the new order.' });
      return;
    }

    for (let index = 0; index < ids.length; index += 1) {
      const id = toId(ids[index]);
      if (!id) continue;
      await store.updateOne({ _id: id }, { displayOrder: index + 1 });
    }

    // Any project not included in the payload keeps a stable position after
    // the reordered ones (so partial reorders never produce duplicate orders).
    const untouched = await store.find({});
    const seen = new Set(ids.map((id) => String(id)));
    let tail = ids.length;
    for (const doc of untouched) {
      if (seen.has(String(doc._id))) continue;
      tail += 1;
      await store.updateOne({ _id: doc._id }, { displayOrder: tail });
    }

    const docs = await store.find({}, { displayOrder: 1 });
    res.json({ projects: docs.map(serializeProject) });
  }),
);

app.patch(
  '/api/admin/projects/:id',
  authenticate,
  wrap(async (req, res) => {
    if (!requireDatabase(res)) return;
    const store = await projectsStore();
    if (!store) {
      res.status(503).json({ error: 'Database unavailable.' });
      return;
    }

    const id = toId(req.params.id);
    if (!id) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = { updatedAt: now() };
    const fields = [
      'name',
      'category',
      'shortDescription',
      'fullDescription',
      'image',
      'imageAlt',
      'liveUrl',
      'githubUrl',
      'extraLabel',
      'extraUrl',
      'technologies',
      'status',
      'featured',
      'year',
      'displayOrder',
    ] as const;

    for (const field of fields) {
      if (!(field in body)) continue;
      switch (field) {
        case 'liveUrl':
        case 'githubUrl':
        case 'extraUrl':
          patch[field] = nullableUrl(body[field]);
          break;
        case 'image':
          patch.image = str(body.image) ? str(body.image) : null;
          break;
        case 'technologies':
          patch.technologies = strArray(body.technologies);
          break;
        case 'status':
          patch.status = body.status === 'draft' ? 'draft' : 'published';
          break;
        case 'featured':
          patch.featured = body.featured === true || body.featured === 'true';
          break;
        case 'displayOrder':
          patch.displayOrder = clampOrder(body.displayOrder);
          break;
        default:
          patch[field] = typeof body[field] === 'string' ? str(body[field]) : body[field];
      }
    }

    const updated = await store.findOneAndUpdate({ _id: id }, patch);

    if (!updated) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json(serializeProject(updated));
  }),
);

app.delete(
  '/api/admin/projects/:id',
  authenticate,
  wrap(async (req, res) => {
    if (!requireDatabase(res)) return;
    const store = await projectsStore();
    if (!store) {
      res.status(503).json({ error: 'Database unavailable.' });
      return;
    }

    const id = toId(req.params.id);
    if (!id) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const deleted = await store.deleteOne({ _id: id });
    if (deleted === 0) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json({ ok: true });
  }),
);

/* Errors ------------------------------------------------------------------- */

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[api]', error);
  res.status(500).json({ error: error.message || 'Unexpected server error.' });
});

/** Vercel serverless entry (`export const app` is supported by @vercel/node). */
export default app;
