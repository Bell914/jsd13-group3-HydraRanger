import React, { useState } from "react";
import { Ruler, X } from "lucide-react";
import {
  BODY_SIZE_GUIDE,
  formatMeasurementRange,
  getProductCategory
} from '../../data/sizeGuide.js';

export const ProductSizeGuideModal = ({ isOpen, onClose, product }) => {
  const [unit, setUnit] = useState('inch');
  if (!isOpen) return null;

  const category = getProductCategory(product);
  const isBottom = category === 'bottoms';
  const measurementColumns = isBottom
    ? [
        { key: 'waist', label: 'รอบเอว (Waist)' },
        { key: 'hips', label: 'รอบสะโพก (Hips)' }
      ]
    : [
        { key: 'chest', label: 'รอบอก (Chest)' },
        { key: 'waist', label: 'รอบเอว (Waist)' }
      ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Ruler size={18} />
            <span>ตารางสัดส่วนร่างกาย (Size Guide)</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">เลือกหน่วยที่คุ้นเคย</p>
          <div className="flex rounded-lg border border-gray-200 p-1" aria-label="เลือกหน่วยวัด">
            <button
              type="button"
              onClick={() => setUnit('inch')}
              className={`rounded-md px-3 py-1 text-xs font-bold ${unit === 'inch' ? 'bg-primary text-white' : 'text-gray-600'}`}
            >
              นิ้ว
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`rounded-md px-3 py-1 text-xs font-bold ${unit === 'cm' ? 'bg-primary text-white' : 'text-gray-600'}`}
            >
              ซม.
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700">
            <thead className="bg-slate-100 text-primary uppercase font-bold">
              <tr>
                <th className="px-3 py-2">ไซส์ (Size)</th>
                {measurementColumns.map((column) => (
                  <th key={column.key} className="px-3 py-2">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {BODY_SIZE_GUIDE.map((row) => (
                <tr key={row.size}>
                  <td className="px-3 py-2.5 font-bold text-primary">{row.size}</td>
                  {measurementColumns.map((column) => (
                    <td key={column.key} className="px-3 py-2.5">
                      {formatMeasurementRange(row[column.key], unit)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs leading-5 text-gray-500">
          ตารางนี้เป็นสัดส่วนร่างกายสำหรับระบบต้นแบบ ไม่ใช่ขนาดของตัวเสื้อผ้า หากอยู่ระหว่างสองไซส์ ให้เลือกตามความพอดีที่ต้องการ
        </p>

        <div className="mt-5 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow hover:bg-primary-hover cursor-pointer"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSizeGuideModal;
