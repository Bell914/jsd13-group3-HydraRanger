# Contributing Guidelines — OCCASION Sprint 3

เอกสารนี้กำหนดวิธีแก้ไขและส่งงานในช่วงปิด Sprint 3 ให้การเปลี่ยนแปลงตรวจสอบย้อนกลับได้และไม่กระทบงานของสมาชิกคนอื่น

## Branch และ Pull Request

```text
main
  ↑
develop
  ↑
feature/*, fix/*, docs/*, codex/*
```

- สร้าง branch จาก `develop` ล่าสุด
- หนึ่ง branch ควรมีหนึ่งวัตถุประสงค์
- ห้าม push ตรงเข้า `main` หรือ `develop`
- เปิด Pull Request เข้า `develop` พร้อมวิธีทดสอบและข้อจำกัด
- ให้ Reviewer อย่างน้อยหนึ่งคนตรวจและ approve ก่อน merge

```bash
git switch develop
git pull origin develop
git switch -c docs/update-project-documentation
```

## การทำงานกับ Trello

```text
Product Backlog → Sprint Backlog → To Do → In Progress → Code Review → Testing → Done
```

- การ์ดต้องระบุ Owner, acceptance criteria และผลลัพธ์ที่คาดหวัง
- แนบ Pull Request และผลทดสอบในการ์ด
- ใช้ `Blocked` เมื่อทำต่อไม่ได้และบันทึกสาเหตุ
- ไม่ย้ายไป `Done` จน Review และ Testing เสร็จ

## ก่อน Commit

```bash
git status
git diff --check
git diff --staged
```

เพิ่มเฉพาะไฟล์ที่เกี่ยวข้อง หลีกเลี่ยง `git add .` เมื่อยังไม่ได้ตรวจสถานะ และห้าม commit:

- `.env`, password, token หรือ API key
- `node_modules`, log และไฟล์ชั่วคราว
- ไฟล์ส่วนตัวหรือเอกสารที่ไม่ได้เป็นเอกสารกลางของทีม
- การเปลี่ยนแปลงที่ไม่เกี่ยวกับวัตถุประสงค์ของ PR

## Commit Message

ใช้รูปแบบ `<type>: <description>` เช่น:

```text
feat: add admin coupon management
fix: preserve product size chart on update
docs: align Sprint 3 documentation with current system
test: cover checkout payment cancellation
```

ประเภทที่ใช้ได้: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## คำสั่งตรวจหลัก

เลือกคำสั่งที่ตรงกับไฟล์ที่แก้:

```bash
npm test --prefix client
npm run build --prefix client
npm test --prefix admin-client
npm run build --prefix admin-client
npm test --prefix server
npm run test:security --prefix server
```

การทดสอบฐานข้อมูลจริงใช้ `npm run test:conn --prefix server` และต้องตั้ง environment ให้พร้อมก่อน

## กติกาเฉพาะโปรเจกต์

- Customer และ Admin ใช้ session cookie แยกกัน ห้ามรวม token หรือข้ามการตรวจ role
- ราคา ยอดรวม ส่วนลด และ stock ต้องยืนยันจาก Server
- Product ใช้ `category_id`, `images[]`, `variants[]` และ `size_chart[]` ตาม model ปัจจุบัน
- การอัปโหลดต้องตรวจขนาด MIME และ file signature
- เอกสาร API/Database/Architecture ต้องอัปเดตเมื่อ route, payload, model หรือ environment เปลี่ยน
- Review feature ถูกถอดแล้ว ห้ามเพิ่มเอกสารหรือเมนู Review กลับมาโดยไม่มี requirement ใหม่ของทีม

## Pull Request Description

```md
## ปัญหา

อธิบายสิ่งที่ไม่ตรงหรือเหตุผลที่ต้องแก้

## สิ่งที่เปลี่ยน

- รายการการเปลี่ยนแปลง

## การตรวจสอบ

- คำสั่งหรือ flow ที่ทดสอบ

## Trello

- ลิงก์การ์ด

## ข้อจำกัด

- สิ่งที่ยังไม่ครอบคลุม
```

## Definition of Done

- งานตรงกับ acceptance criteria และขอบเขต PR
- ทดสอบกรณีสำเร็จและกรณีผิดพลาดที่เกี่ยวข้อง
- Frontend มี loading, empty และ error state เมื่อจำเป็น
- Validation และ authorization อยู่ฝั่ง Server สำหรับข้อมูลสำคัญ
- ไม่มี secret หรือไฟล์ส่วนตัวใน commit
- เอกสารและ `.env.example` ตรงกับ implementation
- PR ผ่าน Review และ Testing

ประวัติ Git และ Trello เป็นแหล่งอ้างอิงเจ้าของงานราย feature เมื่อมีข้อสงสัย ให้แจ้ง Owner ก่อนแก้ shared file
