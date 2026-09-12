import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { cursorStore } from '@/lib/cursor';
import type { CursorState, CursorVariant } from '@/lib/cursor';

const RING_SCALE: Record<CursorVariant, number> = {
  default: 1,
  link: 1.7,
  view: 2.9,
  drag: 2.2,
  send: 2.6,
  hide: 0,
};

function labelFor(variant: CursorVariant): string | undefined {
  switch (variant) {
    case 'view':
      return 'VIEW';
    case 'send':
      return 'SEND';
    case 'drag':
      return 'DRAG';
    default:
      return undefined;
  }
}

/**
 * Desktop-only cursor replacement: a fast dot plus a lagging ring that grows,
 * fills and can print a label ("VIEW PROJECT") depending on what is hovered.
 * Mounted only when a fine pointer is detected — never on touch devices.
 */
export default function CustomCursor() {
  const [state, setState] = useState<CursorState>({ variant: 'default' });
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 350, damping: 32, mass: 0.55 });
  const ringY = useSpring(dotY, { stiffness: 350, damping: 32, mass: 0.55 });

  useEffect(() => cursorStore.subscribe(setState), []);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      dotX.set(event.clientX);
      dotY.set(event.clientY);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dotX, dotY]);

  const label = state.label ?? labelFor(state.variant);
  const targetScale = RING_SCALE[state.variant] ?? 1;

  return (
    <div className="cursor" aria-hidden="true">
      <motion.div
        className="cursor__dot"
        style={{ x: dotX, y: dotY }}
        animate={{ opacity: visible && state.variant !== 'hide' ? 1 : 0, scale: down ? 0.4 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      <motion.div
        className={`cursor__ring cursor__ring--${state.variant}`}
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible && state.variant !== 'hide' ? 1 : 0,
          scale: down ? targetScale * 0.82 : targetScale,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.7 }}
      >
        <AnimatePresence mode="wait">
          {label ? (
            <motion.span
              key={label}
              className="cursor__label"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
