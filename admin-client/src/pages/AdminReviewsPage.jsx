import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { AdminTopbar } from '../components/AdminTopbar.jsx';
import { getReviews, updateReviewVisibility } from '../services/reviewService.js';

function formatDate(value) {
  return new Date(value).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  const searchText = search.trim().toLowerCase();
  const visibleReviews = reviews.filter((review) => {
    const isVisible = review.isVisible !== false;
    const matchesVisibility = visibilityFilter === 'all' || (visibilityFilter === 'visible' ? isVisible : !isVisible);
    const reviewText = `${review.product?.title || ''} ${review.user?.username || ''} ${review.user?.email || ''} ${review.comment || ''}`.toLowerCase();
    return matchesVisibility && reviewText.includes(searchText);
  });

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
      <AdminTopbar title="รีวิวสินค้า" />

      <main className="data-page">
        <header className="page-heading">
          <div><h1>Product Reviews</h1><p>Admin ซ่อนรีวิวที่ไม่เหมาะสมได้โดยไม่ลบข้อมูลถาวร</p></div>
          <button type="button" className="primary-action" onClick={loadReviews} disabled={loading}>{loading ? 'กำลังโหลด…' : 'อัปเดตข้อมูล'}</button>
        </header>

        {error && <div className="dashboard-error" role="alert"><p>{error}</p></div>}
        <section className="filter-toolbar" aria-label="ค้นหาและกรองรีวิว">
          <label className="product-search plain-search">
            <span className="sr-only">ค้นหาสินค้า ลูกค้า หรือข้อความรีวิว</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาสินค้าหรือรีวิว..." />
          </label>
          <div className="filters">
            <select value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value)} aria-label="กรองการมองเห็นรีวิว">
              <option value="all">ทุกสถานะ</option>
              <option value="visible">แสดงอยู่</option>
              <option value="hidden">ซ่อนอยู่</option>
            </select>
          </div>
        </section>
        {loading && reviews.length === 0 && <p className="dashboard-message">กำลังโหลด Reviews…</p>}
        {!loading && !error && reviews.length === 0 && <div className="empty-state"><strong>ยังไม่มีรีวิวสินค้า</strong><p>เฉพาะลูกค้าที่มี Order สำเร็จแล้วเท่านั้นที่สร้างรีวิวได้</p></div>}
        {!loading && reviews.length > 0 && visibleReviews.length === 0 && <div className="empty-state"><strong>ไม่พบรีวิวที่ตรงกับตัวกรอง</strong><p>ลองเปลี่ยนคำค้นหาหรือสถานะ</p></div>}

        {visibleReviews.length > 0 && (
          <section className="review-list">
            {visibleReviews.map((review) => (
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
