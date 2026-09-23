import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAdminAuth } from '../context/useAdminAuth.js';
import { getOrders, updateOrderStatus } from '../services/orderService.js';
import { NEXT_STATUSES, STATUS_OPTIONS } from '../utils/orderStatus.js';

function formatMoney(value) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2
  }).format(value || 0);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function AdminOrdersPage() {
  const { user } = useAdminAuth();
  const { openSidebar } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const searchText = search.trim().toLowerCase();
  const visibleOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const orderText = `${order.orderNumber || ''} ${order.user?.username || ''} ${order.customerEmail || ''}`.toLowerCase();
    return matchesStatus && orderText.includes(searchText);
  });

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      setOrders(await getOrders());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function changeStatus(orderId, status) {
    setSavingId(orderId);
    setError('');
    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => (
        order._id === orderId ? updatedOrder : order
      )));
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSavingId('');
    }
  }

  return (
    <div className="admin-content">
      <header className="admin-topbar">
        <button type="button" className="mobile-menu" onClick={openSidebar} aria-label="เปิดเมนู">
          <Menu size={20} />
        </button>
        <strong className="topbar-title">คำสั่งซื้อ</strong>
        <div className="admin-profile"><strong>{user?.username ?? 'Admin'}</strong></div>
      </header>

      <main className="data-page">
        <header className="page-heading">
          <div>
            <h1>Orders</h1>
            <p>รายการคำสั่งซื้อจริงจาก MongoDB</p>
          </div>
          <button type="button" className="primary-action" onClick={loadOrders} disabled={loading}>
            {loading ? 'กำลังโหลด…' : 'อัปเดตข้อมูล'}
          </button>
        </header>

        {error && <div className="dashboard-error" role="alert"><p>{error}</p></div>}
        <section className="filter-toolbar" aria-label="ค้นหาและกรองคำสั่งซื้อ">
          <label className="product-search plain-search">
            <span className="sr-only">ค้นหาเลขที่คำสั่งซื้อ ชื่อลูกค้า หรืออีเมล</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหา Order หรือลูกค้า..." />
          </label>
          <div className="filters">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="กรองสถานะคำสั่งซื้อ">
              <option value="all">ทุกสถานะ</option>
              {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </section>
        {loading && orders.length === 0 && <p className="dashboard-message">กำลังโหลด Orders…</p>}
        {!loading && !error && orders.length === 0 && <div className="empty-state"><strong>ยังไม่มีคำสั่งซื้อ</strong><p>รายการจะปรากฏเมื่อลูกค้าสร้าง Order ผ่าน API</p></div>}
        {!loading && orders.length > 0 && visibleOrders.length === 0 && <div className="empty-state"><strong>ไม่พบคำสั่งซื้อที่ตรงกับตัวกรอง</strong><p>ลองเปลี่ยนคำค้นหาหรือสถานะ</p></div>}

        {visibleOrders.length > 0 && (
          <section className="product-table-card">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>เลขที่ Order</th><th>ลูกค้า</th><th>สินค้า</th><th>ยอดรวม</th><th>วันที่</th><th>สถานะ</th></tr></thead>
                <tbody>
                  {visibleOrders.map((order) => (
                    <tr key={order._id}>
                      <td data-label="เลขที่ Order"><strong>{order.orderNumber}</strong></td>
                      <td data-label="ลูกค้า"><strong>{order.user?.username || 'Customer'}</strong><small>{order.customerEmail}</small></td>
                      <td data-label="สินค้า">{order.items.length} รายการ</td>
                      <td data-label="ยอดรวม" className="price">{formatMoney(order.totalAmount)}</td>
                      <td data-label="วันที่">{formatDate(order.createdAt)}</td>
                      <td data-label="สถานะ">
                        <select
                          className="status-select"
                          value={order.status}
                          disabled={savingId === order._id}
                          onChange={(event) => changeStatus(order._id, event.target.value)}
                        >
                          {STATUS_OPTIONS.filter(([value]) => NEXT_STATUSES[order.status]?.includes(value)).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
