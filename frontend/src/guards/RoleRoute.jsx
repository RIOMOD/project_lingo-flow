import AuthGuard from "./AuthGuard";

export default function RoleRoute({ roles = [] }) {
  return <AuthGuard roles={roles} />;
}

