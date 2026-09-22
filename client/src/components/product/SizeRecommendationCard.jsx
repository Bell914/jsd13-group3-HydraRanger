import { Link } from 'react-router-dom';
import { Ruler, Sparkles } from 'lucide-react';

export function SizeRecommendationCard({ isLoggedIn, isLoading, recommendation, onApply }) {
  if (isLoading) {
    return <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm text-secondary">กำลังคำนวณไซส์ที่เหมาะกับคุณ…</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50 p-4">
        <p className="flex items-center gap-2 font-bold text-primary"><Ruler size={18} /> อยากรู้ว่าไซส์ไหนเหมาะกับคุณ?</p>
        <p className="mt-1 text-sm text-secondary">เข้าสู่ระบบและบันทึกสัดส่วนเพื่อรับคำแนะนำเฉพาะบุคคล</p>
        <Link to="/login" className="mt-3 inline-block text-sm font-bold text-accent underline">เข้าสู่ระบบ</Link>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="mt-5 rounded-xl border border-pink-100 bg-pink-50 p-4">
        <p className="flex items-center gap-2 font-bold text-primary"><Ruler size={18} /> ค้นหาไซส์ที่เหมาะกับคุณ</p>
        <p className="mt-1 text-sm text-secondary">เพิ่มข้อมูล Size & Fit ในหน้า Profile เพื่อเปิดใช้คำแนะนำไซส์</p>
        <Link to="/profile" className="mt-3 inline-block text-sm font-bold text-accent underline">เพิ่มข้อมูล Size & Fit</Link>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-accent"><Sparkles size={17} /> Personalized Size</p>
          <p className="mt-1 text-xl font-black text-primary">เราแนะนำไซส์ {recommendation.size}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-secondary">ความมั่นใจ {recommendation.confidence}</span>
      </div>
      <p className="mt-2 text-sm text-secondary">{recommendation.reason}</p>
      <p className="mt-1 text-xs text-gray-500">อ้างอิงจาก: {recommendation.source} • คำแนะนำอาจแตกต่างตามทรงสินค้า</p>
      <button type="button" onClick={() => onApply(recommendation.size)} className="mt-3 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:opacity-90">
        เลือกไซส์ {recommendation.size}
      </button>
    </div>
  );
}
