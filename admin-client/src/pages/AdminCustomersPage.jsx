import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { CustomerEditModal } from '../components/CustomerEditModal.jsx';
import { useAdminAuth } from '../context/useAdminAuth.js';
import {
  getCustomers,
  updateCustomer,
  updateCustomerStatus
} from '../services/customerService.js';

function formatDate(value) {
  return new Date(value).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function AdminCustomersPage() {
  const { user } = useAdminAuth();
  const { openSidebar } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    setError('');
    try {
      setCustomers(await getCustomers());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function replaceCustomer(updatedCustomer) {
    setCustomers((current) => current.map((customer) => (
      customer._id === updatedCustomer._id ? updatedCustomer : customer
    )));
  }

  async function saveCustomer(customerData) {
    setSaving(true);
    setError('');
    try {
      const updatedCustomer = await updateCustomer(editingCustomer._id, customerData);
      replaceCustomer(updatedCustomer);
      setEditingCustomer(null);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleCustomerStatus(customer) {
    setSaving(true);
    setError('');
    try {
      const updatedCustomer = await updateCustomerStatus(
        customer._id,
        customer.isActive === false
      );
      replaceCustomer(updatedCustomer);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-content">
      <header className="admin-topbar">
        <button type="button" className="mobile-menu" onClick={openSidebar} aria-label="เปิดเมนู">
          <Menu size={20} />
        </button>
        <strong className="topbar-title">ลูกค้า</strong>
        <div className="admin-profile"><strong>{user?.username ?? 'Admin'}</strong></div>
      </header>

      <main className="data-page">
        <header className="page-heading">
          <div><h1>Customers</h1><p>บัญชีลูกค้าจริงจาก MongoDB</p></div>
          <button type="button" className="refresh-button" onClick={loadCustomers} disabled={loading}>
            {loading ? 'กำลังโหลด…' : 'อัปเดตข้อมูล'}
          </button>
        </header>

        {error && <div className="dashboard-error" role="alert"><p>{error}</p></div>}
        {loading && customers.length === 0 && <p className="dashboard-message">กำลังโหลด Customers…</p>}
        {!loading && !error && customers.length === 0 && <div className="empty-state"><strong>ยังไม่มีลูกค้า</strong><p>ลูกค้าที่สมัครสมาชิกจะแสดงในหน้านี้</p></div>}

        {customers.length > 0 && (
          <section className="product-table-card">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>ชื่อลูกค้า</th><th>อีเมล</th><th>วันที่สมัคร</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td data-label="ชื่อลูกค้า"><strong>{customer.username}</strong></td>
                      <td data-label="อีเมล">{customer.email}</td>
                      <td data-label="วันที่สมัคร">{formatDate(customer.createdAt)}</td>
                      <td data-label="สถานะ">
                        <span className={`status ${customer.isActive === false ? 'suspended' : 'active'}`}>
                          {customer.isActive === false ? 'ระงับบัญชี' : 'ใช้งานได้'}
                        </span>
                      </td>
                      <td data-label="จัดการ">
                        <div className="row-actions">
                          <button type="button" onClick={() => setEditingCustomer(customer)} disabled={saving}>แก้ไข</button>
                          <button
                            type="button"
                            className={customer.isActive === false ? '' : 'danger'}
                            onClick={() => toggleCustomerStatus(customer)}
                            disabled={saving}
                          >
                            {customer.isActive === false ? 'เปิดใช้งาน' : 'ระงับ'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {editingCustomer && (
          <CustomerEditModal
            customer={editingCustomer}
            loading={saving}
            onClose={() => setEditingCustomer(null)}
            onSave={saveCustomer}
          />
        )}
      </main>
    </div>
  );
}
