import { memo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Project } from '@/types';
import { EASE, clipWipe, viewportOnce } from '@/lib/motion';
import { cursorProps } from '@/lib/cursor';
import ProjectPlaceholder from './ProjectPlaceholder';

type Props = {
  project: Project;
  index: number;
  /** Two-column editorial tile used for the first projects in the list. */
  featured?: boolean;
};

function IconArrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 12L12 4M12 4H5.5M12 4v6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/**
 * One project tile.
 *
 * Handles every data combination without breaking:
 *   image + live + github   → full media + both actions
 *   image, no live          → media + "Live demo unavailable" chip
 *   live, no image          → designed placeholder + live action
 *   nothing                 → placeholder + name/description/tech only
 *
 * Real screenshots only. Nothing here ever invents an image.
 */
function ProjectCard({ project, index, featured = false }: Props) {
  const reduced = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(project.image) && !failed;

  const hasLive = Boolean(project.liveUrl);
  const hasGithub = Boolean(project.githubUrl);
  const hasExtra = Boolean(project.extraUrl);

  return (
    <motion.article
      className={`project-card ${featured ? 'project-card--wide' : ''}`}
      variants={clipWipe}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      layout={reduced ? undefined : 'position'}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className={`project-card__media ${showImage ? 'has-image' : 'no-image'}`}>
        {showImage ? (
          <>
            {!loaded && <div className="project-card__skeleton" aria-hidden="true" />}
            <motion.img
              src={project.image ?? undefined}
              alt={project.imageAlt || `${project.name} website screenshot`}
              loading="lazy"
              decoding="async"
              className="project-card__img"
              style={{ opacity: loaded ? 1 : 0 }}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              initial={reduced ? false : { scale: 1.12 }}
              whileInView={reduced ? undefined : { scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: EASE }}
            />
          </>
        ) : (
          <ProjectPlaceholder name={project.name} category={project.category} index={index + 1} />
        )}

        <span className="project-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="project-card__veil" aria-hidden="true" />

        {/* Whole-tile click target — only when there is somewhere real to go. */}
        {hasLive ? (
          <a
            className="project-card__hit"
            href={project.liveUrl ?? undefined}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open ${project.name} live website`}
            {...cursorProps('view', 'VIEW PROJECT')}
          />
        ) : hasGithub ? (
          <a
            className="project-card__hit"
            href={project.githubUrl ?? undefined}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open the ${project.name} repository`}
            {...cursorProps('view', 'VIEW CODE')}
          />
        ) : null}

        <div className="project-card__tech">
          {project.technologies.slice(0, featured ? 6 : 4).map((tech) => (
            <span className="tag" key={tech}>
              {tech}
            </span>
          ))}
          {project.technologies.length > (featured ? 6 : 4) ? (
            <span className="tag tag--accent">+{project.technologies.length - (featured ? 6 : 4)}</span>
          ) : null}
        </div>
      </div>

      <div className="project-card__body">
        <header className="project-card__head">
          <div>
            <h3 className="project-card__title">
              <span className="project-card__title-text">{project.name}</span>
            </h3>
            <p className="project-card__meta">
              <span>{project.category}</span>
              {project.year ? (
                <>
                  <span className="dot" aria-hidden="true" />
                  <span>{project.year}</span>
                </>
              ) : null}
              {project.featured ? (
                <>
                  <span className="dot" aria-hidden="true" />
                  <span className="project-card__featured">Featured</span>
                </>
              ) : null}
            </p>
          </div>
        </header>

        <p className="project-card__desc">
          {featured && project.fullDescription ? project.fullDescription : project.shortDescription}
        </p>

        <div className="project-card__actions">
          {hasLive ? (
            <a
              className="project-card__action"
              href={project.liveUrl ?? undefined}
              target="_blank"
              rel="noreferrer noopener"
              {...cursorProps('link')}
            >
              Live demo <IconArrow />
            </a>
          ) : (
            <span className="link-chip" title="This project is not deployed publicly">
              Live demo unavailable
            </span>
          )}

          {hasGithub ? (
            <a
              className="project-card__action"
              href={project.githubUrl ?? undefined}
              target="_blank"
              rel="noreferrer noopener"
              {...cursorProps('link')}
            >
              <IconGithub /> Source
            </a>
          ) : null}

          {hasExtra && project.extraUrl ? (
            <a
              className="project-card__action"
              href={project.extraUrl}
              target="_blank"
              rel="noreferrer noopener"
              {...cursorProps('link')}
            >
              {project.extraLabel || 'More'} <IconArrow />
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

export default memo(ProjectCard);
