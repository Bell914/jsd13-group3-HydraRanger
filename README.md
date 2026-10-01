# OCCASION | HydraRanger

![ทีม HydraRanger](docs/assets/hydraranger-team.png)

OCCASION คือเว็บไซต์ E-commerce เสื้อผ้า Unisex พร้อม Lookbook ของทีม **HydraRanger** ในหลักสูตร Generation Thailand Junior Software Developer รุ่น JSD13 ระบบใช้ MongoDB, Express, React และ Node.js โดยแยกหน้าร้านลูกค้า ระบบ Admin และ REST API

> **สถานะ:** ฟีเจอร์หลักพัฒนาเสร็จแล้ว และอยู่ระหว่าง integration testing, deployment verification และเตรียม Final Project

## ระบบที่ส่งมอบใน Sprint 3

| ส่วน | ความสามารถหลัก |
| --- | --- |
| Customer Client | สมัคร/เข้าสู่ระบบ, Profile และที่อยู่, Product/Lookbook, Cart/Checkout, Order History, Coupon, Size Recommendation และ Mix & Match |
| Admin Client | Dashboard, Product พร้อม variants/stock/size chart, Customer, Order, Lookbook, Article และ Coupon management |
| API | Authentication, Products, Orders, Demo payment (PromptPay QR และบัตร), Lookbooks, Articles, Coupons, Uploads, Size Profile และ Gemini recommendation |
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
```

### 3. ตั้งค่า Frontend ทั้งสองแอป

สร้าง `client/.env` และ `admin-client/.env` ใส่ค่าเดียวกันทั้งสองไฟล์:

```dotenv
VITE_API_BASE_URL=http://localhost:5002/api
```

- ถ้าไม่ตั้งค่า หน้าร้านจะไปเรียก API บน Render แทน localhost
- เปลี่ยนค่าแล้วต้องเปิด development server ใหม่ หรือ build และ deploy ใหม่

### 4. ระบบชำระเงิน (โหมดเดโม)

ระบบชำระเงินเป็น **ระบบจำลองสำหรับงานสาธิต** จึงไม่ต้องตั้งค่า key ใด ๆ และไม่มีการตัดเงินจริง
รองรับ 2 ช่องทาง ทั้งคู่เลือกได้จากขั้นตอนชำระเงินในหน้า Checkout:

| ช่องทาง | การทำงาน |
| --- | --- |
| `promptpay` | แสดง QR Code จริงที่สแกนได้ (`qrcode.react`) พร้อมยอดชำระ แล้วกดปุ่ม "จำลองการโอนเงินสำเร็จ" |
| `credit-card` | ฟอร์มบัตรที่รับเฉพาะเลขทดสอบที่ระบุไว้ พร้อมตรวจ Luhn, วันหมดอายุ และ CVC |

QR และฟอร์มบัตรเป็นของจำลอง **ไม่ใช่ช่องทางชำระเงินจริง** แอปธนาคารจะใช้จ่ายผ่าน QR นี้ไม่ได้ และฟอร์มบัตรปิด `autocomplete` เพื่อไม่ให้เบราว์เซอร์เติมเลขบัตรจริง

ลำดับการทำงานฝั่ง Server: `POST /api/orders` สร้าง order สถานะ `pending` (จองสต็อกและ claim คูปอง) แล้ว `POST /api/orders/my/:id/confirm-payment` เปลี่ยนเป็น `paid` ผ่าน state machine เดิม ทำให้ loyalty, coupon และสต็อกทำงานถูกต้องโดยไม่ต้องเขียน logic ซ้ำ

ใช้บัตรทดสอบ `4242 4242 4242 4242` เท่านั้น วันหมดอายุใดก็ได้ในอนาคต และ CVC 3 หลัก

order ที่สร้างแล้วไม่ยืนยันการชำระเงินภายใน 30 นาทีจะถูกยกเลิกและคืนสต็อกอัตโนมัติ

#### เปิด/ปิดระบบชำระเงินจำลอง

`POST /api/orders/my/:id/confirm-payment` ปิดให้บริการด้วยตัวแปร `DEMO_PAYMENT_ENABLED`

- ถ้า `NODE_ENV=production` และไม่ได้ตั้งค่านี้ ระบบจะ **ปิด** โดยค่าเริ่มต้น และตอบ `503` เพื่อไม่ให้ยืนยัน order เป็น `paid` โดยไม่มีหลักฐานการจ่ายเงิน
- ถ้าเป็น `development` หรือ `test` ระบบจะเปิดโดยค่าเริ่มต้น
- **Deployment ที่ใช้สาธิตจริง (Render) ต้องตั้ง `DEMO_PAYMENT_ENABLED=true`** ไม่งั้นขั้นตอนชำระเงินจะได้ `503`
- ตรวจสถานะได้ที่ `GET /api/health` ซึ่งจะรายงาน `services.demoPaymentEnabled`

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

- `/api/health` ต้องรายงานว่า Server และ Database พร้อมใช้งาน และ `services.demoPaymentEnabled` เป็น `true`
- ตั้ง SMTP และ `DEMO_PAYMENT_ENABLED=true` ให้ครบก่อนทดสอบ Checkout และอีเมลจริง
- ทดสอบ Checkout ทั้ง 2 ช่องทาง (PromptPay QR และบัตรเดโม) แล้วเช็คว่า order เปลี่ยนเป็น `paid` พร้อมเพิ่มยอดสะสมสมาชิก
- ตั้ง `GEMINI_API_KEY` ก่อนทดสอบ Mix & Match
- ตรวจว่าสินค้า Tops/Bottoms บน staging มี `size_chart`
- ทดสอบ Customer/Admin session, Product, Checkout, Upload และ Rate Limit บน environment เป้าหมาย

โปรเจกต์นี้จัดทำเพื่อการเรียนรู้และฝึกทำงานเป็นทีมในหลักสูตร JSD13
