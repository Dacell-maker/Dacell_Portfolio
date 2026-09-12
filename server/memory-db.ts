import type { Project } from '../shared/types';

/**
 * Minimal in-memory stand-in for the MongoDB collections.
 *
 * It exists so that `npm run dev` gives you a fully working /admin (create,
 * edit, delete, reorder, upload, login) with zero infrastructure. It is NOT a
 * production store: data lives only for the lifetime of the dev server and is
 * never enabled when MONGODB_URI is present.
 */

type Doc = Record<string, unknown>;

export interface AdminUserLike extends Doc {
  _id?: unknown;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface MemoryCollection<T> {
  find(filter?: (doc: T) => boolean): {
    sort(compare: (a: T, b: T) => number): { toArray(): Promise<T[]> };
    toArray(): Promise<T[]>;
  };
  findOne(filter: (doc: T) => boolean): Promise<T | null>;
  insertOne(doc: T): Promise<{ insertedId: string }>;
  updateOne(
    filter: (doc: T) => boolean,
    changes: Partial<T>,
    options?: { upsert?: boolean },
  ): Promise<{ upsertedCount: number; matchedCount: number }>;
  deleteOne(filter: (doc: T) => boolean): Promise<{ deletedCount: number }>;
  countDocuments(): Promise<number>;
  all(): T[];
}

function createCollection<T>(seed: T[] = [], prefix = 'doc'): MemoryCollection<T> {
  let rows: T[] = [...seed];
  let counter = 0;

  return {
    find(filter = () => true) {
      const rows$ = rows.filter(filter);
      const finish = (list: T[]) => ({ toArray: async () => list.map((row) => ({ ...row })) });
      return {
        sort: (compare: (a: T, b: T) => number) => finish([...rows$].sort(compare)),
        toArray: async () => rows$.map((row) => ({ ...row })),
      };
    },
    async findOne(filter) {
      const found = rows.find(filter);
      return found ? { ...found } : null;
    },
    async insertOne(doc) {
      const _id = (doc as { _id?: unknown })._id ?? `${prefix}-${++counter}`;
      rows.push({ ...(doc as object), _id } as unknown as T);
      return { insertedId: String(_id) };
    },
    async updateOne(filter, changes, options) {
      const index = rows.findIndex(filter);
      if (index === -1) {
        if (!options?.upsert) return { upsertedCount: 0, matchedCount: 0 };
        const _id = (changes as { _id?: unknown })._id ?? `${prefix}-${++counter}`;
        rows.push({ ...(changes as object), _id } as unknown as T);
        return { upsertedCount: 1, matchedCount: 0 };
      }
      rows[index] = { ...rows[index], ...changes } as T;
      return { upsertedCount: 0, matchedCount: 1 };
    },
    async deleteOne(filter) {
      const index = rows.findIndex(filter);
      if (index === -1) return { deletedCount: 0 };
      rows.splice(index, 1);
      return { deletedCount: 1 };
    },
    async countDocuments() {
      return rows.length;
    },
    all() {
      return rows.map((row) => ({ ...row }));
    },
  };
}

export const memoryProjects = createCollection<Project>([], 'p');
export const memoryUsers = createCollection<AdminUserLike>([], 'u');
