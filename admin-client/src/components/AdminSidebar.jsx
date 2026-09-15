const menuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders', disabled: true },
  { id: 'customers', label: 'Customers', disabled: true },
];

export function AdminSidebar({ activePage, isOpen, onClose, onNavigate, onLogout }) {
  return (
    <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`} aria-label="เมนูผู้ดูแลระบบ">
      <header className="sidebar-brand">
        <div className="admin-avatar">ADMIN</div>
        <div>
          <strong>OCCASION</strong>
          <small>Admin Control Panel</small>
        </div>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="ปิดเมนู">
          ปิด
        </button>
      </header>

      <nav className="sidebar-nav" aria-label="เมนูหลัก">
        <p className="nav-group-label">ภาพรวม (Overview)</p>
        {menuItems.map(({ id, label, disabled }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-link ${activePage === id ? 'active' : ''}`}
            onClick={() => !disabled && onNavigate(id)}
            disabled={disabled}
            aria-current={activePage === id ? 'page' : undefined}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <button type="button" className="sidebar-logout" onClick={onLogout}>
        ออกจากระบบ
      </button>
    </aside>
  );
}
