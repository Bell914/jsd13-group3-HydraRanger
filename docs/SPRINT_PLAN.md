# 🎯 Sprint 2 Plan - HydraRanger (Group 3)

เอกสารแผนการดำเนินงานสำหรับ **Sprint 2** ของทีม **HydraRanger**

---

## 🎯 Sprint Goal
สร้างระบบ Full-Stack Web Application ที่สมบูรณ์แบบ รองรับ Authentication (Register/Login), Dashboard แสดงผลข้อมูล, และ CRUD Operations ของระบบจัดการข้อมูล พร้อมการจัดโครงสร้างโค้ดตามมาตรฐานวิศวกรรมซอฟต์แวร์

---

## 📋 Task Breakdown & Backlog

### Phase 1: Foundation & Architecture Setup 🏗️
- [x] ออกแบบโครงสร้างโฟลเดอร์แบบ Clean Client-Server Architecture
- [x] จัดทำ Root `.gitignore`, `README.md`, `CONTRIBUTING.md`
- [x] จัดทำเอกสารระบบ (`API_SPEC.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`)
- [x] ติดตั้ง Express Server พร้อม Middleware มาตรฐาน (CORS, Morgan, JSON parser, Error Handler)
- [x] ติดตั้ง React + Vite Frontend พร้อม Routing และระบบตกแต่ง Vanilla CSS

### Phase 2: Backend API Implementation ⚙️
- [ ] ติดตั้งระบบ Configuration & Environment Variables (`config/`)
- [ ] สร้าง Model Schemas (`User`, `Item`)
- [ ] สร้าง Authentication Service & Controller (Register, Login, JWT Token Issuance)
- [ ] สร้าง Item/Resource CRUD Service & Controller
- [ ] สร้าง Input Validators (`validators/`)
- [ ] สร้าง Database Seeding Script (`scripts/seed.js`)

### Phase 3: Frontend Development 🎨
- [ ] สร้าง Reusable UI Components (`Navbar`, `Footer`, `Button`, `Card`, `LoadingSpinner`)
- [ ] สร้าง API Client Service (`services/api.js`, `authService.js`, `itemService.js`)
- [ ] สร้างหน้า Login & Register พร้อม Form Validation และ Feedback
- [ ] สร้างหน้า Home & Dashboard แสดงสถิติและรายการ Items
- [ ] ติดตั้ง Route Guard (`ProtectedRoute`) ป้องกันการเข้าถึง Dashboard โดยไม่ล็อกอิน

### Phase 4: Integration, Testing & Polish 🚀
- [ ] ทดสอบการเชื่อมต่อ API ระหว่าง Client และ Server
- [ ] ตรวจสอบ Error Handling ครอบคลุมทุก Edge Cases
- [ ] เตรียมความพร้อมสำหรับการ Demo และ Sprint Review

---

## ✅ Definition of Done (DoD)
1. โค้ดคอมไพล์และรันได้โดยไม่มี Error (`npm run dev` ทั้ง client และ server)
2. มีการจัดการ Error และ Response Format สม่ำเสมอตลอดทั้งระบบ
3. ผ่านการทดสอบ Manual Test ในการ Register -> Login -> Dashboard -> Create Item
4. เอกสารและ README มีคำแนะนำการติดตั้งที่ทำงานได้จริง
