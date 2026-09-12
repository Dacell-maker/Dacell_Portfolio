import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from './AuthContext';
import { site } from '@/data/site';

const LINKS = [
  { to: '/admin', label: 'Overview', end: true, icon: 'grid' },
  { to: '/admin/projects', label: 'Projects', end: false, icon: 'layers' },
  { to: '/admin/settings', label: 'Settings', end: false, icon: 'sliders' },
];

function NavIcon({ name }: { name: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const };
  if (name === 'grid')
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="3" y="3" width="6" height="6" rx="1" {...common} />
        <rect x="11" y="3" width="6" height="6" rx="1" {...common} />
        <rect x="3" y="11" width="6" height="6" rx="1" {...common} />
        <rect x="11" y="11" width="6" height="6" rx="1" {...common} />
      </svg>
    );
  if (name === 'layers')
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 3 3 6.5 10 10l7-3.5L10 3Z" {...common} strokeLinejoin="round" />
        <path d="m3 10.5 7 3.5 7-3.5M3 14l7 3.5L17 14" {...common} strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 6h9M15.5 6H17M3 10h3M9.5 10H17M3 14h9M15.5 14H17" {...common} />
      <circle cx="13.5" cy="6" r="2" {...common} />
      <circle cx="7.5" cy="10" r="2" {...common} />
      <circle cx="13.5" cy="14" r="2" {...common} />
    </svg>
  );
}

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <span className="admin__mark">TS</span>
          <div>
            <strong>{site.name}</strong>
            <em>Portfolio admin</em>
          </div>
        </div>

        <nav className="admin__nav" aria-label="Admin">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin__navlink ${isActive ? 'is-active' : ''}`}
            >
              <NavIcon name={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin__sidebar-foot">
          <a className="admin__external" href="/" target="_blank" rel="noreferrer noopener">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 12 12 4M12 4H5.5M12 4v6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            View live site
          </a>
          <button
            type="button"
            className="admin__signout"
            onClick={() => {
              signOut();
              navigate('/admin/login', { replace: true });
            }}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M12 4H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6M14 7l3 3-3 3M17 10H9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin__main">
        <header className="admin__topbar">
          <div className="admin__topbar-mobile">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `admin__tab ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <motion.span className="admin__user" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <i aria-hidden="true" />
            {user?.email ?? 'Signed in'}
          </motion.span>
        </header>

        <div className="admin__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
