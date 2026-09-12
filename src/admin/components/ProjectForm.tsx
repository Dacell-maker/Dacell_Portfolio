import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'motion/react';
import type { Project, ProjectDraft, ProjectStatus } from '@/types';
import { createProject, updateProject } from '@/lib/api';
import { EASE } from '@/lib/motion';
import ImageUploader from './ImageUploader';

type Props = {
  project?: Project;
  categories: string[];
  nextOrder: number;
  onSaved: (project: Project, wasNew: boolean) => void;
  onClose: () => void;
};

const SUGGESTED_CATEGORIES = [
  'Web App',
  'E-commerce',
  'Restaurant',
  'Landing Page',
  'AI & ML',
  'Desktop App',
  'Business System',
];

const emptyDraft = (nextOrder: number): ProjectDraft => ({
  name: '',
  category: 'Web App',
  shortDescription: '',
  fullDescription: '',
  image: null,
  imageAlt: '',
  liveUrl: null,
  githubUrl: null,
  extraLabel: '',
  extraUrl: null,
  technologies: [],
  status: 'published',
  featured: false,
  year: String(new Date().getFullYear()),
  displayOrder: nextOrder,
});

/** Slide-over form used for both "Add project" and "Edit project". */
export default function ProjectForm({ project, categories, nextOrder, onSaved, onClose }: Props) {
  const isEdit = Boolean(project);
  const initial = useMemo(
    () =>
      project
        ? ({
            name: project.name,
            category: project.category,
            shortDescription: project.shortDescription,
            fullDescription: project.fullDescription ?? '',
            image: project.image,
            imageAlt: project.imageAlt ?? '',
            liveUrl: project.liveUrl,
            githubUrl: project.githubUrl,
            extraLabel: project.extraLabel ?? '',
            extraUrl: project.extraUrl ?? null,
            technologies: project.technologies,
            status: project.status,
            featured: project.featured,
            year: project.year ?? '',
            displayOrder: project.displayOrder,
          } satisfies ProjectDraft)
        : emptyDraft(nextOrder),
    [project, nextOrder],
  );

  const [form, setForm] = useState<ProjectDraft>(initial);
  const [techInput, setTechInput] = useState(initial.technologies.join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitStatus = useRef<ProjectStatus>(initial.status);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>([...SUGGESTED_CATEGORIES, ...categories.filter((c) => c !== 'All')]);
    return Array.from(set);
  }, [categories]);

  function set<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function handleTechChange(value: string) {
    setTechInput(value);
    set(
      'technologies',
      value
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Give the project a name.');
      return;
    }
    if (!form.shortDescription.trim()) {
      setError('Add a short description — it is what visitors read on the card.');
      return;
    }

    const payload: ProjectDraft = {
      ...form,
      status: submitStatus.current === form.status ? form.status : submitStatus.current,
      fullDescription: form.fullDescription?.trim() ? form.fullDescription.trim() : undefined,
      imageAlt: form.imageAlt?.trim() ? form.imageAlt.trim() : `${form.name} website screenshot`,
      year: form.year?.trim() ? form.year.trim() : undefined,
      extraLabel: form.extraLabel?.trim() ? form.extraLabel.trim() : undefined,
    };

    setSaving(true);
    try {
      const saved = project
        ? await updateProject(project._id, payload)
        : await createProject(payload);
      onSaved(saved, !isEdit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the project.');
      setSaving(false);
    }
  }

  /** The segmented control is the source of truth; footer buttons can override it. */
  function chooseStatus(status: ProjectStatus) {
    submitStatus.current = status;
    set('status', status);
  }

  return (
    <motion.div
      className="drawer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? `Edit ${project?.name}` : 'Add a new project'}
    >
      <div className="drawer__backdrop" onClick={onClose} aria-hidden="true" />

      <motion.div
        className="drawer__panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <header className="drawer__head">
          <div>
            <span className="drawer__eyebrow">{isEdit ? 'Edit project' : 'New project'}</span>
            <h2>{isEdit ? project?.name : 'Add a project'}</h2>
            <p>
              {isEdit
                ? 'Changes appear on the public portfolio as soon as you save.'
                : 'Only the name and short description are required — everything else is optional.'}
            </p>
          </div>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close panel">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <form className="drawer__form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label className="field__label" htmlFor="f-name">
                Project name *
              </label>
              <input
                className="input"
                id="f-name"
                value={form.name}
                onChange={(event) => set('name', event.target.value)}
                placeholder="e.g. DAVICELL"
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="f-category">
                Category
              </label>
              <input
                className="input"
                id="f-category"
                list="category-options"
                value={form.category}
                onChange={(event) => set('category', event.target.value)}
                placeholder="E-commerce"
              />
              <datalist id="category-options">
                {categoryOptions.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="field span-2">
              <label className="field__label" htmlFor="f-short">
                Short description *
              </label>
              <textarea
                className="textarea"
                id="f-short"
                value={form.shortDescription}
                onChange={(event) => set('shortDescription', event.target.value)}
                placeholder="One or two sentences shown on the project card."
                maxLength={600}
                required
              />
              <span className="field__hint">{form.shortDescription.length}/600</span>
            </div>

            <div className="field span-2">
              <label className="field__label" htmlFor="f-full">
                Full description
              </label>
              <textarea
                className="textarea"
                id="f-full"
                value={form.fullDescription ?? ''}
                onChange={(event) => set('fullDescription', event.target.value)}
                placeholder="Longer version used on the large featured tiles."
                maxLength={4000}
              />
            </div>

            <div className="field span-2">
              <span className="field__label">Project image (optional)</span>
              <ImageUploader
                value={form.image}
                projectName={form.name}
                onChange={(url) => set('image', url)}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="f-image-alt">
                Image alt text
              </label>
              <input
                className="input"
                id="f-image-alt"
                value={form.imageAlt ?? ''}
                onChange={(event) => set('imageAlt', event.target.value)}
                placeholder={`${form.name || 'Project'} website screenshot`}
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="f-tech">
                Technologies
              </label>
              <input
                className="input"
                id="f-tech"
                value={techInput}
                onChange={(event) => handleTechChange(event.target.value)}
                placeholder="React, TypeScript, MongoDB"
              />
              <span className="field__hint">Comma separated</span>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="f-live">
                Live website URL
              </label>
              <input
                className="input"
                id="f-live"
                type="url"
                value={form.liveUrl ?? ''}
                onChange={(event) => set('liveUrl', event.target.value.trim() || null)}
                placeholder="https://example.vercel.app"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="f-github">
                GitHub repository URL
              </label>
              <input
                className="input"
                id="f-github"
                type="url"
                value={form.githubUrl ?? ''}
                onChange={(event) => set('githubUrl', event.target.value.trim() || null)}
                placeholder="https://github.com/Dacell-maker/repo"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="f-extra-label">
                Extra link label
              </label>
              <input
                className="input"
                id="f-extra-label"
                value={form.extraLabel ?? ''}
                onChange={(event) => set('extraLabel', event.target.value)}
                placeholder="Case study"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="f-extra-url">
                Extra link URL
              </label>
              <input
                className="input"
                id="f-extra-url"
                type="url"
                value={form.extraUrl ?? ''}
                onChange={(event) => set('extraUrl', event.target.value.trim() || null)}
                placeholder="https://…"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="f-year">
                Year
              </label>
              <input
                className="input"
                id="f-year"
                value={form.year ?? ''}
                onChange={(event) => set('year', event.target.value)}
                placeholder="2026"
                inputMode="numeric"
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="f-order">
                Display order
              </label>
              <input
                className="input"
                id="f-order"
                type="number"
                min={0}
                max={9999}
                value={form.displayOrder}
                onChange={(event) => set('displayOrder', Number(event.target.value))}
              />
              <span className="field__hint">Lower numbers appear first</span>
            </div>

            <div className="field">
              <span className="field__label">Status</span>
              <div className="segmented" role="radiogroup" aria-label="Project status">
                {(['published', 'draft'] as ProjectStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    role="radio"
                    aria-checked={form.status === status}
                    className={`segmented__btn ${form.status === status ? 'is-active' : ''}`}
                    onClick={() => chooseStatus(status)}
                  >
                    {status === 'published' ? 'Published' : 'Draft'}
                  </button>
                ))}
              </div>
              <span className="field__hint">Drafts never appear on the public site</span>
            </div>

            <div className="field">
              <span className="field__label">Featured</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => set('featured', event.target.checked)}
                />
                <span className="switch__track" aria-hidden="true" />
                <span>Highlight as a featured project</span>
              </label>
            </div>
          </div>

          {error ? (
            <p className="drawer__error" role="alert">
              {error}
            </p>
          ) : null}

          <footer className="drawer__foot">
            <button type="button" className="btn btn--ghost btn--sm" onClick={onClose} disabled={saving}>
              <span className="btn__label">Cancel</span>
            </button>

            <div className="drawer__foot-actions">
              <button
                type="submit"
                className="btn btn--ghost btn--sm"
                disabled={saving}
                onClick={() => chooseStatus('draft')}
              >
                <span className="btn__label">Save as draft</span>
              </button>
              <button
                type="submit"
                className="btn btn--primary btn--sm"
                disabled={saving}
                onClick={() => chooseStatus('published')}
              >
                <span className="btn__label">
                  {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
                </span>
              </button>
            </div>
          </footer>
        </form>
      </motion.div>
    </motion.div>
  );
}
