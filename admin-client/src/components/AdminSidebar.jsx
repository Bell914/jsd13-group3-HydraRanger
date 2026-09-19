import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/useAdminAuth.js';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/products', label: 'Products' },
  { path: '/orders', label: 'Orders' },
  { path: '/customers', label: 'Customers' },
  { path: '/reviews', label: 'Reviews' },
  { path: '/lookbooks', label: 'Lookbooks' },
];

export function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useAdminAuth();

  return (
    <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`} aria-label="เมนูผู้ดูแลระบบ">
      <header className="sidebar-brand">
        <div className="admin-avatar">ADMIN</div>
        <div>
          <strong>OCCASION</strong>
          <small>Admin Control Panel</small>
        </div>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="ปิดเมนู">
          <X size={22} />
        </button>
      </header>

      <nav className="sidebar-nav" aria-label="เมนูหลัก">
        <p className="nav-group-label">ภาพรวม (Overview)</p>
        {menuItems.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button type="button" className="sidebar-logout" onClick={logout}>
        ออกจากระบบ
      </button>
    </aside>
  );
}
