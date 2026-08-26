import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService.js';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!isAuthenticated || currentUser?.role === 'admin') {
    if (currentUser?.role === 'admin') authService.logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
