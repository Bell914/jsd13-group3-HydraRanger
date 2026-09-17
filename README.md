# OCCASION | HydraRanger

เว็บไซต์ E-commerce เสื้อผ้า Unisex พร้อม Lookbook พัฒนาโดยทีม **HydraRanger** ในหลักสูตร Generation Thailand Junior Software Developer รุ่น JSD13

โปรเจกต์ใช้ **MERN Stack**: MongoDB, Express, React และ Node.js โดยแยกหน้าร้านลูกค้า ระบบ Admin และ API ออกจากกัน

## เว็บไซต์ที่ Deploy แล้ว

**[เปิดเว็บไซต์ OCCASION](https://jsd13-group3-hydra-ranger.vercel.app/)**

ลิงก์นี้เป็นหน้าร้านลูกค้า ส่วน URL ของ Admin และ API ยังไม่ได้ระบุในเอกสารนี้

## เป้าหมายของโปรเจกต์

- ลูกค้าค้นหาและดูรายละเอียดสินค้า เลือกสี ไซส์ และจำนวน
- ลูกค้าจัดการตะกร้าและตรวจสรุปรายการก่อนสั่งซื้อ
- Admin จัดการสินค้า ราคา และสต็อก
- Frontend ติดต่อ Express API และบันทึกข้อมูลผ่าน Mongoose ลง MongoDB
- จำลองการชำระเงินสำหรับการเรียน โดยไม่จำเป็นต้องเชื่อมระบบรับเงินจริง

ติดตามสถานะและหลักฐานการตรวจรับแต่ละฟีเจอร์จาก Trello และ Pull Requests

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
├── server/           # Express API และการเชื่อม MongoDB
├── docs/             # เอกสาร API และฐานข้อมูล
├── CONTRIBUTING.md   # แนวทางทำงานร่วมกัน
└── README.md
```

## เริ่มต้นใช้งานในเครื่อง

### 1. เตรียมเครื่องมือ

- Node.js และ npm
- Git
- MongoDB ในเครื่อง หรือ MongoDB Atlas ที่เข้าถึงได้

### 2. Clone repository

```bash
git clone https://github.com/Bell914/jsd13-group3-HydraRanger.git
cd jsd13-group3-HydraRanger
git switch develop
```

### 3. ติดตั้ง dependencies

รันจากโฟลเดอร์หลักของ repository:

```bash
npm ci --prefix server
npm ci --prefix client
npm ci --prefix admin-client
```

### 4. ตั้งค่า environment

หากยังไม่มี `server/.env` ให้คัดลอก `server/.env.example` เป็น `server/.env` แล้วตั้งค่าตามตัวอย่างในไฟล์นั้น โดยเฉพาะ:

| ค่า | ใช้สำหรับ |
| --- | --- |
| `MONGODB_URI` | การเชื่อมฐานข้อมูลของสภาพแวดล้อมที่ใช้งาน |
| `JWT_SECRET` | คีย์สำหรับการยืนยันตัวตน |
| ค่าบัญชี Admin ตาม `.env.example` | การตั้งค่าบัญชี Admin ของทีม |

อย่า commit `.env` หรือใส่รหัสผ่านและคีย์จริงไว้ใน README

Frontend ทั้ง `client` และ `admin-client` ใช้ `VITE_API_BASE_URL` สำหรับระบุ API หากต้องกำหนดเอง ให้ใส่ใน `.env` ของแต่ละแอป:

```dotenv
VITE_API_BASE_URL=http://localhost:5001/api
```

เมื่อเปลี่ยนค่า environment ของ Frontend ต้องเริ่ม development server ใหม่ หรือ build ใหม่สำหรับ deployment

### 5. เปิดระบบ

เปิด 3 Terminal ที่โฟลเดอร์หลัก แล้วรันแยกกัน:

**Terminal 1 — API**

```bash
npm run dev --prefix server
```

**Terminal 2 — หน้าร้าน**

```bash
npm run dev --prefix client
```

**Terminal 3 — Admin**

```bash
npm run dev --prefix admin-client
```

| ส่วน | URL เริ่มต้น |
| --- | --- |
| หน้าร้าน | http://localhost:5173 |
| Admin | http://localhost:5174 |
| API base URL | http://localhost:5001/api |

ตรวจ URL ที่แสดงใน Terminal อีกครั้ง หากมีการเปลี่ยน port หรือ port เดิมถูกใช้งานอยู่ ทั้งนี้ API base URL ไม่จำเป็นต้องมีหน้าเว็บ ให้ใช้ endpoint ที่ระบุใน API Spec เพื่อทดสอบ

## ตรวจความพร้อมก่อน Demo

ใช้รายการนี้เป็นเกณฑ์ตรวจรับแต่ละรอบ และบันทึกสถานะกับผลทดสอบในการ์ด Trello หรือ PR ที่เกี่ยวข้อง:

- สมาชิกเปิดหน้าร้าน, Admin และ Server จาก branch ที่ใช้ส่งงานได้
- Server เชื่อม MongoDB ได้จริง
- Product List และ Product Detail อ่านข้อมูลจาก API
- Admin เพิ่ม แก้ไข และลบสินค้าแล้วข้อมูลใน MongoDB เปลี่ยนตาม
- Product Form ตรวจ Name, Description, Price, Quantity, Date และ Tag พร้อมข้อความผิดพลาด
- Cart อ่าน เพิ่ม แก้จำนวน และลบรายการผ่าน API โดยแยกข้อมูลตามผู้ใช้
- ระบบจัดการจำนวนสินค้าไม่ถูกต้องและจำนวนเกินสต็อกได้
- Checkout แสดงรายการและยอดรวมตรงกับ Cart
- ข้อมูลที่ควรบันทึกยังอยู่หลังเปิด Server ใหม่และอ่านกลับจากฐานข้อมูล
- แสดง loading, empty และ error state ตามสถานการณ์
- สำหรับ Sprint 3: หน้าร้านและ API เปิดผ่าน public URL และทำงานร่วมกันได้
- ทีมซ้อม Demo และสมาชิกอธิบายส่วนที่รับผิดชอบได้

การ refresh แล้วข้อมูลยังอยู่เพียงอย่างเดียวไม่ยืนยันว่าใช้ MongoDB เพราะข้อมูลอาจอยู่ใน localStorage ควรตรวจฐานข้อมูลและผลตอบกลับของ API ด้วย

## เอกสารและการทำงานร่วมกัน

- [API Specification](docs/API_SPEC.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Contribution Guidelines](CONTRIBUTING.md)

อ่าน Contribution Guidelines ก่อนเริ่มงาน เชื่อมการ์ด Trello กับ PR และระบุสิ่งที่เปลี่ยน วิธีทดสอบ และข้อจำกัดที่ยังเหลือ เพื่อให้ทีมตรวจรับงานจากหลักฐานเดียวกัน

## แก้ปัญหาเบื้องต้น

| อาการ | จุดที่ควรตรวจ |
| --- | --- |
| หน้าร้านหรือ Admin ติดต่อ API ไม่ได้ | Server เปิดอยู่หรือไม่, `VITE_API_BASE_URL` และการตั้งค่า CORS |
| Server เชื่อม MongoDB ไม่ได้ | `MONGODB_URI`, สถานะฐานข้อมูล และสิทธิ์การเชื่อมต่อ |
| เข้าสู่ระบบ Admin ไม่ได้ | การตั้งค่าบัญชีตาม `.env.example` และข้อความผิดพลาดจาก API |
| เปลี่ยน API URL แล้วแอปยังใช้ค่าเดิม | เริ่ม Frontend ใหม่ หรือ build และ deploy ใหม่ |
| ข้อมูลหน้าจอไม่ตรงกับฐานข้อมูล | แหล่งข้อมูลจริง, ข้อมูลจำลอง และข้อมูลที่เก็บในเบราว์เซอร์ |

## วัตถุประสงค์การใช้งาน

โปรเจกต์นี้จัดทำเพื่อการเรียนรู้และฝึกทำงานเป็นทีมในหลักสูตร JSD13
