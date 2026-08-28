import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Layers, Terminal, ArrowRight, CheckCircle2, Zap, Server, Code } from 'lucide-react';
import { Button, Card } from '../components/index.js';

export const HomePage = () => {
  return (
    <div className="flex min-w-0 flex-col gap-12 py-4 sm:gap-16 sm:py-8">
      {/* Hero Section */}
      <section className="relative px-0 py-10 text-center sm:px-4 sm:py-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent shadow-sm">
          <Sparkles size={14} aria-hidden="true" />
          Group Project 3 • Sprint 2
        </div>

        <h1 className="mx-auto mb-6 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-primary sm:text-5xl lg:text-6xl">
          Powering Modular Full-Stack <br className="hidden sm:block" />
          with{' '}
          <span className="block text-accent sm:inline">
            OCCASION
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-secondary sm:text-xl">
          ระบบโครงสร้างการทำงานแบบแยกส่วน (Modular Clean Architecture)
          พร้อมการเชื่อมต่อ REST API, JWT Authentication, Tailwind CSS v4, และ Dashboard จัดการข้อมูลแบบ Real-Time
        </p>

        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button as={Link} to="/dashboard" size="lg" icon={ArrowRight} className="w-full sm:w-auto">
            Open Dashboard
          </Button>
          <Button as={Link} to="/login" variant="secondary" size="lg" icon={Terminal} className="w-full sm:w-auto">
            Sign In Demo
          </Button>
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
          <p className="text-sm leading-relaxed text-secondary">
            แยกเลเยอร์ชัดเจนตามหลัก MVC + Services + Validators พร้อมระบบ Fallback รองรับทั้ง MongoDB และ In-Memory Store
          </p>
        </Card>

        <Card
          icon={Code}
          title="React 19 + Tailwind v4"
          subtitle="Modern Frontend Experience"
          hoverable
        >
          <p className="text-sm leading-relaxed text-secondary">
            พัฒนาด้วย React Router v7, @tailwindcss/vite และ Custom API Service Layer ตอบสนองรวดเร็ว
          </p>
        </Card>

        <Card
          icon={Zap}
          title="JWT Authentication"
          subtitle="Secure Access Control"
          hoverable
        >
          <p className="text-sm leading-relaxed text-secondary">
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
              className="flex items-center gap-3 rounded-xl border border-occasion-border/55 bg-background/65 p-3 text-sm font-medium text-secondary"
            >
              <CheckCircle2 size={18} aria-hidden="true" className="shrink-0 text-accent" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
