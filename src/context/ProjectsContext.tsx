import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Project } from '@/types';
import { fetchPublicProjects, sortProjects } from '@/lib/api';
import type { ProjectsSource } from '@/lib/api';

type ProjectsContextValue = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  /** 'database'/'memory' when the API answered, 'seed-fallback' while setup is pending. */
  source: ProjectsSource;
  categories: string[];
  refresh: () => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<ProjectsSource>('database');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPublicProjects();
      setProjects(sortProjects(response.projects));
      setSource(response.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load projects.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => set.add(project.category));
    return ['All', ...Array.from(set)];
  }, [projects]);

  const value = useMemo(
    () => ({ projects, loading, error, source, categories, refresh: load }),
    [projects, loading, error, source, categories, load],
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error('useProjects must be used inside <ProjectsProvider>');
  return context;
}
