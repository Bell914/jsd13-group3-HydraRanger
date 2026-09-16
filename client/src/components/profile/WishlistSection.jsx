import React from 'react';
import { EmptyState } from './EmptyState.jsx';

export const WishlistSection = ({ items = [] }) => (
  <div>
    <h3 className="text-lg font-bold text-primary border-b border-occasion-border/40 pb-4 mb-4">รายการโปรด (Wishlist)</h3>
    {items.length === 0 ? (
      <EmptyState
        title="ยังไม่มีรายการสินค้าโปรด"
        description="เลือกกดหัวใจที่สินค้าที่คุณสนใจเพื่อบันทึกไว้ดูภายหลัง"
      />
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* รายการ Wishlist เมื่อมีข้อมูล */}
      </div>
    )}
  </div>
);