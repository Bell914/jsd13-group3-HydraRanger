import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout.jsx';
import { AdminProtectedRoute } from '../components/AdminProtectedRoute.jsx';
import { AdminLoginPage } from '../pages/AdminLoginPage.jsx';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.jsx';
import { AdminProductsPage } from '../pages/AdminProductsPage.jsx';
import { AdminOrdersPage } from '../pages/AdminOrdersPage.jsx';
import { AdminCustomersPage } from '../pages/AdminCustomersPage.jsx';
import { AdminReviewsPage } from '../pages/AdminReviewsPage.jsx';
import { AdminLookbooksPage } from '../pages/AdminLookbooksPage.jsx';

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route path="/products" element={<AdminProductsPage />} />
        <Route path="/orders" element={<AdminOrdersPage />} />
        <Route path="/customers" element={<AdminCustomersPage />} />
        <Route path="/reviews" element={<AdminReviewsPage />} />
        <Route path="/lookbooks" element={<AdminLookbooksPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
