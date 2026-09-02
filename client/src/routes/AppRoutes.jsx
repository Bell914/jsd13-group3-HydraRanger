import React from "react";
import { Routes, Route } from "react-router-dom";
import {
  HomePage,
  DashboardPage,
  LoginPage,
  RegisterPage,
  NotFoundPage,
  UiKitPage,
  ArticleDetail,
  ArticlePages,
} from "../pages/index.js";
import { ProtectedRoute } from "../components/index.js";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/ui-kit" element={<UiKitPage />} />
      <Route path="/article" element={<ArticlePages />} />
      <Route path="/article/:id" element={<ArticleDetail />} />

      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
