# OCCASION

เว็บไซต์ขายเสื้อผ้า Unisex พร้อม Lookbook ของทีม HydraRanger ใช้ React, Express และ MongoDB

## เปิดระบบในเครื่อง

ต้องมี Node.js, npm และ MongoDB รันจากโฟลเดอร์หลัก:

```bash
npm ci --prefix server
npm ci --prefix client
npm ci --prefix admin-client
```

หากยังไม่มี `server/.env` ให้คัดลอกจาก `server/.env.example` ตั้ง `MONGODB_URI`, `JWT_SECRET` และบัญชี Admin ให้ครบ ห้ามนำ `.env` ขึ้น Git

เปิด 3 Terminal แล้วรันแยกกัน:

```bash
npm run dev --prefix server
npm run dev --prefix client
npm run dev --prefix admin-client
```

| ส่วน | URL |
|---|---|
| หน้าร้าน | http://localhost:5173 |
| Admin | http://localhost:5174 |
| API | http://localhost:5001/api |

หากเปลี่ยน API URL ให้ตั้ง `VITE_API_BASE_URL` ใน Frontend ทั้งสองตัว แล้วเริ่มใหม่หรือ Build ใหม่

## แผนและเอกสาร

ติดตามงานใน [Sprint 3 Goal](https://trello.com/c/0N4Qhh3N) และ
[Checklist ทดสอบ/Deploy/Demo](https://trello.com/c/FmMJ5Y3o)

- [API](docs/API_SPEC.md)
- [ฐานข้อมูล](docs/DATABASE_SCHEMA.md)
- [วิธีทำงานร่วมกัน](CONTRIBUTING.md)

URL เว็บไซต์จริง: เพิ่มหลัง Deploy สำเร็จ
