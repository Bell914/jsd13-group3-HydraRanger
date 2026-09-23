import { useEffect, useState } from 'react';
import { AlertCircle, Star } from 'lucide-react';
import { useAuth } from '../../context/Auth/useAuth.jsx';
import { getMyOrders } from '../../services/orderService.js';
import { useReviewStore } from '../../store/reviewStore.js';
import { EmptyState } from './EmptyState.jsx';

const REVIEWABLE_STATUSES = ['paid', 'processing', 'shipped', 'completed'];

export const OrderHistorySection = () => {
  const { user: authUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
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
        if (!cancelled) setOrders(Array.isArray(res?.data) ? res.data : []);
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
        <EmptyState
          title="ยังไม่มีประวัติการสั่งซื้อ"
          description="เริ่มช้อปปิ้งเลยเพื่อดูคำสั่งซื้อของคุณที่นี่"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-bold text-sm text-primary">Order #{order.orderNumber || order._id}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-blue-50 text-blue-600">
                  {order.status}
                </span>
              </div>

              <div className="space-y-2">
                {order.items?.map((item, idx) => {
                  const canReview = REVIEWABLE_STATUSES.includes(order.status);
                  const isReviewing = reviewTarget?.productId === item.product && reviewTarget?.orderId === order._id;
                  return (
                    <div
                      key={`${item.sku || item.product}-${idx}`}
                      className="flex flex-col gap-2 border border-gray-100 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-700">{item.title}</p>
                          <p className="text-xs text-gray-400">
                            {item.variant} x{item.quantity}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-sm font-medium">
                            ฿{item.lineTotal?.toLocaleString() || (item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                          {canReview && !isReviewing && (
                            <button
                              type="button"
                              onClick={() => openReview(order._id, item.product, item.title)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:opacity-80 transition cursor-pointer"
                            >
                              <Star size={13} />
                              รีวิวสินค้า
                            </button>
                          )}
                          {isReviewing && (
                            <button
                              type="button"
                              onClick={closeReview}
                              className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                          )}
                        </div>
                      </div>

                      {canReview && isReviewing && (
                        <form onSubmit={handleSubmitReview} className="mt-2 space-y-3 border-t border-gray-100 pt-3">
                          <div>
                            <p className="mb-1 text-sm font-medium text-gray-600">
                              ให้คะแนนสินค้า "{reviewTarget.title}"
                            </p>
                            <div className="flex items-center gap-1" role="radiogroup" aria-label="คะแนนรีวิว">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  aria-label={`${star} ดาว`}
                                  aria-checked={reviewRating === star}
                                  role="radio"
                                  className="p-0.5 cursor-pointer transition hover:scale-110"
                                >
                                  <Star
                                    size={22}
                                    className={
                                      star <= reviewRating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                    }
                                  />
                                </button>
                              ))}
                              <span className="ml-2 text-sm font-semibold text-secondary">
                                {reviewRating ? `${reviewRating}/5` : ''}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label htmlFor={`review-comment-${order._id}-${item.product}`} className="mb-1 block text-sm font-medium text-gray-600">
                              ความคิดเห็น
                            </label>
                            <textarea
                              id={`review-comment-${order._id}-${item.product}`}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              rows={3}
                              maxLength={1000}
                              placeholder="เล่าประสบการณ์การใช้สินค้า..."
                              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none resize-none"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="submit"
                              disabled={reviewSubmitting}
                              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white shadow hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                            >
                              <Star size={14} />
                              {reviewSubmitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-2 flex justify-between items-center font-bold text-sm">
                <span>ยอดรวมสุทธิ</span>
                <span className="text-accent text-base">฿{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};