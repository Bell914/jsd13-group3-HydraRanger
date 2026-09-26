# OCCASION | HydraRanger

![ทีม HydraRanger](docs/assets/hydraranger-team.png)

OCCASION คือเว็บไซต์ E-commerce เสื้อผ้า Unisex พร้อม Lookbook ของทีม **HydraRanger** ในหลักสูตร Generation Thailand Junior Software Developer รุ่น JSD13 ระบบใช้ MongoDB, Express, React และ Node.js โดยแยกหน้าร้านลูกค้า ระบบ Admin และ REST API

> **สถานะ:** ฟีเจอร์หลักพัฒนาเสร็จแล้ว และอยู่ระหว่าง integration testing, deployment verification และเตรียม Final Project

## ระบบที่ส่งมอบใน Sprint 3

| ส่วน | ความสามารถหลัก |
| --- | --- |
| Customer Client | สมัคร/เข้าสู่ระบบ, Profile และที่อยู่, Product/Lookbook, Cart/Checkout, Order History, Coupon, Size Recommendation และ Mix & Match |
| Admin Client | Dashboard, Product พร้อม variants/stock/size chart, Customer, Order, Lookbook, Article และ Coupon management |
| API | Authentication, Products, Orders, Stripe payment, Lookbooks, Articles, Coupons, Uploads, Size Profile และ Gemini recommendation |
| Security | HttpOnly session cookies, customer/admin role separation, validation, rate limits, CORS, Helmet และตรวจชนิดไฟล์จาก signature |

Review feature ถูกนำออกจากระบบแล้ว จึงไม่มี Review API, Review model หรือหน้า Admin Review ในขอบเขตปัจจุบัน

## ลิงก์

