import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createFirstAdmin, fetchSession, getToken, login as apiLogin, setToken } from '@/lib/api';
import type { AdminUser } from '@/types';

type AuthState = {
  user: AdminUser | null;
  status: 'checking' | 'authenticated' | 'unauthenticated';
  signIn: (email: string, password: string) => Promise<void>;
  bootstrap: (name: string, email: string, password: string, setupToken: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthState['status']>('checking');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!getToken()) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }
      try {
        const session = await fetchSession();
        if (!cancelled) {
          setUser(session.user);
          setStatus('authenticated');
        }
      } catch {
        setToken(null);
        if (!cancelled) setStatus('unauthenticated');
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setToken(result.token);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const bootstrap = useCallback(
    async (name: string, email: string, password: string, setupToken: string) => {
      const result = await createFirstAdmin(name, email, password, setupToken);
      setToken(result.token);
      setUser(result.user);
      setStatus('authenticated');
    },
    [],
  );

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ user, status, signIn, bootstrap, signOut }),
    [user, status, signIn, bootstrap, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
