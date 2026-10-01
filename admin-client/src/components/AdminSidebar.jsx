import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/useAdminAuth.js';

const menuItems = [
  { path: '/dashboard', label: 'ภาพรวมร้านค้า' },
  { path: '/products', label: 'สินค้า' },
  { path: '/orders', label: 'คำสั่งซื้อ' },
  { path: '/customers', label: 'ลูกค้า' },
  { path: '/lookbooks', label: 'ลุคบุ๊ก' },
  { path: '/articles', label: 'บทความ' },
  { path: '/coupons', label: 'คูปอง' },
];

export function AdminSidebar({ isOpen, onClose }) {
  const { logout } = useAdminAuth();

  return (
    <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`} aria-label="เมนูผู้ดูแลระบบ">
      <header className="sidebar-brand">
        <div className="admin-avatar">แอดมิน</div>
        <div>
          <strong>OCCASION</strong>
          <small>ระบบจัดการร้านค้า</small>
        </div>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="ปิดเมนู">
          <X size={22} />
        </button>
      </header>

      <nav className="sidebar-nav" aria-label="เมนูหลัก">
        <p className="nav-group-label">เมนูหลัก</p>
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
