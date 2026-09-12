/**
 * Shared domain types live in /shared/types.ts so the API server and the React
 * client always agree on the shape of a Project.
 */
export type { Project, ProjectCategory, ProjectDraft, ProjectStatus, SiteStats, Skill, SkillGroup, TimelineItem } from '@shared/types';

export interface AdminUser {
  email: string;
  name?: string;
}

export interface ApiHealth {
  ok: boolean;
  database: boolean;
  blob: boolean;
  configured?: boolean;
  mode: 'database' | 'seed-fallback';
}
