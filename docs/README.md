# OCCASION Documentation Index — Sprint 3

เอกสารกลางชุดนี้ตรวจเทียบกับ `develop` ของ Sprint 3 แล้ว ใช้ source code เป็นหลักเมื่อข้อความในเอกสารเก่าขัดกับ implementation

| เอกสาร | เนื้อหา |
| --- | --- |
| [API Specification](API_SPEC.md) | Routes, สิทธิ์, payload สำคัญ และ rate limits |
| [Database Schema](DATABASE_SCHEMA.md) | Mongoose models และความสัมพันธ์ของข้อมูล |
| [Use Case Diagram](USE_CASE_DIAGRAM.md) | ผู้ใช้งานและขอบเขตของระบบที่ส่งมอบจริง |
| [Architecture](ARCHITECTURE.md) | โครงสร้าง Customer/Admin/API และ data flows |
| [Loyalty Business Rules](LOYALTY_BUSINESS_RULES.md) | กฎสมาชิก คะแนน ส่วนลด และ Coupon |
| [Review Slides](REVIEW_SLIDES.md) | โครงสไลด์สำหรับนำเสนอระบบ Sprint 3 |

## ขอบเขตปัจจุบัน

- Review feature ถูกนำออกแล้ว
- Personalized Size Recommendation, Security safeguards และ Admin `size_chart` เป็น implementation ในระบบปัจจุบัน รายละเอียดที่จำเป็นถูกรวมไว้ใน API, Database และ Architecture
- เอกสารเฉพาะบุคคลไม่เก็บใน repository; เอกสารกลางต้องอธิบายเฉพาะ behavior ที่ทีมส่งมอบ
- Cart หลักอยู่ใน Customer Client และยังไม่มี Cart model/route ฝั่ง Server
- Scaffold `Item` CRUD และ model ซ้ำถูกนำออกแล้ว; Product flow ใช้ `Product` เพียงชุดเดียว

เมื่อ route, model, environment หรือ feature scope เปลี่ยน ให้ปรับเอกสารที่เกี่ยวข้องใน PR เดียวกัน
