import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import type { ApiHealth, Project } from '@/types';
import { fetchAllProjects, fetchHealth } from '@/lib/api';
import { EASE, fadeUp, staggerContainer } from '@/lib/motion';
import { useAuth } from '../AuthContext';
import StatCard from '../components/StatCard';
import StatusPill from '../components/StatusPill';

const STEPS = [
  'Visit /admin and sign in',
  'Click “Add project”',
  'Fill in the name, category and short description',
  'Upload a screenshot — or skip it, a designed placeholder is used',
  'Add the live URL and GitHub repo if they exist',
  'Set the display order, then publish',
];

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [healthResult, projectsResult] = await Promise.allSettled([fetchHealth(), fetchAllProjects()]);
      if (cancelled) return;
      if (healthResult.status === 'fulfilled') setHealth(healthResult.value);
      if (projectsResult.status === 'fulfilled') setProjects(projectsResult.value.projects);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const published = projects.filter((project) => project.status === 'published');
    return {
      total: projects.length,
      published: published.length,
      drafts: projects.length - published.length,
      missingImage: projects.filter((project) => !project.image).length,
      withLive: projects.filter((project) => Boolean(project.liveUrl)).length,
      withGithub: projects.filter((project) => Boolean(project.githubUrl)).length,
      featured: projects.filter((project) => project.featured).length,
    };
  }, [projects]);

  const recent = useMemo(() => [...projects].slice(0, 5), [projects]);
  const databaseOk = Boolean(health?.database);

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <span className="page__eyebrow">Dashboard</span>
          <h1>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p>
            Manage what the world sees. Every change here is live on the public portfolio the moment
            you save it.
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
            Add new project
          </span>
        </motion.button>
      </header>

      {!loading && !databaseOk ? (
        <div className="alert alert--warn">
          <strong>MongoDB is not connected yet</strong>
          <p>
            The public portfolio is currently serving the bundled project list, and admin changes
            cannot be saved. Add <code>MONGODB_URI</code> to your environment variables and restart —
            step-by-step instructions are in <code>SETUP.md</code> and on the Settings page.
          </p>
          <div className="alert__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate('/admin/settings')}>
              <span className="btn__label">Open settings</span>
            </button>
          </div>
        </div>
      ) : null}

      <motion.div
        className="stat-grid"
        variants={staggerContainer(0, 0.06)}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <StatCard label="Total projects" value={loading ? '—' : summary.total} tone="accent" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Published" value={loading ? '—' : summary.published} hint="Visible to visitors" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Drafts" value={loading ? '—' : summary.drafts} hint="Hidden from the site" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard
            label="Missing image"
            value={loading ? '—' : summary.missingImage}
            tone={summary.missingImage > 0 ? 'warn' : 'default'}
            hint="Showing designed placeholders"
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="With live link" value={loading ? '—' : summary.withLive} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="With GitHub repo" value={loading ? '—' : summary.withGithub} />
        </motion.div>
      </motion.div>

      <div className="overview__grid">
        <section className="panel">
          <header className="panel__head">
            <h2>Recent projects</h2>
            <Link to="/admin/projects" className="panel__link">
              Manage all
            </Link>
          </header>

          {loading ? (
            <p className="panel__empty">Loading…</p>
          ) : recent.length === 0 ? (
            <div className="panel__empty">
              <p>No projects yet.</p>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => navigate('/admin/projects/new')}
              >
                <span className="btn__label">Add your first project</span>
              </button>
            </div>
          ) : (
            <ul className="mini-list">
              {recent.map((project) => (
                <li key={project._id}>
                  <button type="button" onClick={() => navigate(`/admin/projects/${project._id}`)}>
                    <span className={`mini-list__thumb ${project.image ? '' : 'is-empty'}`}>
                      {project.image ? <img src={project.image} alt="" loading="lazy" /> : null}
                    </span>
                    <span className="mini-list__text">
                      <strong>{project.name}</strong>
                      <em>
                        {project.category}
                        {project.year ? ` · ${project.year}` : ''}
                      </em>
                    </span>
                    <StatusPill status={project.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="overview__side">
          <section className="panel">
            <header className="panel__head">
              <h2>Publishing a new project</h2>
            </header>
            <ol className="steps">
              {STEPS.map((step, index) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.15 + index * 0.06 }}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {step}
                </motion.li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <header className="panel__head">
              <h2>System</h2>
            </header>
            <ul className="system">
              <li>
                <span className={`dot ${health?.database ? 'dot--ok' : 'dot--bad'}`} />
                MongoDB Atlas
                <em>{health ? (health.database ? 'Connected' : 'Not connected') : 'Checking…'}</em>
              </li>
              <li>
                <span className={`dot ${health?.blob ? 'dot--ok' : 'dot--warn'}`} />
                Vercel Blob (images)
                <em>{health ? (health.blob ? 'Configured' : 'Inline fallback') : 'Checking…'}</em>
              </li>
              <li>
                <span className={`dot ${summary.featured > 0 ? 'dot--ok' : 'dot--warn'}`} />
                Featured projects
                <em>{loading ? 'Checking…' : summary.featured}</em>
              </li>
            </ul>
            <Link to="/admin/settings" className="panel__link panel__link--pad">
              Connection settings
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
