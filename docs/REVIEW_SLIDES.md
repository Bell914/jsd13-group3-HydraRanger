# สไลด์ Review — OCCASION (ทีม HydraRanger, Group 3)

> ไฟล์นี้เป็นเนื้อหาสไลด์ฉบับย่อ ครอบคลุม ภาพรวมโปรเจกต์ / เทคนิค & สถาปัตยกรรม / Mix & Match (AI) / การทำงานทีม นำไปวางใน Google Slides, PowerPoint หรือ Canva ได้

---

## สไลด์ 1 — สไลด์เปิด

**OCCASION**
E-commerce เสื้อผ้า Unisex + Lookbook พร้อม AI จับคู่เสื้อผ้า

- ทีม HydraRanger — หลักสูตร Generation Thailand Junior Software Developer (JSD13)
- รุ่น 3 — Training + Production Project
- จัดทำโดย: Pathsharasakon, Puttipong Runtakit, Bell914, bird-sitthan, LukNok, Ittikorn Tipson

---

## สไลด์ 2 — ภาพรวมโปรเจกต์

**Concept**: เว็บ E-commerce เสื้อผ้า Unisex ที่ครบทั้งหน้าร้าน ระบบขาย และ Lookbook

- 3 ระบบใน 1 โปรเจกต์: Customer Client, Admin Client, Express API
- แยกหน้าร้านลูกค้าและหลังบ้าน Admin ออกจากกัน (ใช้ Backend + ฐานข้อมูลร่วมกัน)
- ฟีเจอร์เด่น: Product, Cart & Checkout (Stripe), Auth & Profile, Lookbook, Review, Coupon/Loyalty, Member, Mix & Match AI
- Deploy จริง: Frontend → Vercel, API → Render, ฐานข้อมูล → MongoDB Atlas

---

## สไลด์ 3 — ฟีเจอร์หลัก

| โซน | ฟีเจอร์ |
| --- | --- |
| หน้าร้าน | Product list/detail, Lookbook, Search/Filter, Review |
| สมาชิก | Register/Login (HttpOnly cookie), Profile, ที่อยู่, Size profile |
| ขาย | Cart, Checkout, Stripe Payment, Order, Coupon/Welcome 5% |
| Loyalty | ระบบสะสมแต้มและส่วนลด |
| AI | Mix & Match จับคู่เสื้อผ้า (Gemini) |
| Admin | Dashboard, Product/Customer/Order/Review/Article/Lookbook CRUD |

---

## สไลด์ 4 — Tech Stack

**Frontend**
- React 19 + Vite 6 + TailwindCSS 4 + daisyUI
- React Router 7, Zustand (state), lucide-react
- Vitest + Testing Library (client test)

**Backend**
- Node.js + Express 4 (MVC + Service Layer)
- MongoDB + Mongoose
- JWT + cookie (แยก session ลูกค้า/Admin), bcryptjs, helmet, rate-limit, express-validator
- Stripe, Nodemailer, Multer (upload), Google Gemini AI
- Vitest test (server)

---

## สไลด์ 5 — สถาปัตยกรรม (High Level)

```
Customer Client (React :5173) ──┐
                                ├──> Express API ──> MongoDB
Admin Client (React :5174) ─────┘        │
                                         └──> Gemini AI (Mix & Match)
```

- Decoupled Multi-Client Architecture
- Frontend ใช้ Service Layer กลาง (API Client, `credentials: include`)
- Backend แบ่งชั้น: Routes → Middleware → Validators → Controllers → Services → Models
- แยก session: `occasion_session` (ลูกค้า) / `occasion_admin_session` (Admin)

---

## สไลด์ 6 — API & Data

**API หลัก (`/api`)**
- `/products`, `/lookbooks`, `/articles` — สาธารณะ (GET)
- `/auth` — register/login/refresh/profile/reset-password
- `/orders`, `/payment`, `/coupons` — ต้องล็อกอิน
- `/admin/*` — ต้อง role `admin` + Admin session แยก
- `/recommend` — Mix & Match (rate limit 10 ครั้ง/15 นาที)
- `/uploads` — อัปโหลดรูป (Admin)

**Models**: User, Product, Lookbook, Order, Review, Article, Coupon, Category, Item, StockAdjustment, RateLimitEntry

---

## สไลด์ 7 — ความปลอดภัย (Security)

- Session ใน **HttpOnly cookie** — JavaScript ใน browser อ่าน token ไม่ได้
- แยกสิทธิ์: ลูกค้า กับ Admin (Cookie + role ต่างกัน)
- อัปโหลดรูป: ตรวจ MIME + **magic bytes** (header ของไฟล์จริง) ไม่เชื่อชื่อนามสกุล
- Input validation ทุก endpoint (express-validator)
- Rate limit: login/register/forgot-password/recommend/upload
- helmet + sanitize, ไม่ commit `.env`
- เอกสารอ้างอิง: `docs/SECURITY_TESTING.md`, `docs/SIZE_SECURITY_FOLLOWUP.md`

---

## สไลด์ 8 — Mix & Match (AI) — ภาพรวม

