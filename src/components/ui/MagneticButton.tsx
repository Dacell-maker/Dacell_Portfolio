import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useMagnetic } from '@/hooks/useMagnetic';
import { cursorProps, type CursorVariant } from '@/lib/cursor';

type Props = {
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  size?: 'md' | 'sm';
  target?: string;
  rel?: string;
  ariaLabel?: string;
  cursor?: CursorVariant;
  cursorLabel?: string;
  magnetic?: number;
  disabled?: boolean;
  download?: boolean;
};

/**
 * The site's primary call-to-action. Magnetic pull + a lime wipe that slides
 * up from the bottom edge on hover, plus optional custom-cursor state.
 */
export default function MagneticButton({
  href,
  onClick,
  type = 'button',
  className = '',
  children,
  variant = 'ghost',
  size = 'md',
  target,
  rel,
  ariaLabel,
  cursor,
  cursorLabel,
  magnetic = 18,
  disabled = false,
  download = false,
}: Props) {
  const { ref, style, handlers } = useMagnetic(disabled ? 0 : magnetic);
  const cursorHandlers = cursor ? cursorProps(cursor, cursorLabel) : {};

  const classes = ['btn', `btn--${variant}`, size === 'sm' ? 'btn--sm' : '', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="btn__label">{children}</span>
    </>
  );

  const shared = {
    ref: ref as never,
    style,
    className: classes,
    'aria-label': ariaLabel,
    'aria-disabled': disabled || undefined,
    ...handlers,
    ...cursorHandlers,
  };

  if (href) {
    return (
      <motion.a
        {...shared}
        href={disabled ? undefined : href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noreferrer noopener' : undefined)}
        download={download || undefined}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button {...shared} type={type} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {content}
    </motion.button>
  );
}
