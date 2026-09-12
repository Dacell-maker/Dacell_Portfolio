import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';

type SectionHeadProps = {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  aside?: ReactNode;
};

/** Consistent section header: mono eyebrow, masked title, muted lede. */
export default function SectionHead({
  eyebrow,
  title,
  lede,
  className = '',
  aside,
}: SectionHeadProps) {
  return (
    <motion.div
      className={`section-head ${className}`}
      variants={staggerContainer(0, 0.1)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      <motion.span className="eyebrow" variants={fadeUp}>
        {eyebrow}
      </motion.span>
      <motion.h2 className="section-title" variants={fadeUp}>
        {title}
      </motion.h2>
      {lede ? (
        <motion.p className="section-lede" variants={fadeUp}>
          {lede}
        </motion.p>
      ) : null}
      {aside}
    </motion.div>
  );
}
