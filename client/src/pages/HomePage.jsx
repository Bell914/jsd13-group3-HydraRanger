import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Layers, Terminal, ArrowRight, CheckCircle2, Zap, Server, Code } from 'lucide-react';
import { Button, Card } from '../components/index.js';

export const HomePage = () => {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="text-center py-12 sm:py-20 px-4 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles size={14} />
          Group Project 3 • Sprint 2
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto mb-6 text-slate-100">
          Powering Modular Full-Stack <br />
          with{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            HydraRanger
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          ระบบโครงสร้างการทำงานแบบแยกส่วน (Modular Clean Architecture)
          พร้อมการเชื่อมต่อ REST API, JWT Authentication, Tailwind CSS v4, และ Dashboard จัดการข้อมูลแบบ Real-Time
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/dashboard">
            <Button size="lg" icon={ArrowRight}>
              Open Dashboard
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" icon={Terminal}>
              Sign In Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          icon={Server}
          title="Modular Express API"
          subtitle="Backend Layered Design"
          hoverable
        >
          <p className="text-sm text-slate-400 leading-relaxed">
            แยกเลเยอร์ชัดเจนตามหลัก MVC + Services + Validators พร้อมระบบ Fallback รองรับทั้ง MongoDB และ In-Memory Store
          </p>
        </Card>

        <Card
          icon={Code}
          title="React 19 + Tailwind v4"
          subtitle="Modern Frontend Experience"
          hoverable
        >
          <p className="text-sm text-slate-400 leading-relaxed">
            พัฒนาด้วย React Router v7, @tailwindcss/vite และ Custom API Service Layer ตอบสนองรวดเร็ว
          </p>
        </Card>

        <Card
          icon={Zap}
          title="JWT Authentication"
          subtitle="Secure Access Control"
          hoverable
        >
          <p className="text-sm text-slate-400 leading-relaxed">
            ระบบยืนยันตัวตนแบบ Token-Based พร้อม Password Hashing (bcrypt) และ Route Guard ปกป้องหน้าจัดการข้อมูล
          </p>
        </Card>
      </section>

      {/* Sprint Deliverables Card */}
      <Card
        title="Sprint 2 Deliverables & Structure"
        subtitle="Full-Stack Readiness Checklist"
        icon={Layers}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[
            'Modular Client & Server Separation',
            'Full REST API Specification in docs/',
            'Centralized Error & Logger Middlewares',
            'Interactive Item CRUD Dashboard',
            'Tailwind CSS v4 with @tailwindcss/vite',
            'Clean Git Flow & Contributing Guidelines'
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-sm font-medium text-slate-300"
            >
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
