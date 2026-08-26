import React, { useEffect, useState } from 'react';
import { LockKeyhole, LogOut, Package, ShoppingBag, Users, LayoutDashboard } from 'lucide-react';
import { adminAuthService } from './services/adminAuthService.js';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      onLogin(await adminAuthService.login(credentials));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark"><LockKeyhole size={26} /></div>
        <p className="eyebrow">SECURE BACK OFFICE</p>
        <h1>OCCASION Admin</h1>
        <p className="muted">สำหรับผู้ดูแลระบบเท่านั้น ลูกค้าไม่สามารถเข้าสู่ระบบจากหน้านี้ได้</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit}>
          <label>Admin email</label>
          <input
            type="email"
            autoComplete="username"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
          />
          <label>Password</label>
          <input
            type="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
          <button disabled={loading}>{loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ Admin'}</button>
        </form>
      </section>
    </main>
  );
};

const Dashboard = ({ user, onLogout }) => (
  <div className="admin-shell">
    <aside>
      <div className="admin-brand">OCCASION <span>ADMIN</span></div>
      <nav>
        <a className="active"><LayoutDashboard size={18} /> Dashboard</a>
        <a><Package size={18} /> Products</a>
        <a><ShoppingBag size={18} /> Orders</a>
        <a><Users size={18} /> Customers</a>
      </nav>
      <button className="logout" onClick={onLogout}><LogOut size={18} /> ออกจากระบบ</button>
    </aside>
    <main className="dashboard">
      <header>
        <div>
          <p className="eyebrow">BACK OFFICE</p>
          <h1>Dashboard</h1>
        </div>
        <div className="admin-user"><strong>{user.username}</strong><span>{user.email}</span></div>
      </header>
      <section className="welcome">
        <h2>ยินดีต้อนรับกลับ</h2>
        <p>เว็บไซต์นี้เป็นระบบหลังบ้านที่แยกจากหน้าร้าน OCCASION และรับเฉพาะบัญชี role: admin</p>
      </section>
      <section className="stats">
        <article><span>สินค้า</span><strong>10</strong><small>Unisex collection</small></article>
        <article><span>ลูกค้าจำลอง</span><strong>12</strong><small>Development data</small></article>
        <article><span>Lookbook</span><strong>10</strong><small>Ready to publish</small></article>
      </section>
    </main>
  </div>
);

export default function App() {
  const [user, setUser] = useState(adminAuthService.getUser());
  const [checking, setChecking] = useState(Boolean(adminAuthService.getToken()));

  useEffect(() => {
    if (!adminAuthService.getToken()) return;
    adminAuthService.verify()
      .then(setUser)
      .catch(() => {
        adminAuthService.logout();
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="checking">กำลังตรวจสอบสิทธิ์ Admin…</div>;
  if (!user) return <Login onLogin={setUser} />;
  return <Dashboard user={user} onLogout={() => { adminAuthService.logout(); setUser(null); }} />;
}
