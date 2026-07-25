import AuthGuard from "./AuthGuard";

export default function ProtectedRoute({ roles = [] }) {
  return <AuthGuard roles={roles} />;
}

