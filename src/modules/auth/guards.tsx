import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { RoleName } from './types';

function FullScreenLoader() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

// Exige apenas estar autenticado.
export function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

// Exige um dos perfis informados (E1.5 — RequireRole reutilizável).
export function RequireRole({ roles }: { roles: RoleName[] }) {
  const { hasRole, loading, isAuthenticated } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasRole(...roles)) return <Navigate to="/" replace />;
  return <Outlet />;
}

// Redireciona usuários CLIENTE para o portal simplificado (E16).
export function RoleBasedRedirect() {
  const { hasRole } = useAuth();
  if (hasRole('CLIENTE') && !hasRole('ADMIN', 'CONTADOR', 'AUXILIAR')) {
    return <Navigate to="/portal" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}
