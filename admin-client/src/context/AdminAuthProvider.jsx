import { useEffect, useState } from 'react';
import AdminAuthContext from './AdminAuthContext.jsx';
import { adminAuthService } from '../services/adminAuthService.js';

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(adminAuthService.getUser());
  const [loading, setLoading] = useState(Boolean(adminAuthService.getToken()));

  useEffect(() => {
    async function verifyAdmin() {
      if (!adminAuthService.getToken()) {
        setLoading(false);
        return;
      }

      try {
        const adminUser = await adminAuthService.verify();
        setUser(adminUser);
      } catch {
        adminAuthService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifyAdmin();
  }, []);

  async function login(credentials) {
    const adminUser = await adminAuthService.login(credentials);
    setUser(adminUser);
    return adminUser;
  }

  function logout() {
    adminAuthService.logout();
    setUser(null);
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
