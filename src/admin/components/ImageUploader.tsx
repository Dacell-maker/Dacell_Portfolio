import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { uploadProjectImage } from '@/lib/api';
import { EASE } from '@/lib/motion';

type Props = {
  value: string | null;
  projectName: string;
  onChange: (url: string | null) => void;
};

const MAX_BYTES = 6 * 1024 * 1024;

/**
 * Optional project screenshot uploader.
 * Uploads to Vercel Blob through the API; if Blob is not configured the API
 * returns an inline data URL so nothing blocks you.
 * Leaving it empty is completely fine — the public card renders a designed
 * placeholder instead.
 */
export default function ImageUploader({ value, projectName, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('That file is not an image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Please choose an image under 6 MB.');
      return;
    }

    setBusy(true);
    try {
      const result = await uploadProjectImage(file);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
    event.target.value = '';
  }

  return (
    <div className="uploader">
      <div
        className={`uploader__drop ${dragging ? 'is-dragging' : ''} ${value ? 'has-image' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <AnimatePresence mode="wait">
          {value ? (
            <motion.div
              key="preview"
              className="uploader__preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <img src={value} alt={`${projectName || 'Project'} preview`} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="uploader__empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="m4 17 5-5 4 4 3-2 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="9" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <strong>Drop a screenshot here</strong>
              <span>or browse — PNG / JPG / WebP, up to 6 MB. Optional.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {busy ? (
          <div className="uploader__busy">
            <span className="spinner" aria-hidden="true" />
            Uploading…
          </div>
        ) : null}
      </div>

      <div className="uploader__actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onPick}
          id="project-image"
        />
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <span className="btn__label">{value ? 'Replace image' : 'Choose image'}</span>
        </button>

        {value ? (
          <button
            type="button"
            className="btn btn--ghost btn--sm btn--danger-text"
            onClick={() => onChange(null)}
            disabled={busy}
          >
            <span className="btn__label">Remove</span>
          </button>
        ) : null}

        <span className="uploader__or">
          or paste an image URL
        </span>
      </div>

      <input
        className="input"
        type="url"
        placeholder="https://…/screenshot.png"
        value={value && !value.startsWith('data:') ? value : ''}
        onChange={(event) => onChange(event.target.value.trim() || null)}
        aria-label="Image URL"
      />

      {error ? (
        <p className="uploader__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="field__hint">
          No image yet? The portfolio shows a designed placeholder — never generated artwork.
        </p>
      )}
    </div>
  );
}
