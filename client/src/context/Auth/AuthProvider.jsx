import { useState, useCallback, useEffect, useMemo } from "react";
import AuthContext from "./AuthContext.jsx";
import { authService } from "../../services/authService.js";
import { useWishlistStore } from "../../store/wishlistStore.js";
import { useLookbookStore } from "../../store/lookbookStore.js";

export const AuthProvider = ({ children }) => {
  // Local storage is only a display cache.  It must never establish an
  // authenticated UI state: the HttpOnly session cookie is the authority and
  // is verified by /auth/me below.  Starting from null prevents a previous
  // user's name/profile from flashing on a shared device after their session
  // has expired or their cookie has been cleared.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      try {
        const res = await authService.getMe();
        const sessionUser = res?.data?.user || res?.data;
        if (!active) return;
        setUser(sessionUser);
        localStorage.setItem("occasion_user", JSON.stringify(sessionUser));
      } catch (error) {
        console.error("Session expired or invalid token", error);
        await authService.logout();
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

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    useWishlistStore.getState().clearWishlist();
    useLookbookStore.getState().clearFavorites();
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authService.getMe();
    const sessionUser = res?.data?.user || res?.data;
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const updateProfile = useCallback(async (userData) => {
    const res = await authService.updateProfile(userData);
    const updated = res?.data?.data || res?.data?.user || res?.data;
    setUser(updated);
    localStorage.setItem("occasion_user", JSON.stringify(updated));
    return updated;
  }, []);

  const changePassword = useCallback(async (data) => {
    return await authService.changePassword(data);
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
      updateProfile,
      changePassword,
    }),
    [user, loading, login, register, logout, refreshUser, updateProfile, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
