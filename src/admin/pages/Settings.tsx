import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { ApiHealth } from '@/types';
import { fetchHealth, seedDatabase } from '@/lib/api';
import { EASE } from '@/lib/motion';
import { useAuth } from '../AuthContext';
import { site } from '@/data/site';
import ConfirmDialog from '../components/ConfirmDialog';

const VARS = [
  {
    name: 'MONGODB_URI',
    where: 'Server',
    purpose: 'MongoDB Atlas connection string — where projects are stored.',
  },
  { name: 'MONGODB_DB', where: 'Server', purpose: 'Database name (defaults to “portfolio”).' },
  { name: 'JWT_SECRET', where: 'Server', purpose: 'Signs admin sessions. Long random string.' },
  {
    name: 'SETUP_TOKEN',
    where: 'Server',
    purpose: 'One-time token used to create the first admin account.',
  },
  {
    name: 'BLOB_READ_WRITE_TOKEN',
    where: 'Server',
    purpose: 'Vercel Blob — CDN hosting for project screenshots.',
  },
  { name: 'VITE_FORMSPREE_ID', where: 'Client', purpose: 'Formspree form id for the contact form.' },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [confirmSeed, setConfirmSeed] = useState(false);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  async function runSeed() {
    setSeeding(true);
    setMessage(null);
    try {
      const result = await seedDatabase();
      setMessage({
        tone: 'ok',
        text: `Seed complete — ${result.inserted} project${result.inserted === 1 ? '' : 's'} added, ${result.total} in the database.`,
      });
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Seeding failed.' });
    } finally {
      setSeeding(false);
      setConfirmSeed(false);
    }
  }

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <span className="page__eyebrow">Configuration</span>
          <h1>Settings</h1>
          <p>Connection status, environment variables and one-off data tools.</p>
        </div>
      </header>

      {message ? (
        <motion.div
          className={`alert alert--${message.tone === 'ok' ? 'success' : 'error'}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <p>{message.text}</p>
        </motion.div>
      ) : null}

      <div className="settings__grid">
        <section className="panel">
          <header className="panel__head">
            <h2>Connections</h2>
          </header>
          <ul className="system system--rows">
            <li>
              <span className={`dot ${health?.database ? 'dot--ok' : 'dot--bad'}`} />
              MongoDB Atlas
              <em>{health ? (health.database ? 'Connected' : 'Not connected') : 'Checking…'}</em>
            </li>
            <li>
              <span className={`dot ${health?.blob ? 'dot--ok' : 'dot--warn'}`} />
              Vercel Blob
              <em>
                {health
                  ? health.blob
                    ? 'Configured — uploads go to the CDN'
                    : 'Not configured — uploads stored inline'
                  : 'Checking…'}
              </em>
            </li>
            <li>
              <span className={`dot ${health?.configured ? 'dot--ok' : 'dot--bad'}`} />
              Admin authentication
              <em>{health ? (health.configured ? 'Enabled' : 'JWT_SECRET missing') : 'Checking…'}</em>
            </li>
          </ul>
        </section>

        <section className="panel">
          <header className="panel__head">
            <h2>Account</h2>
          </header>
          <dl className="kv">
            <div>
              <dt>Signed in as</dt>
              <dd>{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{user?.name ?? site.name}</dd>
            </div>
          </dl>
          <button type="button" className="btn btn--ghost btn--sm" onClick={signOut}>
            <span className="btn__label">Sign out</span>
          </button>
        </section>

        <section className="panel panel--wide">
          <header className="panel__head">
            <h2>Environment variables</h2>
            <span className="panel__note">Set these in Vercel → Settings → Environment Variables</span>
          </header>
          <div className="vars">
            {VARS.map((variable) => (
              <div className="vars__row" key={variable.name}>
                <code>{variable.name}</code>
                <span className={`tag ${variable.where === 'Client' ? 'tag--accent' : ''}`}>
                  {variable.where}
                </span>
                <p>{variable.purpose}</p>
              </div>
            ))}
          </div>
          <p className="panel__foot">
            Full walkthrough — Atlas cluster, network access, Blob store, Formspree and deployment —
            is in <code>SETUP.md</code> in the project root.
          </p>
        </section>

        <section className="panel">
          <header className="panel__head">
            <h2>Data tools</h2>
          </header>
          <p className="panel__copy">
            Seed writes the eight projects this portfolio shipped with (including DAVICELL and
            Fluffy&rsquo;n&rsquo;Yummy Mall) into your database. It never overwrites a project that
            already exists, and it never adds images.
          </p>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setConfirmSeed(true)}
            disabled={seeding || !health?.database}
          >
            <span className="btn__label">{seeding ? 'Seeding…' : 'Seed bundled projects'}</span>
          </button>
          {!health?.database ? (
            <p className="field__hint">Connect MongoDB first to use this.</p>
          ) : null}
        </section>
      </div>

      <ConfirmDialog
        open={confirmSeed}
        tone="default"
        title="Seed bundled projects?"
        description="This inserts any missing projects from the bundled seed list into your database. Existing projects are left untouched."
        confirmLabel="Seed projects"
        cancelLabel="Cancel"
        busy={seeding}
        onConfirm={() => void runSeed()}
        onCancel={() => setConfirmSeed(false)}
      />
    </div>
  );
}
