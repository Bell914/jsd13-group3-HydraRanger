# Contributing Guidelines — OCCASION Sprint 2

เอกสารนี้กำหนดวิธีทำงานร่วมกันใน Sprint 2 สมาชิกทุกคนต้องอ่านก่อนเริ่มงาน

## Team Principles

ทีมใช้หลัก Feature Ownership

Feature Owner ต้อง:

- เข้าใจข้อมูลที่รับเข้ามา
- เข้าใจข้อมูลที่ต้องส่งต่อ
- ประสานงานกับ Feature ที่เกี่ยวข้อง
- ทดสอบ Flow ของตนเอง
- อธิบายโค้ดที่ตนเองรับผิดชอบได้
- ขอความช่วยเหลือเมื่อไม่เข้าใจ

Owner ไม่จำเป็นต้องทำทุกอย่างคนเดียว แต่ต้องรับผิดชอบให้งานสำเร็จ

## Feature Ownership

| Flow | Owner | Reviewer |
|---|---|---|
| Team Coordination | Nae | Everyone |
| React/Server Setup | Mos | Nae |
| Shared Layout | Mos | Nae |
| Product Mock Data | Nae | BM, Bird |
| Lookbook Mock Data | Nae | Mos, BM |
| Admin Product | Nae | BM |
| Product | BM | Mos |
| Cart and Checkout | Bird | Mos |
| User and Form | LukNok | Nae |
| Lookbook React | Mos | Nae |
| Integration and Demo | Nae | Everyone |

Reviewer ให้คำแนะนำและตรวจงาน แต่ไม่ควรทำงานทั้งหมดแทน Owner

## Trello Workflow

```text
Product Backlog
      ↓
Sprint Backlog
      ↓
To Do
      ↓
In Progress
      ↓
Code Review
      ↓
Testing
      ↓
Done
```

ใช้ `Blocked` เมื่องานไม่สามารถทำต่อได้

กติกา:

- แต่ละคนมีงาน In Progress ครั้งละหนึ่งการ์ด
- งานเขียนเสร็จต้องผ่าน Code Review
- งาน Review ผ่านต้องผ่าน Testing
- ห้ามย้ายไป Done ก่อน Review และ Testing
- งานใหม่ให้ใส่ Product Backlog ก่อน

## Git Flow

```text
main
  ↑
develop
  ↑
feature/*
```

### Main

ใช้สำหรับเวอร์ชันพร้อมส่งหรือพร้อม Demo

ห้าม Commit หรือ Push โดยตรง

### Develop

ใช้รวมงานที่ผ่าน Review แล้ว

ห้าม Commit หรือ Push โดยตรง

### Feature Branch

สร้างจาก `develop` ล่าสุด และใช้กับงานหนึ่งเรื่อง

ตัวอย่าง:

```text
feature/react-setup
feature/server-setup
feature/shared-layout
feature/product-mock-data
feature/lookbook-mock-data
feature/product-model
feature/product-api
feature/product-card
feature/product-list
feature/product-detail
feature/admin-product-form
feature/cart-model
feature/cart-api
feature/cart-react
feature/checkout-react
feature/form-validation
feature/profile-react
feature/lookbook-react
```

หลีกเลี่ยงชื่อกว้างเกินไป:

```text
feature/my-work
feature/sprint-2
feature/final
feature/all-product
```

## Starting a Task

### 1. อ่าน Trello Card

ตรวจว่า:

- เข้าใจ Description
- เข้าใจ Checklist
- เข้าใจ Done เมื่อ
- Owner เป็นชื่อตนเอง

ย้าย Card ไป `In Progress`

### 2. ดึง Develop ล่าสุด

```bash
git switch develop
git pull origin develop
```

### 3. สร้าง Branch

```bash
git switch -c feature/product-card
```

### 4. พัฒนาและทดสอบ

ทำเฉพาะงานใน Trello Card

หากต้องแก้ Shared File ให้แจ้ง Owner ก่อน

### 5. ตรวจไฟล์

```bash
git status
```

### 6. เพิ่มเฉพาะไฟล์ที่เกี่ยวข้อง

```bash
git add client/src/components/product
```

อย่าใช้ `git add .` โดยไม่ตรวจไฟล์

### 7. ตรวจสิ่งที่จะ Commit

```bash
git diff --staged
```

ตรวจว่าไม่มี:

- `.env`
- Password
- Token
- ไฟล์ที่ไม่เกี่ยวข้อง
- Debug Code ที่ไม่จำเป็น

### 8. Commit

```bash
git commit -m "feat: create product card component"
```

### 9. Push

```bash
git push -u origin feature/product-card
```

### 10. เปิด Pull Request

เปิดจาก Feature Branch ไปที่ `develop`

เพิ่ม Pull Request Link ลงใน Trello Card และย้ายไป `Code Review`

## Shared File Ownership

### Frontend Shared Files

Owner: Mos

```text
client/package.json
client/src/main.jsx
client/src/App.jsx
client/src/routes/AppRoutes.jsx
client/src/components/layout/Navbar.jsx
client/src/components/layout/Footer.jsx
client/src/services/apiClient.js
```

### Backend Shared Files

Owner: Mos

```text
server/package.json
server/src/app.js
server/src/server.js
server/src/config/database.js
server/src/middleware/notFound.js
server/src/middleware/errorHandler.js
```

### Product and Lookbook Data

Owner: Nae

