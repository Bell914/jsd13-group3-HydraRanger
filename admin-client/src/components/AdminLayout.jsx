import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar.jsx';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function openSidebar() {
    setSidebarOpen(true);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="admin-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-label="ปิดเมนู"
        />
      )}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <Outlet context={{ openSidebar }} />
    </div>
  );
}
