import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../AuthContext';
import { fetchSetupState } from '@/lib/api';
import { site } from '@/data/site';
import { EASE } from '@/lib/motion';

type Mode = 'checking' | 'login' | 'setup';

/**
 * /admin/login — the gate for the hidden dashboard.
 * If no admin exists yet (fresh database) it switches to a one-time setup form
 * that requires the SETUP_TOKEN from the server environment.
 */
export default function AdminLogin() {
  const { signIn, bootstrap } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('checking');
  const [databaseReady, setDatabaseReady] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSetupState()
      .then((state) => {
        if (cancelled) return;
        setDatabaseReady(Boolean(state.configured));
        setMode(state.needsAdmin ? 'setup' : 'login');
      })
      .catch(() => {
        if (cancelled) return;
        setDatabaseReady(false);
        setMode('login');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    try {
      if (mode === 'setup') {
        await bootstrap(
          String(form.get('name') ?? 'Admin'),
          email,
          password,
          String(form.get('setupToken') ?? ''),
        );
      } else {
        await signIn(email, password);
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login__bg" aria-hidden="true" />

      <motion.div
        className="login__card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Link to="/" className="login__back">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Back to portfolio
        </Link>

        <header className="login__head">
          <span className="login__mark">TS</span>
          <div>
            <h1>{mode === 'setup' ? 'Create your admin account' : 'Portfolio admin'}</h1>
            <p>
              {mode === 'setup'
                ? 'First time here — set the credentials you will use to manage projects.'
                : 'Sign in to manage projects, images and visibility.'}
            </p>
          </div>
        </header>

        {!databaseReady ? (
          <div className="login__notice">
            <strong>Database not connected.</strong>
            <p>
              Add <code>MONGODB_URI</code>, <code>JWT_SECRET</code> and <code>SETUP_TOKEN</code> to
              your environment variables, then reload. The public portfolio keeps working in the
              meantime using bundled data. See <code>SETUP.md</code>.
            </p>
          </div>
        ) : null}

        {mode === 'checking' ? (
          <p className="login__loading">Loading…</p>
        ) : (
          <form className="login__form" onSubmit={handleSubmit}>
            {mode === 'setup' ? (
              <div className="field">
                <label className="field__label" htmlFor="name">
                  Your name
                </label>
                <input className="input" id="name" name="name" type="text" defaultValue={site.name} required />
              </div>
            ) : null}

            <div className="field">
              <label className="field__label" htmlFor="email">
                Email
              </label>
              <input
                className="input"
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password">
                Password
              </label>
              <div className="login__password">
                <input
                  className="input"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                  placeholder={mode === 'setup' ? 'At least 8 characters' : '••••••••'}
                  minLength={mode === 'setup' ? 8 : undefined}
                  required
                />
                <button
                  type="button"
                  className="login__eye"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {mode === 'setup' ? (
              <div className="field">
                <label className="field__label" htmlFor="setupToken">
                  Setup token
                </label>
                <input
                  className="input"
                  id="setupToken"
                  name="setupToken"
                  type="password"
                  placeholder="Value of SETUP_TOKEN on the server"
                  required
                />
                <span className="field__hint">
                  This is the <code>SETUP_TOKEN</code> value from your server environment — not a
                  password you invent. Running locally? Open <code>.env.local</code> in the project
                  root: a fresh copy of this repo ships with{' '}
                  <code>SETUP_TOKEN=local-setup-token</code>. On Vercel it is whatever you set in
                  Settings → Environment Variables. It can only be used once, and the dev server
                  must be restarted after you change it.
                </span>
              </div>
            ) : null}

            {error ? (
              <p className="login__error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              <span className="btn__label">
                {busy
                  ? 'Please wait…'
                  : mode === 'setup'
                    ? 'Create admin account'
                    : 'Sign in to dashboard'}
              </span>
            </button>
          </form>
        )}

        <footer className="login__foot">
          <span>{site.name}</span>
          <span>·</span>
          <span>Protected area</span>
        </footer>
      </motion.div>
    </div>
  );
}
