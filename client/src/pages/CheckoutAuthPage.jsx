import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, RotateCcw, ShieldCheck, UserRound } from "lucide-react";

export default function CheckoutAuthPage() {
  return (
    <main className="min-h-[75vh] bg-[#f7f5f1] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#c46731]">OCCASION CHECKOUT</p>
          <h1 className="mt-3 text-3xl font-extrabold text-[#263639] sm:text-4xl">ยินดีต้อนรับ</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">เข้าสู่ระบบหรือสร้างบัญชีเพื่อดำเนินการสั่งซื้อของคุณต่อ</p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="flex flex-col rounded-3xl border border-[#e4ddd3] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#263639] text-white"><UserRound size={23} /></div>
            <h2 className="text-xl font-bold text-[#263639]">ลงชื่อเข้าใช้งาน</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">มีบัญชี OCCASION อยู่แล้วหรือไม่? เข้าสู่ระบบเพื่อไปยังขั้นตอนชำระเงิน</p>
            <Link to="/login?redirect=/checkout" className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#263639] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#35474a]">
              เข้าสู่ระบบ <ArrowRight size={17} />
            </Link>
          </section>

          <section className="flex flex-col rounded-3xl border border-[#ead6c8] bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c46731] text-white"><Gift size={23} /></div>
            <h2 className="text-xl font-bold text-[#263639]">หน้าชำระเงินสำหรับลูกค้าใหม่ / สมัครสมาชิก</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">สร้างบัญชีเพื่อรับสิทธิพิเศษและติดตามคำสั่งซื้อได้สะดวกยิ่งขึ้น</p>
            <ul className="mt-5 space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2"><Gift size={16} className="shrink-0 text-[#c46731]" /> รับส่วนลดสำหรับการสั่งซื้อครั้งแรก</li>
              <li className="flex items-center gap-2"><RotateCcw size={16} className="shrink-0 text-[#c46731]" /> เปลี่ยนคืนสินค้าฟรีภายใน 14 วัน</li>
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="shrink-0 text-[#c46731]" /> จัดการข้อมูลและคำสั่งซื้อได้ในบัญชีเดียว</li>
            </ul>
            <Link to="/register?redirect=/checkout" className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#c46731] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#ad5527]">
              สมัครสมาชิก <ArrowRight size={17} />
            </Link>
          </section>
        </div>
        <p className="mt-7 text-center text-xs text-gray-500">สินค้าที่เพิ่มลงในตะกร้าจะยังคงอยู่ระหว่างขั้นตอนนี้</p>
      </div>
    </main>
  );
}
