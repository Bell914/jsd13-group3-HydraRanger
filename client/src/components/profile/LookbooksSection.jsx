import React from 'react';
import { EmptyState } from './EmptyState.jsx';

export const LookbooksSection = ({ lookbooks = [] }) => (
  <div>
    <h3 className="text-lg font-bold text-primary border-b border-occasion-border/40 pb-4 mb-4">Favorite Lookbooks</h3>
    {lookbooks.length === 0 ? (
      <EmptyState
        title="ยังไม่มี Lookbook ที่บันทึกไว้"
        description="ค้นหารูปแบบการแต่งตัวสไตล์ Mix & Match ที่ชอบแล้วบันทึกไว้ที่นี่"
      />
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* รายการ Lookbooks เมื่อมีข้อมูล */}
      </div>
    )}
  </div>
);