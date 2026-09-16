import React from 'react';
import { EmptyState } from './EmptyState.jsx';

export const OrderHistorySection = ({ orders = [] }) => (
  <div>
    <h3 className="text-lg font-bold text-primary border-b border-occasion-border/40 pb-4 mb-4">ประวัติการสั่งซื้อ (Order History)</h3>
    {orders.length === 0 ? (
      <EmptyState
        title="ยังไม่มีประวัติการสั่งซื้อ"
        description="เมื่อคุณทำการสั่งซื้อสินค้า รายการคำสั่งซื้อทั้งหมดจะแสดงที่นี่"
      />
    ) : (
      <div className="space-y-3">
        {/* รายการ คำสั่งซื้อ */}
      </div>
    )}
  </div>
);