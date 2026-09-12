import { useMemo } from 'react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { EASE, maskLineChild, staggerContainer, viewportOnce } from '@/lib/motion';

type MaskedTextProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  /** Split into words (default) or reveal the whole string as one block. */
  split?: 'words' | 'chars' | 'none';
  delay?: number;
  stagger?: number;
  duration?: number;
  /** Animate as soon as it scrolls into view instead of on mount. */
  onScroll?: boolean;
  y?: string;
};

/**
 * Typography reveal. Each word sits inside an overflow-hidden mask and slides
 * up from below, staggered — the signature text animation of the site.
 */
export default function MaskedText({
  text,
  as = 'span',
  className,
  split = 'words',
  delay = 0,
  stagger = 0.045,
  duration = 0.9,
  onScroll = false,
  y = '115%',
}: MaskedTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, viewportOnce);
  const Tag = motion[as] as typeof motion.span;

  const pieces = useMemo(() => {
    if (split === 'none') return [text];
    if (split === 'chars') return text.split('');
    return text.split(' ');
  }, [text, split]);

  const animate = onScroll ? (inView ? 'show' : 'hidden') : 'show';

  const childVariants = {
    hidden: { y, opacity: 0, rotate: split === 'chars' ? 4 : 2 },
    show: {
      y: '0%',
      opacity: 1,
      rotate: 0,
      transition: { duration, ease: EASE },
    },
  };

  return (
    <Tag
      ref={ref as never}
      className={className}
      variants={staggerContainer(delay, stagger)}
      initial="hidden"
      animate={animate}
    >
      {pieces.map((piece, index) => (
        <span className="mask-group" key={`${piece}-${index}`}>
        <span className="mask">
          <motion.span
            className="mask__inner"
            variants={split === 'none' ? maskLineChild : childVariants}
            style={split === 'chars' ? { marginRight: '-0.02em' } : undefined}
          >
            {piece === ' ' ? '\u00A0' : piece}
          </motion.span>
        </span>
        {split === 'words' ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
