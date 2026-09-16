import React from "react";
import { Ruler, X } from "lucide-react";

export const ProductSizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
            <span>ตารางขนาดสินค้า (Size Guide)</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700">
            <thead className="bg-slate-100 text-primary uppercase font-bold">
              <tr>
                <th className="px-3 py-2">ไซส์ (Size)</th>
                <th className="px-3 py-2">รอบอก (Chest)</th>
                <th className="px-3 py-2">ความยาว (Length)</th>
                <th className="px-3 py-2">ไหล่กว้าง (Shoulder)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2.5 font-bold text-primary">S</td>
                <td className="px-3 py-2.5">102 ซม.</td>
                <td className="px-3 py-2.5">69 ซม.</td>
                <td className="px-3 py-2.5">49 ซม.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-primary">M</td>
                <td className="px-3 py-2.5">108 ซม.</td>
                <td className="px-3 py-2.5">72 ซม.</td>
                <td className="px-3 py-2.5">51 ซม.</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-bold text-primary">L</td>
                <td className="px-3 py-2.5">114 ซม.</td>
                <td className="px-3 py-2.5">74 ซม.</td>
                <td className="px-3 py-2.5">53 ซม.</td>
              </tr>
            </tbody>
          </table>
        </div>

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
