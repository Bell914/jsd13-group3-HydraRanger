import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/useAdminAuth.js';

export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return <div className="checking">กำลังตรวจสอบสิทธิ์ Admin…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
