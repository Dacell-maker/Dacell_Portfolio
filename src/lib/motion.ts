import type { Transition, Variants } from 'motion/react';

/** Shared easing + timing so every animation on the site feels like one system. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_SOFT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const spring: Transition = { type: 'spring', stiffness: 120, damping: 20, mass: 0.6 };
export const springSnappy: Transition = { type: 'spring', stiffness: 420, damping: 30, mass: 0.5 };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -34 },
  show: { opacity: 1, x: 0, transition: { duration: 0.75, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

/** Line/word mask reveal: each child animates up from behind an overflow clip. */
export const maskLineChild: Variants = {
  hidden: { y: '115%', opacity: 0, rotate: 2 },
  show: { y: '0%', opacity: 1, rotate: 0, transition: { duration: 0.95, ease: EASE } },
};

export function staggerContainer(delayChildren = 0.06, stagger = 0.06): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren } },
  };
}

/** Clip-path wipe used on project media. */
export const clipWipe: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)' },
  show: { clipPath: 'inset(0 0 0% 0)', transition: { duration: 1.05, ease: EASE } },
};

export const viewportOnce = { once: true, amount: 0.25 } as const;
