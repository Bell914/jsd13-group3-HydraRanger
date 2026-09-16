import React from 'react';
import { EmptyState } from './EmptyState.jsx';

export const AddressSection = ({ addresses = [] }) => (
  <div>
    <h3 className="text-lg font-bold text-primary border-b border-occasion-border/40 pb-4 mb-4">ที่อยู่จัดส่ง (Shipping Addresses)</h3>
    {addresses.length === 0 ? (
      <EmptyState
        title="ยังไม่มีข้อมูลที่อยู่จัดส่ง"
        description="คุณสามารถเพิ่มที่อยู่สำหรับการจัดส่งสินค้าเพื่อความสะดวกในการสั่งซื้อครั้งถัดไป"
      />
    ) : (
      <div className="space-y-3">
        {/* รายการ ที่อยู่จัดส่ง */}
      </div>
    )}
  </div>
);