import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { EASE } from '@/lib/motion';
import { site } from '@/data/site';

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="container">
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 1.6 }}
        >
          Error 404
        </motion.span>
        <motion.h1
          className="notfound__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.75 }}
        >
          This page doesn&rsquo;t exist.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.95 }}
        >
          The link may be old, or the page may have moved. Head back to the portfolio — the work is
          all there.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 2.1 }}
          style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}
        >
          <Link className="btn btn--primary" to="/">
            <span className="btn__label">Back to portfolio</span>
          </Link>
          <a className="btn" href={`mailto:${site.email}`}>
            <span className="btn__label">Report a broken link</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
