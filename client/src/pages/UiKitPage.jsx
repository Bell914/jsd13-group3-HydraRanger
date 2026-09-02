import React, { useState } from "react";
import { Bell, Heart, Sparkles } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  FormInput,
  LoadingSpinner,
  Modal,
  Radio,
  Select,
  Textarea,
} from "../components/index.js";

const buttonVariants = ["primary", "secondary", "accent", "surface", "outline", "danger", "ghost"];

const Section = ({ title, description, children }) => (
  <section className="scroll-mt-24 rounded-2xl border border-occasion-border/65 bg-surface p-5 shadow-[var(--shadow-surface)] sm:p-7">
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
      {description && <p className="mt-1 text-sm text-secondary">{description}</p>}
    </div>
    {children}
  </section>
);

export const UiKitPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);

  return (
    <main className="min-w-0 flex-1 bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-10 max-w-3xl">
          <Badge variant="accent">OCCASION UI Kit</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Reusable UI Components
          </h1>
          <p className="mt-3 text-secondary">
            ตัวอย่างชิ้นส่วนกลางและสถานะสำคัญสำหรับใช้อ้างอิงก่อนนำไปวางในแต่ละหน้า
          </p>
        </header>

        <div className="space-y-8">
          <Section title="Buttons" description="เลือกตามความสำคัญของการกระทำ ไม่ใช่ตามสีที่ชอบ">
            <div className="flex flex-wrap items-center gap-3">
              {buttonVariants.map((variant) => (
                <Button key={variant} variant={variant}>
                  {variant}
                </Button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="sm" icon={Heart}>Small</Button>
              <Button size="md" icon={Heart}>Medium</Button>
              <Button size="lg" icon={Heart}>Large</Button>
              <Button loading loadingText="Saving...">Save</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Section>

          <Section title="Form controls" description="ทุกช่องมีชื่อ คำแนะนำ และข้อความผิดพลาดที่อ่านได้ชัดเจน">
            <div className="grid gap-5 md:grid-cols-2">
              <FormInput id="kit-name" label="Display name" placeholder="Your name" helpText="ใช้ชื่อที่ต้องการให้สมาชิกคนอื่นเห็น" />
              <FormInput id="kit-email" type="email" label="Email" defaultValue="invalid-email" error="กรุณากรอกอีเมลให้ถูกต้อง" />
              <Select
                id="kit-category"
                label="Favorite category"
                placeholder="Select a category"
                options={[
                  { value: "tops", label: "Tops" },
                  { value: "bottoms", label: "Bottoms" },
                  { value: "accessories", label: "Accessories" },
                ]}
              />
              <Textarea id="kit-note" label="Style note" placeholder="Tell us about your style" helpText="ไม่เกิน 300 ตัวอักษร" />
              <Checkbox id="kit-news" label="รับข่าวสารจาก OCCASION" description="ส่งข่าวสินค้าใหม่และ Lookbook ทางอีเมล" />
              <div className="space-y-3" role="radiogroup" aria-labelledby="kit-size-label">
                <p id="kit-size-label" className="text-xs font-semibold text-primary">Preferred size</p>
                <Radio id="kit-size-m" name="kit-size" value="m" label="Medium" defaultChecked />
                <Radio id="kit-size-l" name="kit-size" value="l" label="Large" />
              </div>
            </div>
          </Section>

          <Section title="Badges and alerts" description="ใช้สื่อสถานะสั้น ๆ โดยไม่พึ่งสีเพียงอย่างเดียว">
            <div className="mb-6 flex flex-wrap gap-2">
              <Badge>Primary</Badge>
              <Badge variant="accent">New</Badge>
              <Badge variant="success">Available</Badge>
              <Badge variant="warning">Low stock</Badge>
              <Badge variant="danger">Unavailable</Badge>
              <Badge variant="neutral">Draft</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Alert title="Information">บันทึกการเปลี่ยนแปลงอัตโนมัติแล้ว</Alert>
              <Alert variant="success" title="Success">เพิ่มสินค้าในรายการโปรดแล้ว</Alert>
              <Alert variant="warning" title="Please check">สินค้าชิ้นนี้เหลือจำนวนจำกัด</Alert>
              {alertVisible && (
                <Alert variant="error" title="Unable to save" onDismiss={() => setAlertVisible(false)}>
                  กรุณาตรวจข้อมูลแล้วลองอีกครั้ง
                </Alert>
              )}
            </div>
          </Section>

          <Section title="Cards, loading and modal" description="ตัวอย่างพื้นที่ข้อมูล สถานะรอ และกล่องข้อความกลาง">
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Saved Lookbook" subtitle="Updated just now" icon={Sparkles} hoverable>
                <p className="text-sm text-secondary">รวมลุคที่บันทึกไว้เพื่อกลับมาดูภายหลัง</p>
              </Card>
              <Card title="Notifications" subtitle="Interactive card" icon={Bell} onClick={() => setModalOpen(true)} hoverable>
                <p className="text-sm text-secondary">กด Enter, Space หรือคลิกเพื่อเปิด Modal</p>
              </Card>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-occasion-border bg-background">
              <LoadingSpinner message="Loading your looks..." />
            </div>
            <Button className="mt-6" variant="accent" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
          </Section>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Reusable modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p>Modal ปิดได้ด้วยปุ่ม Close, ปุ่ม Escape หรือคลิกพื้นหลัง และจะคืนตำแหน่งเลือกไปยังปุ่มที่ใช้เปิด</p>
      </Modal>
    </main>
  );
};
