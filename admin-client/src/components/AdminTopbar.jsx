import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAdminAuth } from '../context/useAdminAuth.js';
import { getDashboardSummary } from '../services/dashboardService.js';
import { AdminNotifications } from './AdminNotifications.jsx';

export function AdminTopbar({ title }) {
  const { user } = useAdminAuth();
  const { openSidebar } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(new Date());

  useEffect(() => {
    async function loadNotifications() {
      try {
        setSummary(await getDashboardSummary());
        setUpdatedAt(new Date());
      } catch {
        // The page can still be used when notification data is unavailable.
      }
    }
    loadNotifications();
  }, []);

  const notifications = [];
  if (summary?.lowStockCount > 0) {
    notifications.push({ message: `มีสินค้าใกล้หมด ${summary.lowStockCount} รายการ`, date: updatedAt, path: '/products' });
  }
  if (summary?.inactiveProductCount > 0) {
    notifications.push({ message: `มีสินค้าที่ไม่แสดง ${summary.inactiveProductCount} รายการ`, date: updatedAt, path: '/products' });
  }
  if (summary?.pendingOrderCount > 0) {
    notifications.push({ message: `มี Order รอตรวจสอบ ${summary.pendingOrderCount} รายการ`, date: updatedAt, path: '/orders' });
  }

  return (
    <header className="admin-topbar">
      <button type="button" className="mobile-menu" onClick={openSidebar} aria-label="เปิดเมนู"><Menu size={20} /></button>
      <strong className="topbar-title">{title}</strong>
      <div className="admin-profile">
        <AdminNotifications items={notifications} />
        <strong>{user?.username || 'Admin'} (Supervisor)</strong>
      </div>
    </header>
  );
}
