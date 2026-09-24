import { useEffect, useState } from 'react';
import { AlertCircle, Star, Package, ChevronDown, ChevronUp, MapPin, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { normalizeImageUrl } from '../../utils/imageUtils.js';
import { useAuth } from '../../context/Auth/useAuth.jsx';
import { getMyOrders } from '../../services/orderService.js';
import { useReviewStore } from '../../store/reviewStore.js';
import { EmptyState } from './EmptyState.jsx';

const REVIEWABLE_STATUS = 'completed';

function getProductId(item) {
  return item.product?._id || item.product;
}

export const OrderHistorySection = () => {
  const { user: authUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const reviewTarget = useReviewStore((state) => state.reviewTarget);
  const reviewRating = useReviewStore((state) => state.rating);
  const reviewComment = useReviewStore((state) => state.comment);
  const reviewSubmitting = useReviewStore((state) => state.submitting);
  const reviewMsg = useReviewStore((state) => state.message);
  const reviewError = useReviewStore((state) => state.error);
  const openReview = useReviewStore((state) => state.openReview);
  const closeReview = useReviewStore((state) => state.closeReview);
  const setReviewRating = useReviewStore((state) => state.setRating);
  const setReviewComment = useReviewStore((state) => state.setComment);
  const submitReview = useReviewStore((state) => state.submitReview);
  const reviewedKeys = useReviewStore((state) => state.reviewedKeys);
  const loadMyReviews = useReviewStore((state) => state.loadMyReviews);

  useEffect(() => {
    let cancelled = false;
    if (!authUser) {
      setOrdersLoading(false);
      return undefined;
    }
    setOrdersLoading(true);
    setOrdersError('');
    getMyOrders()
      .then((res) => {
        if (!cancelled) setOrders(Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setOrdersError(err.message || 'ไม่สามารถโหลดประวัติการสั่งซื้อได้');
        }
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authUser]);

  useEffect(() => {
    if (authUser) loadMyReviews();
  }, [authUser, loadMyReviews]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    submitReview();
  };

  return (
      <div>
      <h2 className="text-lg font-semibold mb-4">ประวัติการสั่งซื้อ (Order History)</h2>

      {reviewMsg && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <span>{reviewMsg}</span>
        </div>
      )}
      {reviewError && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle size={18} className="shrink-0" />
          <span>{reviewError}</span>
        </div>
      )}

      {ordersLoading ? (
        <EmptyState title="กำลังโหลดประวัติการสั่งซื้อ..." />
      ) : ordersError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <span>{ordersError}</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 px-4 py-12 text-center">
          <Package className="mb-3 text-gray-400" size={34} />
          <p className="font-semibold text-primary">คุณยังไม่มีประวัติการสั่งซื้อ</p>
          <p className="mt-1 max-w-sm text-xs text-secondary">เริ่มเลือกสินค้าที่ชอบ แล้วรายการสั่งซื้อจะแสดงที่นี่</p>
          <Link to="/products" className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover">เลือกซื้อสินค้า</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <button type="button" aria-expanded={expandedOrderId === order._id} onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)} className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-gray-50">
                <div>
                  <p className="font-bold text-sm text-primary">Order #{order.orderNumber || order._id}</p>
                  <p className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleString('th-TH') : '—'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3"><span className="text-sm font-bold text-accent">฿{Number(order.totalAmount ?? order.total ?? 0).toLocaleString('th-TH')}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${order.status === 'paid' || order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : order.status === 'shipped' ? 'bg-violet-50 text-violet-700' : order.status === 'cancelled' || order.status === 'refunded' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{order.status}</span>{expandedOrderId === order._id ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</div>
              </button>

              {expandedOrderId === order._id && <div className="space-y-4 border-t p-4">
              <div className="space-y-2">
                {order.items?.map((item, idx) => {
                  const productId = getProductId(item);
                  const canReview = order.status === REVIEWABLE_STATUS;
                  const hasReviewed = reviewedKeys.includes(`${order._id}:${productId}`);
                  return (
                    <div
                      key={`${item.sku || item.product}-${idx}`}
                      className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3"
                    >
                      <div className="flex justify-between items-center gap-3">
                        {item.imageUrl ? <img src={normalizeImageUrl(item.imageUrl)} alt={item.title || item.name || 'สินค้า'} className="h-16 w-14 rounded-md bg-gray-100 object-cover" /> : null}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-700">{item.title || item.name || 'สินค้า'}</p>
                          <p className="text-xs text-gray-400">
                            {[item.color, item.size, item.variant].filter(Boolean).join(' · ')}{item.quantity ? ` · x${item.quantity}` : ''}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-sm font-medium">
                            ฿{Number(item.lineTotal ?? (item.unitPrice ?? item.price ?? 0) * item.quantity).toLocaleString('th-TH')}
                          </span>
                          {canReview && !hasReviewed && (
                            <button
                              type="button"
                              onClick={() => openReview(order._id, productId, item.title)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:opacity-80 transition cursor-pointer"
                            >
                              <Star size={13} />
                              รีวิวสินค้า
                            </button>
                          )}
                          {hasReviewed && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <Star size={13} /> รีวิวแล้ว
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              <div className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
                <div><p className="mb-1 flex items-center gap-2 font-semibold"><MapPin size={15}/>ที่อยู่จัดส่ง</p><p className="text-xs leading-5 text-gray-600">{[order.shippingAddress?.firstName, order.shippingAddress?.lastName].filter(Boolean).join(' ')}<br/>{order.shippingAddress?.address}{order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress?.zipCode}<br/>{order.shippingAddress?.phone}</p></div>
                <div><p className="mb-1 flex items-center gap-2 font-semibold"><CreditCard size={15}/>การชำระเงิน</p><p className="text-xs text-gray-600">{order.paymentMethod || '—'}</p></div>
              </div>

              <div className="border-t pt-2 flex justify-between items-center font-bold text-sm">
                <span>ยอดรวมสุทธิ</span>
                <span className="text-accent text-base">฿{Number(order.totalAmount ?? order.total ?? 0).toLocaleString('th-TH')}</span>
              </div>
              </div>}
            </div>
          ))}
        </div>
      )}
      {reviewTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !reviewSubmitting) closeReview(); }}><section role="dialog" aria-modal="true" aria-labelledby="review-modal-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"><div className="mb-4 flex items-start justify-between gap-4"><div><h3 id="review-modal-title" className="text-lg font-bold">เขียนรีวิวสินค้า</h3><p className="mt-1 text-sm text-gray-500">{reviewTarget.title}</p></div><button type="button" onClick={closeReview} disabled={reviewSubmitting} aria-label="ปิดหน้าต่าง" className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40">✕</button></div>{reviewError && <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{reviewError}</p>}<form onSubmit={handleSubmitReview} className="space-y-4"><div><p className="mb-2 text-sm font-medium">ให้คะแนนสินค้า</p><div className="flex items-center gap-1" role="radiogroup" aria-label="คะแนนรีวิว">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setReviewRating(star)} aria-label={`${star} ดาว`} aria-checked={reviewRating === star} role="radio" className="p-1"><Star size={26} className={star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}/></button>)}<span className="ml-2 text-sm">{reviewRating ? `${reviewRating}/5` : ''}</span></div></div><label className="block text-sm font-medium">ความคิดเห็น<textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={4} maxLength={1000} placeholder="เล่าประสบการณ์การใช้สินค้า..." className="mt-1 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none"/></label><div className="flex justify-end gap-3"><button type="button" onClick={closeReview} disabled={reviewSubmitting} className="rounded-xl border px-4 py-2 text-sm">ยกเลิก</button><button type="submit" disabled={reviewSubmitting} className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{reviewSubmitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}</button></div></form></section></div>}
    </div>
  );
};
