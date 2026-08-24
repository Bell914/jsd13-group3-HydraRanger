# 🛡️ Group 3 - HydraRanger (Sprint 2)

ยินดีต้อนรับสู่คลังโค้ดของทีม **HydraRanger (Group 3)** สำหรับ **Sprint 2** 🚀
โปรเจกต์นี้เป็น Full-Stack Web Application ที่ถูกออกแบบโครงสร้างแบบแยกส่วน (Modular Architecture) ระหว่าง Client (Frontend) และ Server (Backend) เพื่อให้การทำงานร่วมกันในทีมเป็นไปอย่างมีประสิทธิภาพ

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
group3-HydraRanger/
├── client/                      # Frontend Application (React + Vite)
│   ├── public/                  # Static assets
│   └── src/
│       ├── assets/              # Images, icons, static files
│       ├── components/          # Reusable UI components (Navbar, Button, Card, etc.)
│       ├── pages/               # Page components (Home, Dashboard, Login, Register, etc.)
│       ├── services/            # API client and backend service calls
│       ├── routes/              # Routing definitions & route guards
│       ├── App.css              # App styling
│       ├── App.jsx              # Main React App component
│       ├── index.css            # Global design system & theme variables
│       └── main.jsx             # React entry point
│   ├── .env.example             # Frontend environment variables template
│   ├── index.html               # Main HTML template
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.js           # Vite build configuration & API proxy
│
├── server/                      # Backend Application (Node.js + Express REST API)
│   ├── src/
│   │   ├── config/              # Database, environment, & constants configuration
│   │   ├── models/              # Data models & schemas (Mongoose / Data layers)
│   │   ├── controllers/         # Request handling & HTTP response logic
│   │   ├── routes/              # Express API route endpoints
│   │   ├── middleware/          # Auth, error handling, validation, logging middleware
│   │   ├── services/            # Core business logic
│   │   ├── validators/          # Request validation schemas
│   │   ├── data/                # Initial seed data & fixtures
│   │   ├── scripts/             # Database seeding & health check scripts
│   │   ├── app.js               # Express application initialization & middleware setup
│   │   └── server.js            # Server entry point & HTTP listener
│   ├── .env.example             # Backend environment variables template
│   └── package.json             # Backend dependencies & scripts
│
├── docs/                        # Project Documentation
│   ├── API_SPEC.md              # Detailed REST API specification
│   ├── ARCHITECTURE.md          # System architecture & data flow
│   ├── DATABASE_SCHEMA.md       # Data schema & relationships
│   └── SPRINT_PLAN.md           # Sprint 2 task breakdown & milestones
│
├── .gitignore                   # Git ignore file
├── README.md                    # Project overview & quickstart guide
└── CONTRIBUTING.md              # Team workflow, branching & commit conventions
```

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### 🎨 Frontend (Client)
- **Framework**: React (v19) with Vite
- **Routing**: React Router DOM (v7)
- **Styling**: Vanilla Modern CSS (CSS Variables, Flexbox/Grid, Glassmorphism design system)
- **Icons**: Lucide React / SVG Icons
- **HTTP Client**: Fetch API / Custom Axios-like Service Layer

### ⚙️ Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database / ORM**: MongoDB + Mongoose (พร้อม In-Memory Fallback Service)
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs
- **Middleware**: CORS, Morgan (HTTP logger), Custom Error & Validation Middlewares

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### 1. Clone คลังโค้ด
```bash
git clone https://github.com/your-org/group3-HydraRanger.git
cd group3-HydraRanger
```

### 2. ติดตั้งและรัน Backend (Server)
```bash
cd server
npm install
cp .env.example .env     # หรือคัดลอกไฟล์ .env.example เป็น .env บน Windows
npm run dev
```
> Server จะเริ่มทำงานที่: `http://localhost:5000`

### 3. ติดตั้งและรัน Frontend (Client)
เปิด Terminal ใหม่:
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
> Client จะเริ่มทำงานที่: `http://localhost:5173`

---

## 📜 เอกสารเพิ่มเติม (Documentation)
- 📖 [API Specification](docs/API_SPEC.md) - รายละเอียด API Endpoints ทั้งหมด
- 🏛️ [Architecture Guide](docs/ARCHITECTURE.md) - โครงสร้างและการไหลของข้อมูล (Data Flow)
- 🗄️ [Database Schema](docs/DATABASE_SCHEMA.md) - โครงสร้างตารางและ Model
- 🎯 [Sprint Plan](docs/SPRINT_PLAN.md) - แผนการดำเนินงานของ Sprint 2
- 🤝 [Contributing Guidelines](CONTRIBUTING.md) - กฎการตั้งชื่อ Branch, Commit และ Pull Request

---

## 👥 สมาชิกทีม (Team Members - HydraRanger)
- **Team Name**: HydraRanger (Group 3)
- **Cohort**: JSD13
