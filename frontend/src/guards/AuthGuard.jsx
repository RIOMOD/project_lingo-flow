import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthGuard({ roles = [] }) {
  const { initializing, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="auth-state">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