ฟีเจอร์จับคู่เสื้อผ้าด้วย Google Gemini AI

- ผู้ใช้เลือก / ลากวางรูป **ท่อนบน** และ **ท่อนล่าง** (สูงสุด 2 รูป)
- ระบบวิเคราะห์ style, garment types, colors จาก Gemini
- ส่งคืน **Lookbook ที่เข้าคู่ 3 อันดับแรก** พร้อมเหตุผล (TH)
- รูปถูกรวมเข้ากับสินค้าจริง → กดซื้อทั้งเซ็ตได้ พร้อมคูปองส่วนลด
- รองรับ JPG/PNG/WebP/GIF ≤ 5MB ต่อรูป

---

## สไลด์ 9 — Mix & Match — Data Flow

```
ผู้ใช้ (Client) → POST /recommend (multipart: top, bottom)
   → multer memoryStorage (ไม่เขียนลงดิสก์) + ตรวจ magic bytes
   → แปลงรูปเป็น base64 → ส่ง Gemini (analyzeClothingImage)
   => styles / garment_types / colors
   → ดึง Lookbook ทั้งหมด → Gemini rankLookbooks (fallback: heuristic score)
   → คืน { lookbooks: top 3, analysis }
```

- รูปไม่ถูกเก็บถาวร — `persistUpload=false` (อยู่แค่ใน memory/browser)
- ป้องกัน race condition จากการกดยืนยันซ้ำ (requestId)
- ถ้า Gemini fail → fallback อัลกอริทึมให้คะแนนความเข้าคู่เอง

---

## สไลด์ 10 — Mix & Match — โค้ดที่เกี่ยวข้อง

| ฝั่ง | ไฟล์ | หน้าที่ |
| --- | --- | --- |
| Client | `MixAndMatchSection.jsx` | หน้าจอ MIX AND MATCH + แสดงผล top 3 |
| Client | `ImageDropzone.jsx` | drag & drop, preview blob, validate ไฟล์ |
| Client | `recommendService.js` | POST /recommend |
| Server | `recommendController.js` | อ่านรูป → base64 → Gemini → คืน lookbooks |
| Server | `geminiService.js` | analysis prompt + ranking prompt |
| Server | `recommendUploadMiddleware.js` | memory upload + magic bytes + ขนาด ≤5MB |

---

## สไลด์ 11 — การทำงานทีม (Feature Ownership)

| Flow | Owner | Reviewer |
| --- | --- | --- |
| Team Coordination / Integration & Demo | Nae | ทุกคน |
| React/Server Setup, Shared Layout, Lookbook React | Mos | Nae |
| Product Mock Data / Admin Product | Nae | BM |
| Product | BM | Mos |
| Cart & Checkout | Bird | Mos |
| User & Form | LukNok | Nae |

หลัก Feature Ownership: เจ้าของงานต้องอธิบายโค้ด ผสานงาน และทดสอบ Flow ของตัวเองได้

---

## สไลด์ 12 — กระบวนการพัฒนาร่วมกัน

**Trello**: Product Backlog → Sprint Backlog → To Do → In Progress → Code Review → Testing → Done

**Git Flow**: `main` ← `develop` ← `feature/*`

- ห้าม push ตรงเข้า main / develop
- ทุกงานผ่าน PR + Code Review เสมอ
- หลีกเลี่ยง `git add .` และ Commit `.env` / secret
- Commit message มาตรฐาน: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Shared file ต้องแจ้ง Owner ก่อนแก้

---

## สไลด์ 13 — เอกสาร & การทดสอบ

**Docs**: API_SPEC, DATABASE_SCHEMA, ARCHITECTURE, SECURITY_TESTING, LOYALTY_BUSINESS_RULES

**การทดสอบ**
- Client: Vitest + Testing Library (component + accessibility a11y)
- Server: test สถานการณ์สำเร็จ/ผิดพลาด, security test
- Test:conn — ทดสอบการเชื่อมต่อฐานข้อมูลจริง

**ทำเนียบ Commit**: 143+ commits จาก 6 คนผ่าน feature branches

---

## สไลด์ 14 — สรุป / Next Step

**สิ่งที่ทำสำเร็จ**
- เว็บ E-commerce ครบวงจร 3 ชั้น ที่ deploy ได้จริง
- Admin panel แยกจากหน้าร้าน พร้อม Dashboard
- ฟีเจอร์ AI จับคู่เสื้อผ้า (Gemini) ต่อยอดเป็นจุดขาย
- กระบวนการทีมมาตรฐาน: Trello + Git Flow + PR + Feature Ownership

**โอกาสพัฒนา**
- Personal size recommendation (มี doc white paper แล้ว)
- เพิ่ม Mix & Match เป็นหลายชิ้น (outerwear, dress)
- เพิ่ม CI pipeline (lint + test อัตโนมัติ) ก่อน merge

---

_เนื้อหาสไลด์จัดทำจากไฟล์จริงใน repo: README, CONTRIBUTING, docs/ARCHITECTURE, docs/API_SPEC และโค้ดปัจจุบัน_