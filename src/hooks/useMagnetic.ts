import { useCallback, useRef } from 'react';
import { useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useHasFinePointer } from '@/hooks/useMediaQuery';

/**
 * Pointer-attraction hook. Attach the returned ref + style to any
 * motion.a / motion.button / motion.div and it leans toward the cursor,
 * then springs back. Automatically inert on touch devices and when the
 * visitor prefers reduced motion.
 */
export function useMagnetic(strength = 20) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const finePointer = useHasFinePointer();
  const enabled = !reduced && finePointer && strength !== 0;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const relX = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const relY = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      x.set(relX * strength);
      y.set(relY * strength * 0.6);
    },
    [enabled, strength, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    ref,
    style: { x: springX, y: springY },
    handlers: { onMouseMove, onMouseLeave: reset, onBlur: reset },
  };
}
