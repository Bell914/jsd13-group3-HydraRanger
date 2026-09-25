import { useEffect, useState } from 'react';
import { AdminTopbar } from '../components/AdminTopbar.jsx';
import { CustomerEditModal } from '../components/CustomerEditModal.jsx';
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
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const searchText = search.trim().toLowerCase();
  const visibleCustomers = customers.filter((customer) => {
    const isActive = customer.isActive !== false;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? isActive : !isActive);
    const customerText = `${customer.username || ''} ${customer.email || ''}`.toLowerCase();
    return matchesStatus && customerText.includes(searchText);
  });

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
      <AdminTopbar title="Customers" />

      <main className="data-page">
        <header className="page-heading">
          <div><h1>ลูกค้า</h1><p>บัญชีลูกค้าจริงจาก MongoDB</p></div>
          <button type="button" className="primary-action" onClick={loadCustomers} disabled={loading}>
            {loading ? 'กำลังโหลด…' : 'อัปเดตข้อมูล'}
          </button>
        </header>

        {error && <div className="dashboard-error" role="alert"><p>{error}</p></div>}
        <section className="filter-toolbar" aria-label="ค้นหาและกรองลูกค้า">
          <label className="product-search plain-search">
            <span className="sr-only">ค้นหาชื่อลูกค้าหรืออีเมล</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อหรืออีเมล..." />
          </label>
          <div className="filters">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="กรองสถานะลูกค้า">
              <option value="all">ทุกสถานะ</option>
              <option value="active">ใช้งานได้</option>
              <option value="suspended">ระงับบัญชี</option>
            </select>
          </div>
        </section>
        {loading && customers.length === 0 && <p className="dashboard-message">กำลังโหลด Customers…</p>}
        {!loading && !error && customers.length === 0 && <div className="empty-state"><strong>ยังไม่มีลูกค้า</strong><p>ลูกค้าที่สมัครสมาชิกจะแสดงในหน้านี้</p></div>}
        {!loading && customers.length > 0 && visibleCustomers.length === 0 && <div className="empty-state"><strong>ไม่พบลูกค้าที่ตรงกับตัวกรอง</strong><p>ลองเปลี่ยนคำค้นหาหรือสถานะ</p></div>}

        {visibleCustomers.length > 0 && (
          <section className="product-table-card">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>ชื่อลูกค้า</th><th>อีเมล</th><th>วันที่สมัคร</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
                <tbody>
                  {visibleCustomers.map((customer) => (
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
