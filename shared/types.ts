export type ProjectStatus = 'published' | 'draft';

export type ProjectCategory =
  | 'Web App'
  | 'E-commerce'
  | 'Restaurant'
  | 'Landing Page'
  | 'AI & ML'
  | 'Desktop App'
  | 'Business System'
  | string;

/**
 * A single portfolio project.
 *
 * `image` is OPTIONAL on purpose. The previous version of this portfolio
 * generated AI artwork for projects that had no real screenshot — that never
 * happens here. When `image` is null the UI renders <ProjectPlaceholder />.
 */
export interface Project {
  _id: string;
  name: string;
  category: ProjectCategory;
  shortDescription: string;
  fullDescription?: string;
  /** Absolute URL (live site or Vercel Blob) or null when none was uploaded. */
  image: string | null;
  imageAlt?: string;
  liveUrl: string | null;
  githubUrl: string | null;
  extraLabel?: string;
  extraUrl?: string | null;
  technologies: string[];
  status: ProjectStatus;
  featured: boolean;
  year?: string;
  /** Lower numbers appear first on the public site. */
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Shape used by the admin form before a project exists in the database. */
export type ProjectDraft = Omit<Project, '_id' | 'createdAt' | 'updatedAt'>;

export interface SiteStats {
  label: string;
  value: number;
  suffix?: string;
}

export interface Skill {
  name: string;
  group: SkillGroup;
}

export type SkillGroup = 'Frontend' | 'Backend' | 'Data' | 'Tools';

export interface TimelineItem {
  title: string;
  organisation: string;
  period: string;
  points: string[];
  tags: string[];
}
