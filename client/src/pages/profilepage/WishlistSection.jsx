import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { normalizeImageUrl } from '../../utils/imageUtils.js';
import { EmptyState } from './EmptyState.jsx';

export const WishlistSection = () => {
  const wishlist = useWishlistStore((state) => state.wishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">รายการโปรด (Wishlist)</h2>
      {wishlist.length === 0 ? (
        <EmptyState
          title="ยังไม่มีรายการสินค้าโปรด"
          description="กดหัวใจที่สินค้าที่คุณชอบเพื่อบันทึกไว้ดูภายหลัง"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3"
            >
              <Link to={`/products/${item._id}`} className="shrink-0">
                <img
                  src={normalizeImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="h-20 w-16 rounded-lg object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${item._id}`}
                  className="line-clamp-2 block text-sm font-bold text-primary hover:text-accent transition"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-semibold text-secondary">
                  ฿{item.price.toLocaleString()}.00
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFromWishlist(item._id)}
                className="rounded-full p-2 text-red-500 hover:bg-red-50 transition cursor-pointer"
                title="ลบออกจากรายการโปรด"
                aria-label="ลบออกจากรายการโปรด"
              >
                <Heart size={18} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};