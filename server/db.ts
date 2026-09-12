import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';
import type { Project } from '../shared/types.ts';
import { config, hasDatabase, isMemoryDb } from './config.ts';
import { memoryProjects, memoryUsers } from './memory-db.ts';

/**
 * One cached client. Serverless invocations reuse it while the container is
 * warm, which keeps Atlas connection counts sane.
 *
 * When MongoDB is not configured and ENABLE_DEV_MEMORY_DB=true, a tiny
 * in-memory store is used instead so the admin dashboard is fully usable
 * during local development.
 */
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let db: Db | null = null;

export interface AdminUserDoc extends Record<string, unknown> {
  _id?: unknown;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export async function getDb(): Promise<Db | null> {
  if (!config.mongodbUri) return null;
  if (db) return db;

  if (!clientPromise) {
    client = new MongoClient(config.mongodbUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    });
    clientPromise = client.connect();
  }

  const connected = await clientPromise;
  db = connected.db(config.dbName);
  return db;
}

export async function isDatabaseReady(): Promise<boolean> {
  if (isMemoryDb) return true;
  if (!hasDatabase) return false;

  try {
    const database = await getDb();
    if (!database) return false;
    await database.command({ ping: 1 });
    return true;
  } catch {
    clientPromise = null;
    client = null;
    db = null;
    return false;
  }
}

export async function ensureIndexes(): Promise<void> {
  if (isMemoryDb) return;
  const database = await getDb();
  if (!database) return;
  await database.collection<Project>('projects').createIndex({ displayOrder: 1 });
  await database.collection<Project>('projects').createIndex({ status: 1 });
  await database.collection<AdminUserDoc>('users').createIndex({ email: 1 }, { unique: true });
}

/** Mongo documents -> API shape (string ids, sane defaults). */
export function serializeProject(doc: Partial<Project> & { _id?: unknown }): Project {
  const { _id, ...rest } = doc;
  return {
    _id:
      typeof _id === 'string'
        ? _id
        : String((_id as unknown as { toString(): string } | undefined)?.toString?.() ?? ''),
    name: rest.name ?? 'Untitled project',
    category: rest.category ?? 'Web App',
    shortDescription: rest.shortDescription ?? '',
    fullDescription: rest.fullDescription,
    image: rest.image ?? null,
    imageAlt: rest.imageAlt,
    liveUrl: rest.liveUrl ?? null,
    githubUrl: rest.githubUrl ?? null,
    extraLabel: rest.extraLabel,
    extraUrl: rest.extraUrl ?? null,
    technologies: Array.isArray(rest.technologies) ? rest.technologies : [],
    status: rest.status === 'draft' ? 'draft' : 'published',
    featured: Boolean(rest.featured),
    year: rest.year,
    displayOrder: typeof rest.displayOrder === 'number' ? rest.displayOrder : 99,
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
  };
}

/* ==========================================================================
   Store abstraction
   --------------------------------------------------------------------------
   Both the MongoDB driver and the in-memory dev store are adapted to this
   small interface so the route handlers stay readable and storage-agnostic.
   ========================================================================== */

export type Filter = Record<string, unknown>;
export type SortSpec = Record<string, 1 | -1>;

export interface Store<T> {
  find(filter: Filter, sort?: SortSpec): Promise<T[]>;
  findOne(filter: Filter): Promise<T | null>;
  insert(doc: T): Promise<string>;
  updateOne(filter: Filter, changes: Record<string, unknown>): Promise<number>;
  findOneAndUpdate(filter: Filter, changes: Record<string, unknown>): Promise<T | null>;
  deleteOne(filter: Filter): Promise<number>;
  count(): Promise<number>;
}

function matches(doc: Record<string, unknown>, filter: Filter): boolean {
  return Object.entries(filter).every(([key, value]) => String(doc[key]) === String(value));
}

function compareBy<T>(sort?: SortSpec) {
  return (a: T, b: T): number => {
    if (!sort) return 0;
    const leftDoc = a as unknown as Record<string, unknown>;
    const rightDoc = b as unknown as Record<string, unknown>;
    for (const [key, direction] of Object.entries(sort)) {
      const left = leftDoc[key];
      const right = rightDoc[key];
      if (left === right) continue;
      if (left === undefined || left === null) return 1;
      if (right === undefined || right === null) return -1;
      const result = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right));
      if (result !== 0) return direction === -1 ? -result : result;
    }
    return 0;
  };
}

