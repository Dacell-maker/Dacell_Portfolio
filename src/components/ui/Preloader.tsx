import { useEffect, useState } from 'react';
import { animate, motion, useReducedMotion } from 'motion/react';
import { EASE } from '@/lib/motion';

const PANELS = [0, 1, 2, 3, 4];
const RUN_KEY = 'tsd.intro.done';

/**
 * Cinematic intro: a counter runs to 100, the wordmark rises, then five
 * panels wipe upward to reveal the site. Runs once per browser session.
 */
export default function Preloader() {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'leaving' | 'done'>(
    sessionStorage.getItem(RUN_KEY) === '1' || reduced ? 'done' : 'loading',
  );

  useEffect(() => {
    if (phase !== 'loading') return;

    const controls = animate(0, 100, {
      duration: 1.5,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (value) => setCount(Math.round(value)),
      onComplete: () => {
        window.setTimeout(() => {
          sessionStorage.setItem(RUN_KEY, '1');
          setPhase('leaving');
        }, 320);
      },
    });

    return () => controls.stop();
  }, [phase]);

  useEffect(() => {
    if (phase === 'loading') {
      document.body.classList.add('is-locked');
      return () => document.body.classList.remove('is-locked');
    }
  }, [phase]);

  /* Safety net: never trap a visitor behind the intro, whatever happens to
     the animation clock (background tab, throttled frame rate, etc). */
  useEffect(() => {
    if (phase === 'done') return;
    const limit = phase === 'loading' ? 4200 : 2600;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(RUN_KEY, '1');
      setPhase('done');
      document.body.classList.remove('is-locked');
    }, limit);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <motion.div
      className="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        if (phase === 'leaving') setPhase('done');
      }}
      aria-hidden="true"
    >
      <div className="preloader__content">
        <motion.div
          className="preloader__mark"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="preloader__initials">TS</span>
          <span className="preloader__rule" />
          <span className="preloader__name">Toviho Segun David</span>
        </motion.div>

        <div className="preloader__meta">
          <motion.span
            className="preloader__role"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Software Developer
          </motion.span>
          <span className="preloader__count">{String(count).padStart(3, '0')}</span>
        </div>

        <div className="preloader__track">
          <div className="preloader__fill" style={{ transform: `scaleX(${count / 100})` }} />
        </div>
      </div>

      <div className="preloader__panels">
        {PANELS.map((index) => (
          <motion.span
            key={index}
            className="preloader__panel"
            initial={{ y: '0%' }}
            animate={phase === 'leaving' ? { y: '-101%' } : { y: '0%' }}
            transition={{ duration: 0.85, ease: EASE, delay: phase === 'leaving' ? index * 0.08 : 0 }}
          />
        ))}
      </div>

      <motion.div
        className="preloader__fade"
        initial={{ opacity: 0 }}
        animate={phase === 'leaving' ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.35 }}
      />
    </motion.div>
  );
}