```text
server/src/data/products.json
server/src/data/lookbooks.json
client/src/assets/images/products/
client/src/assets/images/lookbooks/
```

สมาชิกต้องแจ้ง Owner ก่อนแก้ Shared File

## Naming Conventions

### Components and Pages

ใช้ PascalCase:

```text
ProductCard.jsx
ProductListPage.jsx
CartItem.jsx
CheckoutPage.jsx
```

### Functions and Variables

ใช้ camelCase:

```js
getProducts()
addToCart()
calculateTotal()
```

### Models

ใช้เอกพจน์และ PascalCase:

```text
Product.js
Cart.js
Order.js
Lookbook.js
```

### API Paths and Collections

ใช้พหูพจน์:

```text
/api/products
/api/orders
products
orders
lookbooks
```

คำว่า Order ต้องสะกด `Order` ไม่ใช่ `Oder`

## Commit Messages

รูปแบบ:

```text
<type>: <description>
```

ประเภท:

| Type | Meaning |
|---|---|
| `feat:` | เพิ่ม Feature |
| `fix:` | แก้ Bug |
| `docs:` | แก้เอกสาร |
| `style:` | แก้ UI/CSS โดยไม่เปลี่ยน Logic |
| `refactor:` | ปรับโครงสร้างโค้ด |
| `test:` | เพิ่มหรือแก้ Test |
| `chore:` | Setup หรือ Dependency |

ตัวอย่าง:

```text
feat: create product list
fix: prevent cart quantity from exceeding stock
docs: update setup instructions
chore: install mongoose
```

ห้ามใช้:

```text
update
done
final
fix
แก้แล้ว
```

## Pull Request Template

```md
## What was changed?

-

## Why?

-

## How was it tested?

-

## Trello Card

-

## Screenshots

-

## Checklist

- [ ] ฉันทดสอบงานแล้ว
- [ ] ฉันไม่ได้ Commit `.env`
- [ ] ฉันไม่ได้เพิ่มข้อมูลลับ
- [ ] ฉันสามารถอธิบายโค้ดได้
- [ ] ฉันอัปเดตเอกสารแล้ว หากจำเป็น
```

## Code Review

Reviewer ตรวจ:

- งานตรงกับ Trello Card
- ชื่อเข้าใจง่าย
- ไม่มีโค้ดซ้ำโดยไม่จำเป็น
- ไม่มีข้อมูลลับ
- Validation ครบ
- Error Message เข้าใจง่าย
- API Method ถูกต้อง
- Database ทำงานจริง
- ไม่กระทบ Feature อื่น
- Owner อธิบาย Flow ได้

Reviewer ควรอธิบายเหตุผล ไม่ใช้เพียงข้อความว่า “ผิด” หรือ “แก้ใหม่”

## Definition of Done

งานถือว่า Done เมื่อ:

- Checklist ใน Trello ครบ
- Acceptance Criteria ผ่าน
- Owner ทดสอบกรณีสำเร็จ
- Owner ทดสอบกรณีผิดพลาด
- มี Validation เมื่อเกี่ยวข้อง
- มี Loading, Empty และ Error State เมื่อเกี่ยวข้อง
- UI Responsive เมื่อเป็นงาน Frontend
- MongoDB ทำงานจริงเมื่อเกี่ยวข้อง
- ไม่มี Error สำคัญ
- ไม่มี `.env` หรือข้อมูลลับ
- Owner อธิบายโค้ดได้
- Pull Request ผ่าน Review
- Integration Testing ผ่าน
- Trello Card ผ่าน Code Review และ Testing

การเขียนโค้ดเสร็จเพียงอย่างเดียวยังไม่ถือว่า Done

## Environment Variables

ห้าม Commit `.env`

Repository ต้องมี `.env.example`:

```env
PORT=5000
MONGODB_URI=
CLIENT_URL=http://localhost:5173
```

เมื่อต้องเพิ่ม Environment Variable:

1. เพิ่มชื่อใน `.env.example`
2. ไม่ใส่ค่าจริง
3. แจ้งทีม
4. ตรวจ `.gitignore`

## Prohibited Actions

ห้าม:

- Push เข้า `main` โดยตรง
- Push เข้า `develop` โดยตรง
- Merge โดยไม่มี Pull Request
- Merge โดยไม่มี Reviewer
- Commit `.env`
- Commit Password หรือ Token
- Commit `node_modules`
- ลบไฟล์ของสมาชิกอื่นโดยไม่แจ้ง
- เปลี่ยนชื่อข้อมูลร่วมโดยไม่แจ้งทีม
- แก้ Shared File โดยไม่แจ้ง Owner
- Merge โค้ดที่ Owner อธิบายไม่ได้
- ย้าย Trello Card ไป Done ก่อน Review และ Testing

## Getting Help

หากติดปัญหาเกินประมาณ 30–60 นาที:

1. อ่าน Error Message
2. บันทึกสิ่งที่ทดลองแล้ว
3. Comment ใน Trello Card
4. ย้ายไป Blocked หากทำต่อไม่ได้
5. Tag ผู้ที่เกี่ยวข้อง
6. ขอ Pair Programming หรือ Review

รูปแบบการขอความช่วยเหลือ:

```text
สิ่งที่กำลังทำ:
ปัญหาที่พบ:
ข้อความ Error:
สิ่งที่ทดลองแล้ว:
ผลลัพธ์ที่คาดหวัง:
ต้องการความช่วยเหลือจาก:
```
