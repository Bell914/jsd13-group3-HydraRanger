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
  ProfilePage,
  ProductListPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  LookbookListPage,
  LookbookDetailPage,
} from "../pages/index.js";
import { ProtectedRoute } from "../components/index.js";
import CustomerService from "../pages/CustomerService.jsx";
import { TermAndCondition } from "../pages/TermAndCondition.jsx";
import PrivacyPolicy from "../pages/PrivacyPage.jsx";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/lookbook" element={<LookbookListPage />} />
      <Route path="/lookbook/:lookId" element={<LookbookDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/ui-kit" element={<UiKitPage />} />
      <Route path="/article" element={<ArticlePages />} />
      <Route path="/article/:id" element={<ArticleDetail />} />
      <Route path="/customerservice" element={<CustomerService />} />
      <Route path="/termsconditions" element={<TermAndCondition />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
