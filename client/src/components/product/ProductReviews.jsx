import React from "react";
import { Star } from "lucide-react";

export const ProductReviews = () => {
  return (
    <section className="my-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
        <h2 className="text-xl font-extrabold text-primary">รีวิว (Reviews)</h2>
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill="currentColor" />
          ))}
        </div>
        <span className="text-sm font-bold text-primary">4.8 / 5</span>
        <span className="text-xs text-secondary">(จากผู้ซื้อ 128 คน)</span>
      </div>

      <div className="divide-y divide-gray-200 mt-6 space-y-6">
        {/* Comment 1 */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-bold text-primary text-sm">Comment</span>
            <span>25/01/2026</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
          </div>
          <p className="text-xs font-semibold text-secondary mb-2">
            คุณเอมิลี่ • <span className="text-emerald-600">ลูกค้าที่ได้รับการยืนยันการซื้อ (Verified)</span>
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            เสื้อผ้านิ่มมาก ทรง Oversized สวยกำลังดี ใส่สบายไม่ร้อนเลย ตรงปกมากครับ คุณภาพเนื้อผ้าคุ้มเกินราคา
          </p>
          <p className="mt-2 text-[11px] text-gray-400">
            ความสูง 160-165 ซม., น้ำหนัก 50-55 กก. • ไซส์ที่ซื้อ: M
          </p>
        </div>

        {/* Comment 2 */}
        <div className="pt-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-bold text-primary text-sm">Comment</span>
            <span>20/01/2026</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
          </div>
          <p className="text-xs font-semibold text-secondary mb-2">
            คุณเจมส์ • <span className="text-emerald-600">ลูกค้าที่ได้รับการยืนยันการซื้อ (Verified)</span>
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            คุณภาพผ้าดีมาก คุ้มราคา แมตช์กับกางเกงได้ง่าย ใส่ไปเที่ยวหรือไปทำงานก็ดูดี สั่งเพิ่มอีกตัวแน่นอน
          </p>
          <p className="mt-2 text-[11px] text-gray-400">
            ความสูง 175-180 ซม., น้ำหนัก 70-75 กก. • ไซส์ที่ซื้อ: L
          </p>
        </div>
      </div>

      <div className="mt-6 text-right">
        <button
          type="button"
          onClick={() => alert("ระบบแสดงความคิดเห็นเพิ่มเติมทั้งหมด")}
          className="text-xs font-bold text-primary hover:text-accent underline cursor-pointer"
        >
          ดูเพิ่มเติม &gt;
        </button>
      </div>
    </section>
  );
};

export default ProductReviews;
