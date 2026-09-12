import type { ApiHealth, Project, ProjectDraft } from '@/types';
import { seedProjects } from '@/data/site';

/**
 * Single place that talks to the Express/MongoDB API.
 *
 * Auth uses a bearer token kept in localStorage. (Cookies are intentionally
 * avoided so the admin also works when the site is embedded in a preview
 * iframe on a different origin.)
 */

const TOKEN_KEY = 'tsd.admin.token';
const USE_SEED_FALLBACK = import.meta.env.VITE_USE_SEED_FALLBACK !== 'false';

export const authStore = {
  get token(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable (private mode) — session stays in memory */
    }
  },
};

let memoryToken: string | null = null;

export function getToken(): string | null {
  return authStore.token ?? memoryToken;
}

export function setToken(token: string | null) {
  memoryToken = token;
  authStore.set(token);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = getToken();

  const response = await fetch(`/api${path}`, {
    ...rest,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401) {
    setToken(null);
    throw new ApiError('Your session expired. Please sign in again.', 401);
  }

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      (payload as { error?: string } | null)?.error ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export type ProjectsSource = 'database' | 'memory' | 'seed-fallback';

export interface ProjectListResponse {
  projects: Project[];
  source: ProjectsSource;
}

/* ---------------------------------------------------------------- health */

export async function fetchHealth(): Promise<ApiHealth> {
  return request<ApiHealth>('/health');
}

/* -------------------------------------------------------------- projects */

/**
 * Public project list. Published projects only.
 * Falls back to bundled seed data when the API/database is not reachable yet
 * so the portfolio never renders empty during setup.
 */
export async function fetchPublicProjects(): Promise<ProjectListResponse> {
  try {
    return await request<ProjectListResponse>('/projects');
  } catch (error) {
    if (!USE_SEED_FALLBACK) throw error;
    console.warn('[portfolio] API unavailable — using bundled seed projects.', error);
    return {
      projects: sortProjects(seedProjects.filter((project) => project.status === 'published')),
      source: 'seed-fallback',
    };
  }
}

/** Admin project list. Every project, drafts included. */
export async function fetchAllProjects(): Promise<ProjectListResponse> {
  return request<ProjectListResponse>('/admin/projects');
}

export async function createProject(draft: ProjectDraft): Promise<Project> {
  return request<Project>('/admin/projects', { method: 'POST', body: draft });
}

export async function updateProject(id: string, patch: Partial<ProjectDraft>): Promise<Project> {
  return request<Project>(`/admin/projects/${id}`, { method: 'PATCH', body: patch });
}

export async function deleteProject(id: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/admin/projects/${id}`, { method: 'DELETE' });
}

export async function reorderProjects(idsInOrder: string[]): Promise<Project[]> {
  return request<{ projects: Project[] }>('/admin/projects/reorder', {
    method: 'POST',
    body: { ids: idsInOrder },
  }).then((r) => r.projects);
}

/* ----------------------------------------------------------------- auth */

export async function login(email: string, password: string) {
  return request<{ token: string; user: { email: string; name?: string } }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function fetchSession() {
  return request<{ user: { email: string; name?: string } }>('/auth/me');
}

export async function fetchSetupState() {
  return request<{ configured: boolean; needsAdmin: boolean }>('/auth/status');
}

export async function createFirstAdmin(name: string, email: string, password: string, setupToken: string) {
  return request<{ token: string; user: { email: string; name?: string } }>('/admin/setup', {
    method: 'POST',
    body: { name, email, password, setupToken },
  });
}

export async function seedDatabase() {
  return request<{ inserted: number; total: number }>('/admin/seed', { method: 'POST' });
}

/* --------------------------------------------------------------- upload */

export async function uploadProjectImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  return request<{ url: string }>('/admin/upload', { method: 'POST', body: form });
}

/* -------------------------------------------------------------- helpers */

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.name.localeCompare(b.name);
  });
}

export function isSeedMode(source: ProjectListResponse['source']) {
  return source === 'seed-fallback';
}