| ส่วน | URL |
| --- | --- |
| หน้าร้าน | [เปิด OCCASION](https://jsd13-group3-hydra-ranger.vercel.app/) |
| API | [เปิด API](https://jsd13-group3-hydraranger.onrender.com/api) |
| API Health | [ตรวจ Server และ Database](https://jsd13-group3-hydraranger.onrender.com/api/health) |
| Trello | [เปิด Board](https://trello.com/b/n1GZ0Fr4/my-trello-board) |

## โครงสร้างโปรเจกต์

```text
jsd13-group3-HydraRanger/
├── client/           # React: หน้าร้านลูกค้า
├── admin-client/     # React: ระบบหลังบ้าน Admin
├── server/           # Express API, services และ Mongoose models
├── docs/             # เอกสารกลางของระบบ
├── CONTRIBUTING.md   # แนวทางทำงานร่วมกัน
└── README.md
```

## เริ่มต้นใช้งานในเครื่อง

ต้องมี Node.js, npm, Git และ MongoDB สำหรับ development

```bash
git clone https://github.com/Bell914/jsd13-group3-HydraRanger.git
cd jsd13-group3-HydraRanger
git switch develop
npm ci --prefix server
npm ci --prefix client
npm ci --prefix admin-client
```

### 2. ตั้งค่า Server

สร้าง `server/.env` ค่าด้านล่างเป็น placeholder ต้องเปลี่ยนคีย์และรหัสผ่านก่อนใช้ และห้าม commit `.env`

```dotenv
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/occasion_db
JWT_SECRET=replace_with_your_own_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_CLIENT_URL=http://localhost:5174
TRUST_PROXY=1
ADMIN_EMAIL=admin@occasion.dev
ADMIN_PASSWORD=replace_with_your_own_admin_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
# Stripe: keep both values private and never commit this file.
STRIPE_SECRET_KEY=sk_test_replace_with_your_secret_key
# Obtained from `stripe listen` locally, or from the Webhooks page in Stripe Dashboard.
STRIPE_WEBHOOK_SECRET=whsec_replace_with_your_webhook_secret
```

### 3. ตั้งค่า Frontend ทั้งสองแอป

สร้าง `client/.env` และ `admin-client/.env` ใส่ค่าเดียวกันทั้งสองไฟล์:

```dotenv
VITE_API_BASE_URL=http://localhost:5002/api
# This key is intentionally usable by the browser; do not put STRIPE_SECRET_KEY here.
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_replace_with_your_publishable_key
```

- ถ้าไม่ตั้งค่า หน้าร้านจะไปเรียก API บน Render แทน localhost
- เปลี่ยนค่าแล้วต้องเปิด development server ใหม่ หรือ build และ deploy ใหม่

### 4. ตั้งค่า Stripe (เฉพาะการจ่ายบัตร)

ระบบมี Stripe Payment Element, PaymentIntent และ webhook อยู่แล้ว จึงไม่ต้องเพิ่ม package หรือ route อีก. ใส่ `STRIPE_SECRET_KEY` ใน `server/.env` และ `VITE_STRIPE_PUBLISHABLE_KEY` ใน `client/.env` ตามตัวอย่างด้านบน แล้วเปิด server ใหม่

การชำระเงินที่สำเร็จจะเปลี่ยนสถานะ order ผ่าน webhook เท่านั้น. สำหรับ local development ให้ติดตั้งและ login [Stripe CLI](https://docs.stripe.com/stripe-cli), แล้วรันคำสั่งนี้ใน terminal แยก:

```bash
stripe listen --forward-to localhost:5002/api/payment/webhook
```

นำค่า `whsec_...` ที่ Stripe CLI แสดงมาใส่เป็น `STRIPE_WEBHOOK_SECRET` ใน `server/.env` แล้ว restart server. สำหรับ production ให้สร้าง webhook endpoint เป็น `https://<your-api-host>/api/payment/webhook`, เลือก event `payment_intent.succeeded` และใช้ signing secret ของ endpoint production (ไม่ใช่ secret จาก Stripe CLI).

ใช้บัตรทดสอบ `4242 4242 4242 4242`, วันหมดอายุใดก็ได้ในอนาคต และ CVC 3 หลัก. อย่าใช้หรือ commit Secret Key ที่เคยแชร์ในแชต; ให้ rotate คีย์นั้นใน Stripe Dashboard ก่อนใช้งานต่อ.

### 5. เปิดระบบ

เปิดระบบด้วย 3 Terminal:

```bash
npm run dev --prefix server
npm run dev --prefix client
npm run dev --prefix admin-client
```

| ส่วน | URL เริ่มต้น |
| --- | --- |
| หน้าร้าน | http://localhost:5173 |
| Admin | http://localhost:5174 |
| API Health | http://localhost:5002/api/health |

## คำสั่งตรวจสอบ

```bash
npm test --prefix client
npm run build --prefix client
npm test --prefix admin-client
npm run build --prefix admin-client
npm test --prefix server
npm run test:security --prefix server
```

`npm run test:conn --prefix server` ต้องมี environment และฐานข้อมูลที่เชื่อมต่อได้

ถ้าฐานข้อมูล staging มีสินค้าเดิมที่ยังไม่มี `size_chart` ให้ตรวจแบบ dry run ก่อนเติมข้อมูล:

```bash
npm run backfill:size-charts --prefix server -- --dry-run
npm run backfill:size-charts --prefix server
```

## เอกสาร

- [Documentation Index](docs/README.md)
- [API Specification](docs/API_SPEC.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Use Case Diagram](docs/USE_CASE_DIAGRAM.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Loyalty Business Rules](docs/LOYALTY_BUSINESS_RULES.md)
- [Review Slides Outline](docs/REVIEW_SLIDES.md)
- [Contribution Guidelines](CONTRIBUTING.md)

## Checklist ก่อน Demo หรือ Deploy

- `/api/health` ต้องรายงานว่า Server และ Database พร้อมใช้งาน
- ตั้ง `SMTP_USER` และ `SMTP_PASS` ก่อนทดสอบอีเมลจริง
- ตั้ง Stripe keys ทั้ง Server และ Customer Client ก่อนทดสอบ Card Payment
- ตั้ง `GEMINI_API_KEY` ก่อนทดสอบ Mix & Match
- ตรวจว่าสินค้า Tops/Bottoms บน staging มี `size_chart`
- ทดสอบ Customer/Admin session, Product, Checkout, Upload และ Rate Limit บน environment เป้าหมาย

โปรเจกต์นี้จัดทำเพื่อการเรียนรู้และฝึกทำงานเป็นทีมในหลักสูตร JSD13
