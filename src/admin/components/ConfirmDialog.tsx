import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import { useBodyScrollLock } from '@/hooks/useMediaQuery';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Accessible confirmation modal — used before destructive actions. */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="modal__backdrop" onClick={onCancel} aria-hidden="true" />
          <motion.div
            className="modal__panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <h2 id="modal-title">{title}</h2>
            <p>{description}</p>
            <div className="modal__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel} disabled={busy}>
                <span className="btn__label">{cancelLabel}</span>
              </button>
              <button
                ref={confirmRef}
                type="button"
                className={`btn btn--sm ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`}
                onClick={onConfirm}
                disabled={busy}
              >
                <span className="btn__label">{busy ? 'Working…' : confirmLabel}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
