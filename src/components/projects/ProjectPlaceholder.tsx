import { motion } from 'motion/react';
import { EASE } from '@/lib/motion';

type Props = {
  name: string;
  category?: string;
  index?: number;
};

function initials(name: string) {
  const words = name
    .replace(/[^a-zA-Z0-9' ]/g, '')
    .split(' ')
    .filter(Boolean);

  if (words.length === 0) return '··';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Rendered whenever a project has no uploaded screenshot.
 * It is a designed surface — mono label, oversized initials, engineered grid,
 * a slow scanning line and a shimmer — so a project without an image still
 * looks intentional and never breaks the grid.
 */
export default function ProjectPlaceholder({ name, category }: Props) {
  return (
    <div className="placeholder" role="img" aria-label={`${name} — preview image coming soon`}>
      <div className="placeholder__grid" aria-hidden="true" />
      <div className="placeholder__glow" aria-hidden="true" />
      <motion.div
        className="placeholder__scan"
        aria-hidden="true"
        initial={{ y: '-20%', opacity: 0 }}
        animate={{ y: '420%', opacity: [0, 0.8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
      />

      <div className="placeholder__top">
        <span className="placeholder__label">
          <span className="placeholder__dot" />
          Preview coming soon
        </span>
      </div>

      <div className="placeholder__center">
        <motion.span
          className="placeholder__initials"
          initial={{ opacity: 0, y: 18, letterSpacing: '0.2em' }}
          whileInView={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: EASE }}
          aria-hidden="true"
        >
          {initials(name)}
        </motion.span>
        <span className="placeholder__name">{name}</span>
      </div>

      <div className="placeholder__bottom">
        {category ? <span className="placeholder__cat">{category}</span> : null}
        <span className="placeholder__hint">Screenshot added from /admin</span>
      </div>
    </div>
  );
}