export async function projectsStore(): Promise<Store<Project> | null> {
  if (isMemoryDb) {
    const collection = memoryProjects;
    return {
      find: async (filter, sort) =>
        (await collection
          .find((doc) => matches(doc as unknown as Record<string, unknown>, filter))
          .sort(compareBy<Project>(sort))
          .toArray()) as Project[],
      findOne: async (filter) =>
        (await collection.findOne((doc) =>
          matches(doc as unknown as Record<string, unknown>, filter),
        )) as Project | null,
      insert: async (doc) => (await collection.insertOne(doc)).insertedId,
      updateOne: async (filter, changes) =>
        (
          await collection.updateOne(
            (doc) => matches(doc as unknown as Record<string, unknown>, filter),
            changes as Partial<Project>,
          )
        ).matchedCount,
      findOneAndUpdate: async (filter, changes) => {
        await collection.updateOne(
          (doc) => matches(doc as unknown as Record<string, unknown>, filter),
          changes as Partial<Project>,
        );
        return (await collection.findOne((doc) =>
          matches(doc as unknown as Record<string, unknown>, filter),
        )) as Project | null;
      },
      deleteOne: async (filter) =>
        (
          await collection.deleteOne((doc) =>
            matches(doc as unknown as Record<string, unknown>, filter),
          )
        ).deletedCount,
      count: () => collection.countDocuments(),
    };
  }

  const database = await getDb();
  if (!database) return null;

  const collection = database.collection<Project>('projects');
  return {
    find: (filter, sort) =>
      collection
        .find(filter as never)
        .sort((sort ?? {}) as never)
        .toArray(),
    findOne: (filter) => collection.findOne(filter as never),
    insert: async (doc) => {
      const { _id, ...rest } = doc as Project & { _id?: unknown };
      const result = await collection.insertOne(rest as never);
      return String(result.insertedId);
    },
    updateOne: async (filter, changes) =>
      (await collection.updateOne(filter as never, { $set: changes } as never)).matchedCount,
    findOneAndUpdate: async (filter, changes) => {
      const updated = await collection.findOneAndUpdate(filter as never, { $set: changes } as never, {
        returnDocument: 'after',
      });
      return (updated ?? null) as Project | null;
    },
    deleteOne: async (filter) => (await collection.deleteOne(filter as never)).deletedCount,
    count: () => collection.countDocuments(),
  };
}

export async function usersStore(): Promise<Store<AdminUserDoc> | null> {
  if (isMemoryDb) {
    const collection = memoryUsers;
    return {
      find: async (filter, sort) =>
        (await collection
          .find((doc) => matches(doc, filter))
          .sort(compareBy<AdminUserDoc>(sort))
          .toArray()) as AdminUserDoc[],
      findOne: async (filter) => (await collection.findOne((doc) => matches(doc, filter))) as AdminUserDoc | null,
      insert: async (doc) => String((await collection.insertOne(doc as never)).insertedId),
      updateOne: async (filter, changes) =>
        (await collection.updateOne((doc) => matches(doc, filter), changes)).matchedCount,
      findOneAndUpdate: async (filter, changes) => {
        await collection.updateOne((doc) => matches(doc, filter), changes);
        return (await collection.findOne((doc) => matches(doc, filter))) as AdminUserDoc | null;
      },
      deleteOne: async (filter) => (await collection.deleteOne((doc) => matches(doc, filter))).deletedCount,
      count: () => collection.countDocuments(),
    };
  }

  const database = await getDb();
  if (!database) return null;

  const collection = database.collection<AdminUserDoc>('users');
  return {
    find: (filter, sort) =>
      collection
        .find(filter as never)
        .sort((sort ?? {}) as never)
        .toArray(),
    findOne: (filter) => collection.findOne(filter as never) as Promise<AdminUserDoc | null>,
    insert: async (doc) => {
      const { _id, ...rest } = doc as AdminUserDoc;
      void _id;
      const result = await collection.insertOne(rest as never);
      return String(result.insertedId);
    },
    updateOne: async (filter, changes) =>
      (await collection.updateOne(filter as never, { $set: changes } as never)).matchedCount,
    findOneAndUpdate: async (filter, changes) => {
      const updated = await collection.findOneAndUpdate(filter as never, { $set: changes } as never, {
        returnDocument: 'after',
      });
      return (updated ?? null) as AdminUserDoc | null;
    },
    deleteOne: async (filter) => (await collection.deleteOne(filter as never)).deletedCount,
    count: () => collection.countDocuments(),
  };
}
