import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AppLayout } from './AppLayout';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const hasFlat = !!user?.membership?.isActive;
  const isOnboarding = location.pathname === '/onboarding';

  if (!hasFlat && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasFlat && isOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isOnboarding) {
    return <Outlet />;
  }

  // Wrap authenticated & flat-assigned routes in AppLayout
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
