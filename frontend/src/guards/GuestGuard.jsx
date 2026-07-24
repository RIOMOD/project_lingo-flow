import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GuestGuard() {
  const { getRoleHome, initializing, isAuthenticated, user } = useAuth();

  if (initializing) {
    return <div className="auth-state">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={getRoleHome(user?.role)} replace />;
  }

  return <Outlet />;
}
