# 🤝 คู่มือการทำงานร่วมกันในทีม (Contributing Guidelines)

เอกสารนี้กำหนดข้อตกลงและมาตรฐานการทำงานร่วมกันสำหรับสมาชิกทีม **HydraRanger (Group 3)** ในช่วง Sprint 2 เพื่อให้โค้ดมีคุณภาพ สะอาด และลดข้อขัดแย้ง (Merge Conflicts) ระหว่างทำงาน

---

## 🌿 1. กลยุทธ์การแตกกิ่ง (Git Branching Strategy)

เราใช้รูปแบบ **Git Flow / GitHub Flow**:
- `main` : กิ่ง Production โค้ดที่ผ่านการทดสอบและพร้อมส่งงานเท่านั้น (ห้าม Push เข้าโดยตรง)
- `develop` : กิ่งรวมผลงานระหว่าง Sprint (ผ่านการทดสอบและ Code Review แล้ว)
- `feature/<feature-name>` : กิ่งสำหรับพัฒนาฟีเจอร์ใหม่
- `bugfix/<bug-name>` : กิ่งสำหรับแก้ไขข้อผิดพลาด
- `docs/<doc-name>` : กิ่งสำหรับเขียนหรือแก้ไขเอกสาร

### 📌 รูปแบบการตั้งชื่อ Branch:
```
feature/auth-login
feature/client-dashboard
feature/item-crud-api
bugfix/cors-header-error
docs/api-documentation
```

---

## ✍️ 2. ข้อตกลงการเขียน Commit Message (Conventional Commits)

ทุก Commit Message ต้องกระชับและสื่อความหมายชัดเจน โดยใช้รูปแบบ:
```
<type>(<scope>): <subject>
```

### รายการ Types:
- `feat` : เพิ่มฟีเจอร์ใหม่
- `fix` : แก้ไขบั๊ก
- `docs` : เพิ่มหรือแก้ไขเอกสาร
- `style` : จัดรูปแบบโค้ด (whitespace, formatting, semicolons) โดยไม่เปลี่ยน logic
- `refactor` : ปรับปรุงโครงสร้างโค้ด โดยไม่เพิ่มฟีเจอร์หรือแก้บั๊ก
- `test` : เพิ่มหรือปรับปรุง Unit Tests / Integration Tests
- `chore` : อัปเดต dependencies, config build tools

### ตัวอย่าง:
```
feat(client): add user dashboard component and stats cards
feat(server): implement jwt authentication middleware
fix(api): resolve undefined token in auth header
docs(readme): update sprint 2 setup instructions
```

---

## 🔄 3. ขั้นตอนการส่งโค้ด (Pull Request Workflow)

1. **ดึงโค้ดล่าสุดก่อนเริ่มงาน**:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **สร้าง Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **พัฒนาโค้ดและ Commit ตามมาตรฐาน**:
   ```bash
   git add .
   git commit -m "feat(client): implement registration form"
   ```

4. **ก่อนเปิด PR ให้ Rebase หรือ Merge ล่าสุดจาก `develop`**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature-name
   git merge develop
   ```

5. **Push และสร้าง Pull Request**:
   - ตั้งชื่อ PR ให้ชัดเจน เช่น `[Sprint 2] Implement Authentication Flow`
   - อธิบายสิ่งที่เพิ่มหรือแก้ไขใน PR Template
   - ขอ Code Review จากเพื่อนในทีมอย่างน้อย 1 คนก่อนทำการ Merge

---

## 🧹 4. มาตรฐานโค้ด (Code Quality Guidelines)

- **Clean Code**: ตั้งชื่อตัวแปร ฟังก์ชัน และคอมโพเนนต์ให้สื่อความหมาย (camelCase สำหรับตัวแปร/ฟังก์ชัน, PascalCase สำหรับ React Components)
- **Modular Design**: แยกโค้ดเป็นไฟล์ย่อยตามหน้าที่ (Controller -> Service -> Model)
- **No Secrets**: ห้าม Commit ไฟล์ `.env` หรือ API Keys ลงใน Git เด็ดขาด
- **Format & Lint**: ตรวจสอบว่าไม่มี syntax error หรือ unhandled promise rejection ก่อนเปิด PR
