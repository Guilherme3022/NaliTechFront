import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tokenStorage } from '@/shared/lib/tokenStorage';
import { useIdleLogout } from '@/shared/lib/idleTimeout';
import { authApi } from './api';
import type { RoleName, UserResponse } from './types';

interface AuthContextValue {
  user: UserResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (...roles: RoleName[]) => boolean;
  setSession: (accessToken: string, refreshToken: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  async function loadUser() {
    if (!tokenStorage.getAccess()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setSession(accessToken: string, refreshToken: string) {
    tokenStorage.set(accessToken, refreshToken);
    setLoading(true);
    await loadUser();
  }

  async function refreshUser() {
    await loadUser();
  }

  async function logout() {
    const refreshToken = tokenStorage.getRefresh();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        /* ignora falha de logout no servidor */
      }
    }
    tokenStorage.clear();
    setUser(null);
    queryClient.clear();
  }

  // Timeout de inatividade (2h): se o usuário não fizer nada, encerra a sessão
  // e manda para a tela de login. Backstop no backend (refresh token de ~2h).
  useIdleLogout(!!user, () => {
    void logout().finally(() => {
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    });
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      hasRole: (...roles: RoleName[]) => !!user && user.roles.some((r) => roles.includes(r)),
      setSession,
      refreshUser,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
