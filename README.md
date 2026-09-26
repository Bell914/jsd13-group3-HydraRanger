# OCCASION | HydraRanger

เว็บไซต์ E-commerce เสื้อผ้า Unisex พร้อม Lookbook ของทีม **HydraRanger** ในหลักสูตร Generation Thailand Junior Software Developer รุ่น JSD13 ใช้ MongoDB, Express, React และ Node.js โดยแยกหน้าร้าน ระบบ Admin และ API

> **สถานะ:** ฟีเจอร์หลักพัฒนาเสร็จสมบูรณ์แล้ว อยู่ระหว่างขั้นตอน integration testing, deployment verification และเตรียมความพร้อมสำหรับการนำเสนอ Final Project

## ลิงก์

| ส่วน | URL |
| --- | --- |
| หน้าร้าน | [เปิด OCCASION](https://jsd13-group3-hydra-ranger.vercel.app/) |
| API | https://jsd13-group3-hydraranger.onrender.com/api |
| ตรวจสถานะ API และฐานข้อมูล | [API Health](https://jsd13-group3-hydraranger.onrender.com/api/health) |
| Trello Board | [เปิด Board](https://trello.com/b/n1GZ0Fr4/my-trello-board) |

## โครงสร้างโปรเจกต์

```text
jsd13-group3-HydraRanger/
├── client/           # React: หน้าร้านลูกค้า
├── admin-client/     # React: ระบบหลังบ้าน Admin
├── server/           # Express API และ Mongoose models
├── docs/             # เอกสาร API ฐานข้อมูล และสถาปัตยกรรม
├── CONTRIBUTING.md   # แนวทางทำงานร่วมกันและผู้รับผิดชอบ
└── README.md
```

## เริ่มต้นใช้งานในเครื่อง

ต้องมี Node.js, npm, Git และ MongoDB ในเครื่องหรือฐานข้อมูลสำหรับพัฒนาแยกต่างหาก

### 1. Clone และติดตั้ง

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

เปิด 3 Terminal ที่โฟลเดอร์หลัก แล้วรันแยกกัน:

```bash
# Terminal 1 — API
npm run dev --prefix server

# Terminal 2 — หน้าร้าน
npm run dev --prefix client

# Terminal 3 — Admin
npm run dev --prefix admin-client
```

| ส่วน | URL เริ่มต้น |
| --- | --- |
| หน้าร้าน | http://localhost:5173 |
| Admin | http://localhost:5174 |
| API Health | http://localhost:5002/api/health |

ตรวจ port ที่แสดงใน Terminal อีกครั้ง และดูค่า `database` ในผล Health check เพื่อยืนยันสถานะฐานข้อมูล

## คำสั่งตรวจสอบ

```bash
npm test --prefix client
npm run build --prefix client
npm run build --prefix admin-client
npm run test:conn --prefix server
```

คำสั่งเหล่านี้เป็นคำสั่งที่มีใน `package.json` ไม่ได้หมายความว่าผลทดสอบผ่านแล้ว และ `test:conn` ต้องตั้ง environment กับเปิดฐานข้อมูลให้พร้อมก่อน

ถ้าฐานข้อมูลทดสอบมีสินค้าเก่าที่ยังไม่มี `size_chart` ให้ตรวจรายการก่อน แล้วจึงเติมเฉพาะสินค้าหมวด Tops/Bottoms ที่มีไซส์มาตรฐาน:

```bash
npm run backfill:size-charts --prefix server -- --dry-run
npm run backfill:size-charts --prefix server
```

## เอกสารและการทำงานร่วมกัน

- [API Specification](docs/API_SPEC.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Contribution Guidelines และผู้รับผิดชอบ](CONTRIBUTING.md)

อ่านแนวทางทีมก่อนเริ่มงาน สร้าง branch สำหรับงาน เปิด PR เข้า `develop` และเชื่อมการ์ด Trello พร้อมวิธีทดสอบและข้อจำกัด เอกสาร API และฐานข้อมูลควรตรวจเทียบกับโค้ดปัจจุบันก่อนใช้อ้างอิง

## แก้ปัญหาเบื้องต้น

| อาการ | จุดที่ควรตรวจ |
| --- | --- |
| หน้าร้านแสดงสินค้า แต่ API มีปัญหา | หน้าร้านอาจใช้ fallback data ให้ตรวจคำขอ API และ Health check |
| Admin ติดต่อ API ไม่ได้ | Server, `VITE_API_BASE_URL` ที่ลงท้าย `/api` และ CORS |
| Server เชื่อม MongoDB ไม่ได้ | `MONGODB_URI` สถานะฐานข้อมูล และสิทธิ์เชื่อมต่อ |
| เปลี่ยน API URL แล้วแอปยังใช้ค่าเดิม | เปิด Frontend ใหม่ หรือ build และ deploy ใหม่ |

การ refresh แล้วข้อมูลยังอยู่ไม่ยืนยันว่าใช้ MongoDB เพราะข้อมูลอาจอยู่ใน localStorage ต้องตรวจผล API และฐานข้อมูลด้วย

---

โปรเจกต์นี้จัดทำเพื่อการเรียนรู้และฝึกทำงานเป็นทีมในหลักสูตร JSD13
