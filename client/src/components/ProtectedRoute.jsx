import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth/useAuth.jsx";
import { LoadingSpinner } from "./index.js";

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (user?.role === "admin") logout();
  }, [user?.role, logout]);

  if (loading) return <LoadingSpinner message="Checking session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};