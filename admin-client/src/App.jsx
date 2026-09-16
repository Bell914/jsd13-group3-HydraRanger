import { useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { AdminSidebar } from './components/AdminSidebar.jsx';
import { AdminProductsPage } from './pages/AdminProductsPage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { adminAuthService } from './services/adminAuthService.js';

function validateLogin(credentials) {
  const errors = {};

  if (!credentials.email.trim()) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!credentials.email.includes('@')) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  if (!credentials.password) {
    errors.password = 'กรุณากรอกรหัสผ่าน';
  }

  return errors;
}

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateCredential(event) {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function submitLogin(event) {
    event.preventDefault();
    const validationErrors = validateLogin(credentials);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const adminUser = await adminAuthService.login(credentials);
      onLogin(adminUser);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark"><LockKeyhole size={26} /></div>
        <p className="eyebrow">SECURE BACK OFFICE</p>
        <h1>OCCASION Admin</h1>
        <p className="muted">สำหรับผู้ดูแลระบบเท่านั้น ลูกค้าไม่สามารถเข้าสู่ระบบจากหน้านี้ได้</p>
        {apiError && <p className="error" role="alert">{apiError}</p>}
        <form onSubmit={submitLogin} noValidate>
          <label>Admin email</label>
          <input
            name="email"
            type="email"
            autoComplete="username"
            value={credentials.email}
            onChange={updateCredential}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <small className="field-error">{errors.email}</small>}
          <label>Password</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={updateCredential}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <small className="field-error">{errors.password}</small>}
          <button type="submit" disabled={loading}>
            {loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ Admin'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(adminAuthService.getUser());
  const [checking, setChecking] = useState(Boolean(adminAuthService.getToken()));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    async function verifyAdmin() {
      if (!adminAuthService.getToken()) {
        setChecking(false);
        return;
      }

      try {
        const adminUser = await adminAuthService.verify();
        setUser(adminUser);
      } catch {
        adminAuthService.logout();
        setUser(null);
      } finally {
        setChecking(false);
      }
    }

    verifyAdmin();
  }, []);

  function openSidebar() {
    setSidebarOpen(true);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function changePage(page) {
    setActivePage(page);
    closeSidebar();
  }

  function logout() {
    adminAuthService.logout();
    setUser(null);
  }

  if (checking) return <div className="checking">กำลังตรวจสอบสิทธิ์ Admin…</div>;
  if (!user) return <Login onLogin={setUser} />;
  return (
    <div className="admin-shell">
      {sidebarOpen && <button type="button" className="sidebar-backdrop" onClick={closeSidebar} aria-label="ปิดเมนู" />}
      <AdminSidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onNavigate={changePage}
        onLogout={logout}
      />
      {activePage === 'dashboard' ? (
        <AdminDashboardPage user={user} onOpenSidebar={openSidebar} />
      ) : (
        <AdminProductsPage user={user} onOpenSidebar={openSidebar} />
      )}
    </div>
  );
}
