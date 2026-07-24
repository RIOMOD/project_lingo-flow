import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { clearTokens, getAccessToken } from "../services/tokenStorage";

export const AuthContext = createContext(null);

const roleHome = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    if (!getAccessToken()) {
      setInitializing(false);
      return null;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setAuthError(null);
      return currentUser;
    } catch (error) {
      if (error?.status === 401) {
        clearTokens();
        setUser(null);
      }
      setAuthError(error.message);
      return null;
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = useCallback(async (payload) => {
    const data = await authService.login(payload);
    setUser(data.user);
    setAuthError(null);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.registerStudent(payload);
    setUser(data.user);
    setAuthError(null);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      authError,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      reloadUser: loadCurrentUser,
      getRoleHome: (role = user?.role) => roleHome[role] ?? "/",
    }),
    [authError, initializing, loadCurrentUser, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
