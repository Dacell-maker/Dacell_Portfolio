import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Project } from '@/types';
import { deleteProject, fetchAllProjects, reorderProjects, sortProjects } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { EASE } from '@/lib/motion';
import ConfirmDialog from '../components/ConfirmDialog';
import ProjectForm from '../components/ProjectForm';
import StatusPill from '../components/StatusPill';

type Props = { creating?: boolean };

export default function ProjectsAdmin({ creating = false }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [imageFilter, setImageFilter] = useState<'all' | 'missing'>('all');
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const panelOpen = creating || Boolean(id);
  const editing = useMemo(() => projects.find((project) => project._id === id), [projects, id]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllProjects();
      setProjects(sortProjects(response.projects));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not reach the API. Is the server running and is MONGODB_URI set?',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      if (statusFilter !== 'all' && project.status !== statusFilter) return false;
      if (imageFilter === 'missing' && project.image) return false;
      if (!query) return true;
      return (
        project.name.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query) ||
        project.shortDescription.toLowerCase().includes(query) ||
        project.technologies.some((tech) => tech.toLowerCase().includes(query))
      );
    });
  }, [projects, search, statusFilter, imageFilter]);

  const categories = useMemo(() => ['All', ...new Set(projects.map((project) => project.category))], [projects]);
  const nextOrder = useMemo(
    () => (projects.length ? Math.max(...projects.map((project) => project.displayOrder)) + 1 : 1),
    [projects],
  );

  function closePanel() {
    navigate('/admin/projects', { replace: true });
  }

  function handleSaved(project: Project, wasNew: boolean) {
    setProjects((previous) => sortProjects(wasNew ? [...previous, project] : previous.map((item) => (item._id === project._id ? project : item))));
    setToast(wasNew ? `“${project.name}” added to your portfolio.` : `“${project.name}” updated.`);
    closePanel();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProject(pendingDelete._id);
      setProjects((previous) => previous.filter((project) => project._id !== pendingDelete._id));
      setToast(`“${pendingDelete.name}” deleted.`);
      setPendingDelete(null);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  async function move(project: Project, direction: -1 | 1) {
    const visibleIds = new Set(filtered.map((item) => item._id));
    const visible = projects.filter((item) => visibleIds.has(item._id));
    const index = visible.findIndex((item) => item._id === project._id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= visible.length) return;

    [visible[index], visible[target]] = [visible[target], visible[index]];

    // Rebuild the full list: reordered visible projects take the slots that
    // the visible ones occupied, hidden projects keep their positions.
    const slots = projects.map((item) => (visibleIds.has(item._id) ? visible.shift()! : item));
    setProjects(slots);

    try {
      const updated = await reorderProjects(slots.map((item) => item._id));
      setProjects(sortProjects(updated));
    } catch {
      await load();
    }
  }

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <span className="page__eyebrow">Content</span>
          <h1>Projects</h1>
          <p>
            Everything published here appears on the public portfolio immediately — no code changes,
            no redeploy.
          </p>
        </div>
        <motion.button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate('/admin/projects/new')}
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <span className="btn__label">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Add project
          </span>
        </motion.button>
      </header>

      {error ? (
        <div className="alert alert--error">
          <strong>Projects could not be loaded</strong>
          <p>{error}</p>
          <div className="alert__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => void load()}>
              <span className="btn__label">Retry</span>
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate('/admin/settings')}>
              <span className="btn__label">Open settings</span>
            </button>
          </div>
        </div>
      ) : null}

      <div className="toolbar">
        <div className="toolbar__search">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            className="input"
            type="search"
            placeholder="Search projects, categories or technologies…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search projects"
          />
        </div>

        <div className="toolbar__filters">
          <div className="segmented" role="group" aria-label="Filter by status">
            {(['all', 'published', 'draft'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`segmented__btn ${statusFilter === value ? 'is-active' : ''}`}
                onClick={() => setStatusFilter(value)}
              >
                {value === 'all' ? 'All' : value === 'published' ? 'Published' : 'Drafts'}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`chip-toggle ${imageFilter === 'missing' ? 'is-active' : ''}`}
            onClick={() => setImageFilter((value) => (value === 'missing' ? 'all' : 'missing'))}
            aria-pressed={imageFilter === 'missing'}
          >
            Missing image
          </button>
        </div>
      </div>

      {loading ? (
        <div className="table-skeleton">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="table-skeleton__row" key={index} />
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Portfolio projects</caption>
            <thead>
              <tr>
                <th scope="col" className="table__order">
                  Order
                </th>
                <th scope="col">Project</th>
                <th scope="col" className="table__hide-sm">
                  Category
                </th>
                <th scope="col" className="table__hide-sm">
                  Links
                </th>
                <th scope="col">Status</th>
                <th scope="col" className="table__actions">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((project, index) => (
                  <motion.tr
                    key={project._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE, delay: index * 0.02 }}
                  >
                    <td className="table__order">
                      <div className="order">
                        <span>{String(project.displayOrder).padStart(2, '0')}</span>
                        <div className="order__btns">
                          <button
                            type="button"
                            onClick={() => void move(project, -1)}
                            disabled={index === 0}
                            aria-label={`Move ${project.name} up`}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => void move(project, 1)}
                            disabled={index === filtered.length - 1 || loading}
                            aria-label={`Move ${project.name} down`}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="table__project">
                        <div className={`table__thumb ${project.image ? '' : 'is-empty'}`}>
                          {project.image ? (
                            <img src={project.image} alt="" loading="lazy" />
                          ) : (
                            <span>No image</span>
                          )}
                        </div>
                        <div className="table__project-text">
                          <strong>{project.name}</strong>
                          <p>{project.shortDescription}</p>
                          <div className="table__tech">
                            {project.technologies.slice(0, 4).map((tech) => (
                              <span className="tag" key={tech}>
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 4 ? (
                              <span className="tag">+{project.technologies.length - 4}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="table__hide-sm">
                      <span className="table__cat">{project.category}</span>
                      {project.year ? <span className="table__year">{project.year}</span> : null}
                      {project.featured ? <span className="badge badge--published">Featured</span> : null}
                    </td>

                    <td className="table__hide-sm">
                      <div className="table__links">
                        {project.liveUrl ? (
                          <a href={project.liveUrl} target="_blank" rel="noreferrer noopener" title={project.liveUrl}>
                            Live
                          </a>
                        ) : (
                          <span className="is-missing">No live link</span>
                        )}
                        {project.githubUrl ? (
                          <a href={project.githubUrl} target="_blank" rel="noreferrer noopener" title={project.githubUrl}>
                            GitHub
                          </a>
                        ) : (
                          <span className="is-missing">No repo</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <StatusPill status={project.status} />
                    </td>

                    <td className="table__actions">
                      <div className="row-actions">
                        {project.liveUrl ? (
                          <a
                            className="icon-btn"
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            aria-label={`Open ${project.name}`}
                            title="Open live site"
                          >
                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M4 12 12 4M12 4H5.5M12 4v6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </a>
                        ) : null}
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => navigate(`/admin/projects/${project._id}`)}
                          aria-label={`Edit ${project.name}`}
                          title="Edit"
                        >
                          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path
                              d="M11.2 2.8a1.7 1.7 0 0 1 2.4 2.4L6 12.8l-3.2.8.8-3.2 7.6-7.6Z"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setPendingDelete(project)}
                          aria-label={`Delete ${project.name}`}
                          title="Delete"
                        >
                          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path
                              d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.2a1 1 0 0 0 1 .8h3.8a1 1 0 0 0 1-.8l.6-8.2"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {!loading && filtered.length === 0 ? (
            <div className="table__empty">
              <h3>{projects.length === 0 ? 'No projects yet' : 'No projects match this filter'}</h3>
              <p>
                {projects.length === 0
                  ? 'Add your first project, or seed the eight projects that shipped with this build from Settings.'
                  : 'Try a different search term or clear the filters.'}
              </p>
              {projects.length === 0 ? (
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => navigate('/admin/projects/new')}
                >
                  <span className="btn__label">Add project</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setImageFilter('all');
                  }}
                >
                  <span className="btn__label">Clear filters</span>
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}

      <AnimatePresence>
        {panelOpen ? (
          <ProjectForm
            key={creating ? 'new' : id}
            project={creating ? undefined : editing}
            categories={categories}
            nextOrder={nextOrder}
            onSaved={handleSaved}
            onClose={closePanel}
          />
        ) : null}
      </AnimatePresence>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this project?"
        description={`“${pendingDelete?.name ?? ''}” will be removed from your portfolio permanently. This cannot be undone.`}
        confirmLabel="Delete project"
        cancelLabel="Cancel"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
