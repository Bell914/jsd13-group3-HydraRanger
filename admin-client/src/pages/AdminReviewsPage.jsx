import { useEffect, useState } from 'react';
import { Menu, Star } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAdminAuth } from '../context/useAdminAuth.js';
import { getReviews, updateReviewVisibility } from '../services/reviewService.js';

function formatDate(value) {
  return new Date(value).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function AdminReviewsPage() {
  const { user } = useAdminAuth();
  const { openSidebar } = useOutletContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  async function loadReviews() {
    setLoading(true);
    setError('');
    try {
      setReviews(await getReviews());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function toggleVisibility(review) {
    const willBeVisible = review.isVisible === false;
    const action = willBeVisible ? 'แสดง' : 'ซ่อน';
    if (!window.confirm(`ยืนยันการ${action}รีวิวนี้หรือไม่`)) return;

    setSavingId(review._id);
    setError('');
    try {
      const updatedReview = await updateReviewVisibility(review._id, willBeVisible);
      setReviews((current) => current.map((item) => (
        item._id === updatedReview._id ? updatedReview : item
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
        <button type="button" className="mobile-menu" onClick={openSidebar} aria-label="เปิดเมนู"><Menu size={20} /></button>
        <strong className="topbar-title">รีวิวสินค้า</strong>
        <div className="admin-profile"><strong>{user?.username ?? 'Admin'}</strong></div>
      </header>

      <main className="data-page">
        <header className="page-heading">
          <div><h1>Product Reviews</h1><p>Admin ซ่อนรีวิวที่ไม่เหมาะสมได้โดยไม่ลบข้อมูลถาวร</p></div>
          <button type="button" className="refresh-button" onClick={loadReviews} disabled={loading}>{loading ? 'กำลังโหลด…' : 'อัปเดตข้อมูล'}</button>
        </header>

        {error && <div className="dashboard-error" role="alert"><p>{error}</p></div>}
        {loading && reviews.length === 0 && <p className="dashboard-message">กำลังโหลด Reviews…</p>}
        {!loading && !error && reviews.length === 0 && <div className="empty-state"><strong>ยังไม่มีรีวิวสินค้า</strong><p>เฉพาะลูกค้าที่มี Order ชำระแล้วเท่านั้นที่สร้างรีวิวได้</p></div>}

        {reviews.length > 0 && (
          <section className="review-list">
            {reviews.map((review) => (
              <article className={`review-card ${review.isVisible === false ? 'is-hidden' : ''}`} key={review._id}>
                <header>
                  <div>
                    <strong>{review.product?.title || 'สินค้า'}</strong>
                    <small>{review.user?.username || 'Customer'} • {review.user?.email}</small>
                  </div>
                  <span className={`status ${review.isVisible === false ? 'suspended' : 'active'}`}>{review.isVisible === false ? 'ซ่อนอยู่' : 'แสดงอยู่'}</span>
                </header>
                <div className="review-rating" aria-label={`${review.rating} ดาว`}>
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} size={16} fill={index < review.rating ? 'currentColor' : 'none'} />)}
                </div>
                <p>{review.comment}</p>
                <footer>
                  <small>{formatDate(review.createdAt)}</small>
                  <button type="button" className={review.isVisible === false ? '' : 'danger'} onClick={() => toggleVisibility(review)} disabled={savingId === review._id}>
                    {savingId === review._id ? 'กำลังบันทึก…' : review.isVisible === false ? 'แสดงรีวิว' : 'ซ่อนรีวิว'}
                  </button>
                </footer>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
