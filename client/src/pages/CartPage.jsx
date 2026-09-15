import { Link } from "react-router-dom";
import useCartStore from "../store/cartStore";

export default function CartPage() {
  // 1. ดึง State & Actions ให้ตรงกับ cartStore.js ของทีม
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCartStore();

  // 2. คำนวณราคารวม
  const subtotal = getTotalPrice();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      {/* 3. เช็คเงื่อนไขจาก cartItems */}
      {!cartItems || cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link
            to="/products"
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        /* Cart Content State */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Loop รายการสินค้าจาก cartItems */}
            {cartItems.map((item) => (
              <div
                key={item.variantId || item._id}
                className="p-4 border rounded-lg flex items-center justify-between gap-4"
              >
                {/* ข้อมูลสินค้า */}
                <div className="flex items-center gap-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{item.name || "Product Name"}</h3>
                    {(item.color || item.size) && (
                      <p className="text-xs text-gray-500">
                        {item.color} / {item.size}
                      </p>
                    )}
                    <p className="text-sm font-medium mt-1">฿{item.price}</p>
                  </div>
                </div>

                {/* 4. ปุ่มปรับจำนวน (+ / -) และปุ่มลบ */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-x text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  {/* ปุ่มลบสินค้า */}
                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* โซน สรุปยอดเงิน */}
          <div className="p-6 border rounded-lg h-fit bg-gray-50">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>฿{subtotal}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
              <span>Total</span>
              <span>฿{subtotal}</span>
            </div>
            <Link
              to="/checkout"
              className="w-full mt-6 bg-black text-white py-3 rounded block text-center hover:bg-gray-800 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}