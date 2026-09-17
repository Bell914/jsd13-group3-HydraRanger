# OCCASION | HydraRanger

เว็บไซต์ E-commerce เสื้อผ้า Unisex พร้อม Lookbook ของทีม **HydraRanger** ในหลักสูตร Generation Thailand Junior Software Developer รุ่น JSD13 ใช้ MongoDB, Express, React และ Node.js โดยแยกหน้าร้าน ระบบ Admin และ API

## เว็บไซต์และ API

| ส่วน | URL |
| --- | --- |
| หน้าร้านระหว่างพัฒนา (ยังไม่ใช่ Final) | [เปิด OCCASION](https://jsd13-group3-hydra-ranger.vercel.app/) |
| API ที่ตั้งค่าไว้ในโค้ดหน้าร้าน | https://jsd13-group3-hydraranger.onrender.com/api |
| ตรวจสถานะ API และฐานข้อมูล | [API Health](https://jsd13-group3-hydraranger.onrender.com/api/health) |

**สถานะ Deployment: เวอร์ชันระหว่างพัฒนา ยังไม่ใช่ Final version** ฟีเจอร์และข้อมูลบนเว็บไซต์อาจยังไม่ตรงกับโค้ดล่าสุดใน develop จึงควรตรวจเวอร์ชันที่ Deploy ก่อนใช้ผลทดสอบประเมินงานส่งสุดท้าย

ยังไม่มี URL ของ Admin ที่ยืนยันในเอกสารนี้ ลิงก์ API อ้างอิงจากการตั้งค่าในโค้ด ไม่ใช่การรับรองว่าระบบออนไลน์และทุกฟีเจอร์ผ่านการทดสอบแล้ว

## สถานะจากโค้ดล่าสุด

ตรวจเทียบกับ `9b5e108` บน `develop` (รวม PR #46) สถานะต่อไปนี้เป็นผลตรวจโค้ด ไม่ใช่ผลทดสอบครบทุกขั้นตอนบนระบบจริง:

| ส่วน | สิ่งที่พบ |
| --- | --- |
| Product | มี Product model, API อ่านรายการและรายละเอียดสินค้า และหน้าร้านเรียก API แล้ว |
| ข้อมูลสินค้าสำรอง | หาก API ล้มเหลว หน้าร้านใช้ fallback data จึงต้องตรวจ API เพิ่ม แม้หน้าเว็บยังแสดงสินค้าได้ |
| Admin | มีหน้าจอจัดการสินค้าและ API เพิ่ม อ่าน แก้ไข ลบ พร้อมตรวจสิทธิ์ Admin |
| Cart | เก็บข้อมูลใน localStorage; ยังไม่พบ Cart API ที่เชื่อมใน router หลัก |
| Checkout | มีหน้าสรุปและยืนยันคำสั่งซื้อแบบจำลอง; ยังไม่พบ Order API ที่เชื่อมใน router หลัก |

งานที่ต้องตรวจรับต่อคือ Cart แยกผู้ใช้ผ่าน API และ MongoDB, การบันทึกคำสั่งซื้อ และการทำงานร่วมกันของหน้าร้านกับ Admin บนระบบที่ Deploy แล้ว ติดตามสถานะและหลักฐานล่าสุดจาก Trello และ PR

## ลิงก์โปรเจกต์

- [Repository](https://github.com/Bell914/jsd13-group3-HydraRanger)
- [Trello Board](https://trello.com/b/n1GZ0Fr4/my-trello-board)
- [Sprint 3 Goal](https://trello.com/c/0N4Qhh3N)
- [Checklist ทดสอบ / Deploy / Demo](https://trello.com/c/FmMJ5Y3o)
- [Pull Requests](https://github.com/Bell914/jsd13-group3-HydraRanger/pulls)

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

รันจากโฟลเดอร์หลักของ repository:

```bash
git clone https://github.com/Bell914/jsd13-group3-HydraRanger.git
cd jsd13-group3-HydraRanger
git switch develop
npm ci --prefix server
npm ci --prefix client
npm ci --prefix admin-client
```

### 2. ตั้งค่า Server

สร้าง `server/.env` โดยใช้ค่าของสภาพแวดล้อมพัฒนาเอง ตัวอย่างด้านล่างเป็น placeholder ต้องเปลี่ยนค่าคีย์และรหัสผ่านก่อนใช้:

```dotenv
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/occasion_db
JWT_SECRET=replace_with_your_own_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_your_own_admin_password
```

ห้าม commit `.env` หรือใส่รหัสผ่านและคีย์จริงในเอกสาร ใช้ฐานข้อมูลสำหรับพัฒนาเมื่อทดลองเพิ่ม แก้ไข หรือลบข้อมูล

### 3. ตั้งค่า Frontend ทั้งสองแอป

สร้าง `client/.env` และ `admin-client/.env` โดยใส่ค่านี้ในทั้งสองไฟล์ เพื่อให้ทั้งคู่เรียก Server ในเครื่อง:

```dotenv
VITE_API_BASE_URL=http://localhost:5001/api
```

- หน้าร้านอ่าน `VITE_API_BASE_URL` ก่อน แล้วจึง `VITE_API_URL` และเติม `/api` ให้อัตโนมัติหากไม่มี
- หากไม่ตั้งค่า หน้าร้านจะเรียก API บน Render; `client/.env.example` ก็ชี้ไป Render จึงต้องเปลี่ยนค่าเมื่อพัฒนาในเครื่อง
- Admin อ่าน `VITE_API_BASE_URL` และค่าเริ่มต้นคือ `http://localhost:5001/api` ต้องระบุ `/api` เอง และสร้างไฟล์ `admin-client/.env` เอง
- เมื่อเปลี่ยนค่า ให้เปิด development server ใหม่ หรือ build และ deploy ใหม่

### 4. เปิดระบบ

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
| API Health | http://localhost:5001/api/health |

ตรวจ port ที่แสดงใน Terminal อีกครั้ง และตรวจค่า `database` ในผล Health check เพื่อยืนยันสถานะฐานข้อมูล

## คำสั่งตรวจสอบ

```bash
npm test --prefix client
npm run build --prefix client
npm run build --prefix admin-client
npm run test:conn --prefix server
```

คำสั่งเหล่านี้เป็นคำสั่งที่มีใน package.json ไม่ได้หมายความว่าผลทดสอบผ่านแล้ว การตรวจการเชื่อมต่อ Server ต้องตั้ง environment และเปิดฐานข้อมูลให้พร้อมก่อน

## ตรวจความพร้อมก่อน Demo

บันทึกผลและหลักฐานในการ์ด Trello หรือ PR ที่เกี่ยวข้อง:

- Product List และ Product Detail อ่านข้อมูลจาก API จริง ไม่ใช่ fallback data
- Admin เพิ่ม แก้ไข และลบสินค้าแล้วข้อมูลใน MongoDB เปลี่ยนตาม และหน้าร้านเห็นข้อมูลล่าสุด
- Product Form ตรวจ Name, Description, Price, Quantity, Date และ Tag พร้อมข้อความผิดพลาดตาม requirement
- Cart อ่าน เพิ่ม แก้จำนวน และลบรายการผ่าน API โดยแยกข้อมูลตามผู้ใช้
- จัดการจำนวนไม่ถูกต้องและจำนวนเกินสต็อกได้
- Checkout แสดงรายการและยอดรวมตรงกับ Cart และตรวจการบันทึกคำสั่งซื้อตามขอบเขตงาน
- ข้อมูลที่ต้องบันทึกยังอยู่หลังเปิด Server ใหม่และอ่านกลับจากฐานข้อมูล
- ตรวจ loading, empty และ error state
- หน้าร้านและ API เปิดผ่าน public URL และทำงานร่วมกันได้
- สมาชิกซ้อม Demo และอธิบายส่วนที่รับผิดชอบได้

การ refresh แล้วข้อมูลยังอยู่ไม่ยืนยันว่าใช้ MongoDB เพราะข้อมูลอาจอยู่ใน localStorage ต้องตรวจผล API และฐานข้อมูลด้วย

## เอกสารและการทำงานร่วมกัน

- [API Specification](docs/API_SPEC.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Contribution Guidelines และผู้รับผิดชอบ](CONTRIBUTING.md)

อ่านแนวทางทีมก่อนเริ่มงาน สร้าง branch สำหรับงาน เปิด PR เข้า develop และเชื่อมการ์ด Trello พร้อมวิธีทดสอบและข้อจำกัด เอกสาร API และฐานข้อมูลควรตรวจเทียบกับโค้ดปัจจุบันก่อนใช้อ้างอิง

## แก้ปัญหาเบื้องต้น

| อาการ | จุดที่ควรตรวจ |
| --- | --- |
| หน้าร้านแสดงสินค้า แต่ API มีปัญหา | หน้าร้านอาจใช้ fallback data ให้ตรวจคำขอ API และ Health check |
| หน้าร้านในเครื่องไปอ่านข้อมูลออนไลน์ | ตั้ง VITE_API_BASE_URL ใน client/.env ให้ชี้ localhost |
| Admin ติดต่อ API ไม่ได้ | Server, VITE_API_BASE_URL ที่ลงท้าย /api และ CORS |
| Server เชื่อม MongoDB ไม่ได้ | MONGODB_URI, สถานะฐานข้อมูล และสิทธิ์เชื่อมต่อ |
| เปลี่ยน API URL แล้วแอปยังใช้ค่าเดิม | เปิด Frontend ใหม่ หรือ build และ deploy ใหม่ |

โปรเจกต์นี้จัดทำเพื่อการเรียนรู้และฝึกทำงานเป็นทีมในหลักสูตร JSD13
