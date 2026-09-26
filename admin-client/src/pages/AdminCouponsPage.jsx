import { useEffect, useState } from 'react';
import { AdminTopbar } from '../components/AdminTopbar.jsx';
import { CouponFormModal } from '../components/CouponFormModal.jsx';
import { couponService } from '../services/couponService.js';

const formatDate = (value) => value ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';
const isExpiringSoon = (value) => {
  const remaining = new Date(value).getTime() - Date.now();
  return remaining > 0 && remaining <= 7 * 24 * 60 * 60 * 1000;
};

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  async function loadCoupons() {
    setLoading(true); setError('');
    try { setCoupons(await couponService.list()); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { loadCoupons(); }, []);

  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(coupon) {
    setEditing(coupon);
    setFormOpen(true);
  }
  function closeModal() { setEditing(null); setFormOpen(false); }

  async function handleSaveCoupon(payload) {
    setSaving(true); setError('');
    try {
      const saved = editing
        ? await couponService.update(editing._id, payload)
        : await couponService.create(payload);
      setCoupons((current) => editing ? current.map((c) => c._id === saved._id ? saved : c) : [saved, ...current]);
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleCoupon(coupon) {
    setSaving(true); setError('');
    try {
      const saved = await couponService.setActive(coupon._id, !coupon.isActive);
      setCoupons((current) => current.map((item) => item._id === saved._id ? saved : item));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const visibleCoupons = coupons.filter((coupon) => {
    if (filter === 'expiring') return isExpiringSoon(coupon.expiresAt);
    if (filter === 'expired') return new Date(coupon.expiresAt) <= new Date();
    if (filter === 'event') return Boolean(coupon.eventName);
    return true;
  });
  const expiringCount = coupons.filter((coupon) => coupon.isActive && isExpiringSoon(coupon.expiresAt)).length;
  const expiredCount = coupons.filter((coupon) => new Date(coupon.expiresAt) <= new Date()).length;

  return (
    <div className="admin-content">
      <AdminTopbar title="Coupons" />
      <main className="data-page">
        <header className="page-heading">
          <div>
            <h1>คูปองส่วนลด</h1>
            <p>สร้างคูปองสำหรับแคมเปญ และติดตามวันหมดอายุได้จากที่เดียว</p>
          </div>
          <button type="button" className="primary-action" onClick={openCreate}>
            เพิ่มคูปอง
          </button>
        </header>

        {error && (
          <div className="dashboard-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={loadCoupons}>ลองใหม่</button>
          </div>
        )}

        <section className="summary-grid coupon-summary" aria-label="สรุปสถานะคูปอง">
          <article className="summary-card">
            <p>คูปองทั้งหมด</p>
            <strong>{coupons.length}</strong>
            <small>คูปองที่สร้างในระบบ</small>
          </article>
          <article className="summary-card">
            <p>ใกล้หมดอายุ</p>
            <strong>{expiringCount}</strong>
            <small>ภายใน 7 วัน</small>
          </article>
          <article className="summary-card">
            <p>หมดอายุแล้ว</p>
            <strong>{expiredCount}</strong>
            <small>ควรปิดหรือสร้างใหม่</small>
          </article>
          <article className="summary-card">
            <p>คูปองตามอีเวนต์</p>
            <strong>{coupons.filter((coupon) => coupon.eventName).length}</strong>
            <small>ผูกกับแคมเปญ</small>
          </article>
        </section>

        <section className="filter-toolbar" aria-label="กรองคูปอง">
          <div className="filters">
            <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="กรองสถานะคูปอง">
              <option value="all">คูปองทั้งหมด</option>
              <option value="expiring">ใกล้หมดอายุ (7 วัน)</option>
              <option value="expired">หมดอายุแล้ว</option>
              <option value="event">คูปองตามอีเวนต์</option>
            </select>
          </div>
        </section>

        {loading && <p className="dashboard-message">กำลังโหลดคูปอง…</p>}

        {!loading && coupons.length === 0 && (
          <div className="empty-state">
            <strong>ยังไม่มีคูปอง</strong>
            <p>กดเพิ่มคูปองเพื่อเริ่มโปรโมชั่น</p>
          </div>
        )}

        {!loading && coupons.length > 0 && visibleCoupons.length === 0 && (
          <div className="empty-state">
            <strong>ไม่พบคูปองตามตัวกรอง</strong>
            <p>ลองเปลี่ยนตัวกรองหรือเพิ่มคูปองใหม่</p>
          </div>
        )}

        {!loading && visibleCoupons.length > 0 && (
          <section className="product-table-card">
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code / อีเวนต์</th>
                    <th>ส่วนลด</th>
                    <th>ยอดขั้นต่ำ</th>
                    <th>หมดอายุ</th>
                    <th>สถานะ</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCoupons.map((coupon) => {
                    const expired = new Date(coupon.expiresAt) <= new Date();
                    const nearExpiry = isExpiringSoon(coupon.expiresAt);
                    return (
                      <tr key={coupon._id}>
                        <td data-label="Code / อีเวนต์">
                          <strong>{coupon.code}</strong>
                          <small>{coupon.eventName || 'ทั่วไป (ไม่มีอีเวนต์)'}</small>
                        </td>
                        <td data-label="ส่วนลด">{coupon.discountValue}%</td>
                        <td data-label="ยอดขั้นต่ำ">
                          ฿{Number(coupon.minPurchase || 0).toLocaleString()}
                        </td>
                        <td data-label="หมดอายุ">
                          {formatDate(coupon.expiresAt)}
                          {nearExpiry && <small className="coupon-alert">ใกล้หมดอายุ</small>}
                        </td>
                        <td data-label="สถานะ">
                          <span className={`status ${coupon.isActive && !expired ? 'active' : 'suspended'}`}>
                            {expired ? 'หมดอายุ' : coupon.isActive ? 'เปิดใช้' : 'ปิดใช้'}
                          </span>
                        </td>
                        <td data-label="จัดการ">
                          <div className="row-actions">
                            <button type="button" onClick={() => openEdit(coupon)} disabled={saving}>
                              แก้ไข
                            </button>
                            <button
                              type="button"
                              className={coupon.isActive ? 'danger' : ''}
                              onClick={() => toggleCoupon(coupon)}
                              disabled={saving}
                            >
                              {coupon.isActive ? 'ปิดใช้' : 'เปิดใช้'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {formOpen && (
          <CouponFormModal
            coupon={editing}
            saving={saving}
            onClose={closeModal}
            onSave={handleSaveCoupon}
          />
        )}
      </main>
    </div>
  );
}
