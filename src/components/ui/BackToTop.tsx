import { motion, useScroll, useSpring } from 'motion/react';
import { useScrollY } from '@/hooks/useMediaQuery';
import { cursorProps } from '@/lib/cursor';

/** Floating scroll cue: a ring that fills with page progress + back to top. */
export default function BackToTop() {
  const y = useScrollY();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const visible = y > 600;

  return (
    <motion.button
      type="button"
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7, pointerEvents: visible ? 'auto' : 'none' }}
      transition={{ duration: 0.35 }}
      aria-label="Back to top"
      {...cursorProps('link')}
    >
      <svg viewBox="0 0 44 44" className="back-to-top__ring" aria-hidden="true">
        <circle className="back-to-top__track" cx="22" cy="22" r="20" />
        <motion.circle
          className="back-to-top__progress"
          cx="22"
          cy="22"
          r="20"
          style={{ pathLength: progress }}
        />
      </svg>
      <svg viewBox="0 0 16 16" className="back-to-top__arrow" fill="none" aria-hidden="true">
        <path d="M8 13V3m0 0L4 7m4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </motion.button>
  );
}
