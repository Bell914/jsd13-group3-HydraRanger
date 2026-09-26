# สไลด์ Review — OCCASION Sprint 3

เนื้อหานี้เป็น outline สำหรับนำไปทำ Google Slides, PowerPoint หรือ Canva โดยตรวจเทียบกับ codebase Sprint 3 แล้ว

## สไลด์ 1 — OCCASION

**E-commerce เสื้อผ้า Unisex + Lookbook + Personalized Experience**

- ทีม HydraRanger, Group 3 — JSD13
- Customer Client, Admin Client และ Express API

## สไลด์ 2 — แนวคิดและปัญหาที่แก้

- เลือกซื้อเสื้อผ้าและ Complete Look ในระบบเดียว
- ลดความไม่มั่นใจเรื่องไซส์ด้วย Personalized Size Recommendation
- ใช้ Mix & Match ช่วยค้นหา Lookbook จากรูปเสื้อผ้า
- ให้ทีมร้านค้าจัดการสินค้า stock order content และ coupon ผ่าน Admin

## สไลด์ 3 — ฟีเจอร์ที่ส่งมอบ

| โซน | ฟีเจอร์ |
| --- | --- |
| หน้าร้าน | Product, Search/Filter, Lookbook, Article, Mix & Match |
| สมาชิก | Register/Login, Profile, Address, Size Profile, Favorite Lookbook |
| การขาย | Cart, Checkout, Stripe Payment, Orders, Coupon/Loyalty |
| Admin | Dashboard, Product/Size Chart, Customer, Order, Lookbook, Article, Coupon |

Review feature ถูกตัดออกจาก scope ปัจจุบัน

## สไลด์ 4 — Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, daisyUI, React Router, Zustand

**Backend:** Node.js, Express 4, MongoDB/Mongoose, JWT + HttpOnly cookie, Multer, Nodemailer, Stripe และ Google Gemini

**Testing:** Node test runner, Vitest, Testing Library, jest-axe และ build verification

## สไลด์ 5 — Architecture

```text
Customer Client ──┐
                  ├── Express API ── MongoDB / GridFS
Admin Client ─────┘       ├──────── Stripe
                          ├──────── SMTP
                          └──────── Gemini
```

- Customer และ Admin deploy แยกกัน
- ใช้ Backend/Database ร่วมกัน
- Backend แบ่ง Routes → Middleware → Controllers → Services → Models

## สไลด์ 6 — Authentication และ Security

- HttpOnly cookie แยก Customer/Admin
- ตรวจ role และสถานะบัญชีจากฐานข้อมูล
- CORS allowlist + Helmet + validation
- Rate limit แยก Login/Register/Password Reset/Recommend/Upload
- Upload ตรวจ MIME, ขนาด และ magic bytes
- Secret อยู่ใน environment และไม่ commit `.env`

## สไลด์ 7 — Product และ Admin Flow

- Product ใช้ Category, Images, Variants, SKU, Price และ Stock
- Admin เพิ่ม/แก้/ซ่อน Product และแก้ `size_chart`
- Order และ Dashboard อ่านข้อมูลจาก MongoDB
- Article/Lookbook/Coupon มี Public API และ Admin management แยกกัน

## สไลด์ 8 — Personalized Size Recommendation

1. Customer ให้ Consent และบันทึก chest/waist/hips + preferred fit
2. Product Detail เทียบข้อมูลกับ `size_chart`
3. ระบบแสดงไซส์ เหตุผล confidence และ stock status
4. ลูกค้าแก้หรือลบ Size Profile ได้
5. Admin Customer API ไม่เห็นสัดส่วนรายบุคคล

สินค้าจำลองบน staging ใช้ script backfill เพื่อเติมตารางไซส์มาตรฐานก่อน Demo

## สไลด์ 9 — Mix & Match AI

- รับรูป top/bottom สูงสุด 2 รูป ไม่เกิน 5 MB ต่อรูป
- ตรวจว่าเป็นรูปเสื้อผ้าก่อนวิเคราะห์
- Gemini วิเคราะห์สี ประเภท และสไตล์
- จัดอันดับ Lookbook 3 อันดับพร้อมเหตุผล
- รูปอยู่ใน memory ระหว่าง request และไม่เก็บถาวร

## สไลด์ 10 — Checkout และ Payment

```text
Cart → Create Order → Reserve Stock → Stripe PaymentIntent
     → Stripe Webhook → Paid Order → Loyalty/Coupon
```

- Server ยืนยันราคาและ stock จากฐานข้อมูล
- ป้องกันการสร้าง PaymentIntent และคืน stock ซ้ำ
- Customer ดูรายละเอียด/ประวัติและยกเลิก Order ตามสถานะได้

## สไลด์ 11 — Coupon และ Loyalty

- Welcome Coupon ผูกผู้ใช้และส่งผ่านอีเมลเมื่อ SMTP พร้อม
- General Coupon จัดการผ่าน Admin
- ตรวจวันหมดอายุ ยอดขั้นต่ำ สถานะ และการใช้งาน
- Order บันทึกส่วนลด, coupon code และ membership tier ณ เวลาซื้อ

## สไลด์ 12 — การทำงานทีม

```text
Product Backlog → Sprint Backlog → To Do → In Progress
→ Code Review → Testing → Done
```

- Feature branch จาก `develop`
- PR พร้อมวิธีทดสอบและ Trello card
- Reviewer approve ก่อน merge
- Feature Owner อธิบาย flow และข้อจำกัดได้

## สไลด์ 13 — เอกสารและการตรวจสอบ

- `README.md` — setup, links และ deployment checklist
- `docs/API_SPEC.md` — endpoints และสิทธิ์
- `docs/DATABASE_SCHEMA.md` — models และ relationships
- `docs/ARCHITECTURE.md` — architecture และ data flows
- `docs/LOYALTY_BUSINESS_RULES.md` — loyalty/coupon rules

ตรวจ Client/Admin build, Client/Admin/Server tests, security tests และ staging flow ก่อน Demo

## สไลด์ 14 — ข้อจำกัดและ Next Steps

- ตั้ง SMTP, Stripe และ Gemini environment ให้ครบก่อนทดสอบ integration จริง
- ตรวจ staging products ให้มี `size_chart`
- Cart ยังอยู่ฝั่ง Client และยังไม่มี Cart model/route
- เพิ่ม CI สำหรับ lint/test/build ก่อน merge
- เพิ่ม monitoring และ shared production observability

---

แหล่งอ้างอิง: source code, `README.md`, `CONTRIBUTING.md` และเอกสารกลางใน `docs/`
