import { useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useProjects } from '@/context/ProjectsContext';
import { site } from '@/data/site';
import { EASE, fadeUp, viewportOnce } from '@/lib/motion';
import { cursorProps } from '@/lib/cursor';
import SectionHead from '@/components/ui/SectionHead';
import ProjectCard from '@/components/projects/ProjectCard';

export default function Projects() {
  const { projects, loading, error, source, categories, refresh } = useProjects();
  const [active, setActive] = useState('All');

  const visible = useMemo(
    () => (active === 'All' ? projects : projects.filter((project) => project.category === active)),
    [projects, active],
  );

  return (
    <section id="projects" className="section projects">
      <div className="projects__edge bg-grid" aria-hidden="true" />
      <div className="container">
        <SectionHead
          eyebrow="Selected work"
          title={<>Featured projects</>}
          lede="A selection of applications I have designed, built and shipped — from AI-powered platforms and e-commerce stores to desktop business systems."
          aside={
            <motion.div
              className="projects__meta"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <span className="projects__count">
                {String(projects.length).padStart(2, '0')}
                <em>projects</em>
              </span>
              {source === 'seed-fallback' ? (
                <span className="projects__source" title="Projects are being served from bundled data because the database is not connected yet.">
                  preview data
                </span>
              ) : null}
            </motion.div>
          }
        />

        {/* Filters -------------------------------------------------------------- */}
        <div className="projects__bar">
          <LayoutGroup id="filters">
            <ul className="filters" role="tablist" aria-label="Filter projects by category">
              {categories.map((category) => {
                const count =
                  category === 'All'
                    ? projects.length
                    : projects.filter((project) => project.category === category).length;

                return (
                  <li key={category} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active === category}
                      className={`filters__btn ${active === category ? 'is-active' : ''}`}
                      onClick={() => setActive(category)}
                      {...cursorProps('link')}
                    >
                      {active === category ? (
                        <motion.span
                          layoutId="filter-pill"
                          className="filters__pill"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      ) : null}
                      <span className="filters__label">
                        {category}
                        <em>{String(count).padStart(2, '0')}</em>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>

          <a
            className="projects__github"
            href={site.github}
            target="_blank"
            rel="noreferrer noopener"
            {...cursorProps('link')}
          >
            See more on GitHub
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 12L12 4M12 4H5.5M12 4v6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        {/* Grid ------------------------------------------------------------------ */}
        {loading ? (
          <div className="projects__grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="skeleton-card" key={index}>
                <div className="skeleton-card__media" />
                <div className="skeleton-card__line" />
                <div className="skeleton-card__line skeleton-card__line--short" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="projects__empty">
            <h3>Could not load projects</h3>
            <p>{error}</p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => void refresh()}>
              <span className="btn__label">Try again</span>
            </button>
          </div>
        ) : (
          <LayoutGroup id="projects">
            <motion.div className="projects__grid" layout>
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((project, index) => (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className={`projects__cell ${index < 2 ? 'projects__cell--wide' : ''}`}
                  >
                    <ProjectCard project={project} index={index} featured={index < 2} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}

        {!loading && !error && visible.length === 0 ? (
          <motion.div
            className="projects__empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            variants={fadeUp}
          >
            <h3>Nothing in this category yet</h3>
            <p>
              Projects are added from the admin dashboard — new work appears here automatically once
              it is published.
            </p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setActive('All')}>
              <span className="btn__label">Show all projects</span>
            </button>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
