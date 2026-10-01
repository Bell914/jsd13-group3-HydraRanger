import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/Auth/useAuth.jsx";
import { getMyOrders } from "../../services/orderService.js";
import { normalizeImageUrl } from "../../utils/imageUtils.js";
import { EmptyState } from "./EmptyState.jsx";

function getProductId(item) {
  return item.product?._id || item.productId || item.product;
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

function OrderItem({ item }) {
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
      </div>
    </div>
  );
}

function OrderDetails({ order }) {
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
          return (
            <OrderItem
              key={`${item.sku || productId}-${index}`}
              item={item}
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

export const OrderHistorySection = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState("");

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

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">ประวัติการสั่งซื้อ (Order History)</h2>

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
                  <OrderDetails order={order} />
                )}
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
