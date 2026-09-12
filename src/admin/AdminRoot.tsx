import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './AdminLayout';
import Overview from './pages/Overview';
import ProjectsAdmin from './pages/ProjectsAdmin';
import Settings from './pages/Settings';
import '@/styles/admin.css';

function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === 'checking') {
    return (
      <div className="admin-splash">
        <span className="admin-splash__mark">TS</span>
        <span className="admin-splash__text">Checking session…</span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'checking') {
    return (
      <div className="admin-splash">
        <span className="admin-splash__mark">TS</span>
        <span className="admin-splash__text">Loading…</span>
      </div>
    );
  }
  if (status === 'authenticated') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

/**
 * Hidden administration area.
 * Deliberately not linked from the public navigation — reachable only at /admin.
 */
export default function AdminRoot() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="login"
          element={
            <GuestOnly>
              <AdminLogin />
            </GuestOnly>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Overview />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="projects/new" element={<ProjectsAdmin creating />} />
          <Route path="projects/:id" element={<ProjectsAdmin />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
