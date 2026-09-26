import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { EmptyState } from './EmptyState.jsx';
import { normalizeImageUrl } from '../../utils/imageUtils.js';
import { useWishlistStore } from '../../store/wishlistStore.js';

export const WishlistSection = ({ items, onRemove }) => {
  const navigate = useNavigate();
  const storeWishlist = useWishlistStore((state) => state.wishlist);
  const storeRemove = useWishlistStore((state) => state.removeFromWishlist);

  const wishlistItems = items !== undefined ? items : storeWishlist;
  const handleRemove = onRemove || storeRemove;

  return (
    <div>
      <h3 className="text-lg font-bold text-primary border-b border-occasion-border/40 pb-4 mb-4">
        รายการโปรด
      </h3>
      {wishlistItems.length === 0 ? (
        <EmptyState
          title="ยังไม่มีรายการสินค้าโปรด"
          description="เลือกกดหัวใจที่สินค้าที่คุณสนใจเพื่อบันทึกไว้ดูภายหลัง"
          actionText="เลือกดูสินค้า"
          onAction={() => navigate('/products')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-xs hover:shadow-md transition"
            >
              <Link to={`/products/${item._id}`} className="shrink-0">
                <img
                  src={normalizeImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="h-20 w-16 rounded-lg object-contain bg-stone-50 border border-gray-100"
                />
              </Link>
              <div className="min-w-0 flex-1">
                {item.category && (
                  <span className="text-[10px] font-semibold text-gray-500 uppercase">
                    {item.category}
                  </span>
                )}
                <Link
                  to={`/products/${item._id}`}
                  className="line-clamp-2 block text-sm font-bold text-primary hover:text-accent transition"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-bold text-[#0046a7]">
                  ฿{(Number(item.price) || 0).toLocaleString()}.00
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item._id)}
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