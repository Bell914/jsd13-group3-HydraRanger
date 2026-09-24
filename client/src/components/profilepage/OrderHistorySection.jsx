import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Package,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/Auth/useAuth.jsx";
import { getMyOrders } from "../../services/orderService.js";
import { normalizeImageUrl } from "../../utils/imageUtils.js";
import { useReviewStore } from "../../store/reviewStore.js";
import { EmptyState } from "./EmptyState.jsx";

const REVIEWABLE_STATUS = "completed";

function getProductId(item) {
  return item.product?._id || item.productId || item.product;
}

function getReviewKey(orderId, productId) {
  return `${orderId}:${productId}`;
}

function getStatusClass(status) {
  if (status === "paid" || status === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "shipped") return "bg-violet-50 text-violet-700";
  if (status === "cancelled" || status === "refunded") {
    return "bg-red-50 text-red-700";
  }
  return "bg-amber-50 text-amber-700";
}

function OrderItem({ order, item, reviewed, onWriteReview }) {
  const productId = getProductId(item);
  const canReview = order.status === REVIEWABLE_STATUS && !reviewed;
  const productName = item.title || item.name || "สินค้า";
  const unitPrice = item.unitPrice ?? item.price ?? 0;
  const lineTotal = item.lineTotal ?? unitPrice * item.quantity;
  const variantDetails = [item.color, item.size, item.variant]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 sm:flex-row sm:items-center">
      {item.imageUrl && (
        <img
          src={normalizeImageUrl(item.imageUrl)}
          alt={productName}
          className="h-16 w-14 rounded-md bg-gray-100 object-cover"
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-700">{productName}</p>
        <p className="text-xs text-gray-400">
          {variantDetails} {item.quantity ? `· x${item.quantity}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-medium">
          ฿{Number(lineTotal).toLocaleString("th-TH")}
        </span>
        {canReview && (
          <button
            type="button"
            onClick={() => onWriteReview(order, item)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:opacity-80"
          >
            <Star size={13} /> เขียนรีวิว
          </button>
        )}
        {reviewed && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <Star size={13} /> รีวิวแล้ว
          </span>
        )}
      </div>
    </div>
  );
}

function OrderDetails({ order, reviewedKeys, onWriteReview }) {
  const total = order.totalAmount ?? order.total ?? 0;
  const shippingAddress = order.shippingAddress || {};
  const recipientName = [shippingAddress.firstName, shippingAddress.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-4 border-t p-4">
      <div className="space-y-2">
        {order.items?.map((item, index) => {
          const productId = getProductId(item);
          const isReviewed = reviewedKeys.includes(getReviewKey(order._id, productId));

          return (
            <OrderItem
              key={`${item.sku || productId}-${index}`}
              order={order}
              item={item}
              reviewed={isReviewed}
              onWriteReview={onWriteReview}
            />
          );
        })}
      </div>

      <div className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
        <div>
          <p className="mb-1 flex items-center gap-2 font-semibold">
            <MapPin size={15} /> ที่อยู่จัดส่ง
          </p>
          <p className="text-xs leading-5 text-gray-600">
            {recipientName}
            <br />
            {shippingAddress.address}
            {shippingAddress.city ? `, ${shippingAddress.city}` : ""}
            {shippingAddress.state ? `, ${shippingAddress.state}` : ""} {shippingAddress.zipCode}
            <br />
            {shippingAddress.phone}
          </p>
        </div>
        <div>
          <p className="mb-1 flex items-center gap-2 font-semibold">
            <CreditCard size={15} /> การชำระเงิน
          </p>
          <p className="text-xs text-gray-600">{order.paymentMethod || "—"}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-2 text-sm font-bold">
        <span>ยอดรวมสุทธิ</span>
        <span className="text-base text-accent">฿{Number(total).toLocaleString("th-TH")}</span>
      </div>
    </div>
  );
}

function ReviewModal({
  target,
  rating,
  comment,
  submitting,
  error,
  onRate,
  onComment,
  onClose,
  onSubmit,
}) {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 id="review-modal-title" className="text-lg font-bold">เขียนรีวิวสินค้า</h3>
            <p className="mt-1 text-sm text-gray-500">{target.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="ปิดหน้าต่าง"
            className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">ให้คะแนนสินค้า</p>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="คะแนนรีวิว">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onRate(value)}
                  aria-label={`${value} ดาว`}
                  aria-checked={rating === value}
                  role="radio"
                  className="p-1"
                >
                  <Star
                    size={26}
                    className={value <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm">{rating ? `${rating}/5` : ""}</span>
            </div>
          </div>

          <label className="block text-sm font-medium">
            ความคิดเห็น
            <textarea
              value={comment}
              onChange={(event) => onComment(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="เล่าประสบการณ์การใช้สินค้า..."
              className="mt-1 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border px-4 py-2 text-sm">
              ยกเลิก
            </button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export const OrderHistorySection = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState("");

  const reviewTarget = useReviewStore((state) => state.reviewTarget);
  const rating = useReviewStore((state) => state.rating);
  const comment = useReviewStore((state) => state.comment);
  const submitting = useReviewStore((state) => state.submitting);
  const reviewMessage = useReviewStore((state) => state.message);
  const reviewError = useReviewStore((state) => state.error);
  const reviewedKeys = useReviewStore((state) => state.reviewedKeys);
  const openReview = useReviewStore((state) => state.openReview);
  const closeReview = useReviewStore((state) => state.closeReview);
  const setRating = useReviewStore((state) => state.setRating);
  const setComment = useReviewStore((state) => state.setComment);
  const submitReview = useReviewStore((state) => state.submitReview);
  const loadMyReviews = useReviewStore((state) => state.loadMyReviews);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setOrders([]);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);
    setOrdersError("");
    getMyOrders()
      .then((result) => {
        if (isMounted) setOrders(Array.isArray(result) ? result : result.data || []);
      })
      .catch((error) => {
        if (isMounted) setOrdersError(error.message || "โหลดประวัติการสั่งซื้อไม่สำเร็จ");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (user) loadMyReviews();
  }, [user, loadMyReviews]);

  function startReview(order, item) {
    openReview(order._id, getProductId(item), item.title || item.name || "สินค้า");
  }

  function handleSubmitReview(event) {
    event.preventDefault();
    submitReview();
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">ประวัติการสั่งซื้อ (Order History)</h2>

      {reviewMessage && (
        <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {reviewMessage}
        </p>
      )}
      {reviewError && !reviewTarget && (
        <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle size={18} /> {reviewError}
        </p>
      )}

      {loading ? (
        <EmptyState title="กำลังโหลดประวัติการสั่งซื้อ..." />
      ) : ordersError ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {ordersError}
        </p>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 px-4 py-12 text-center">
          <Package className="mb-3 text-gray-400" size={34} />
          <p className="font-semibold text-primary">คุณยังไม่มีประวัติการสั่งซื้อ</p>
          <p className="mt-1 max-w-sm text-xs text-secondary">เริ่มเลือกสินค้าที่ชอบ แล้วรายการสั่งซื้อจะแสดงที่นี่</p>
          <Link to="/products" className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white">
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const total = order.totalAmount ?? order.total ?? 0;

            return (
              <article key={order._id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedOrderId(isExpanded ? "" : order._id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-bold text-primary">Order #{order.orderNumber || order._id}</p>
                    <p className="text-xs text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString("th-TH") : "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-bold text-accent">฿{Number(total).toLocaleString("th-TH")}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                    {isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                  </div>
                </button>

                {isExpanded && (
                  <OrderDetails order={order} reviewedKeys={reviewedKeys} onWriteReview={startReview} />
                )}
              </article>
            );
          })}
        </div>
      )}

      <ReviewModal
        target={reviewTarget}
        rating={rating}
        comment={comment}
        submitting={submitting}
        error={reviewError}
        onRate={setRating}
        onComment={setComment}
        onClose={closeReview}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};
