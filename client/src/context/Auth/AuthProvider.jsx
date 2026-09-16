import { useState, useCallback, useEffect, useMemo } from "react";
import AuthContext from "./AuthContext.jsx";
import { authService } from "../../services/authService.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      if (!authService.isAuthenticated()) {
        if (active) setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        const sessionUser = res?.data?.user || res?.data;
        if (!active) return;
        setUser(sessionUser);
        localStorage.setItem("occasion_user", JSON.stringify(sessionUser));
      } catch (error) {
        console.error("Session expired or invalid token", error);
        authService.logout();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    initAuth();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    setUser(res?.data?.user || res?.data);
    return res;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await authService.register(userData);
    setUser(res?.data?.user || res?.data);
    return res;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authService.getMe();
    const sessionUser = res?.data?.user || res?.data;
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};