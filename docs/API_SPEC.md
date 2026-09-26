# OCCASION API Specification — Sprint 3

Base URL ในเครื่อง: `http://localhost:5002/api`

JSON ใช้ `camelCase` ยกเว้นโครงสร้าง Product รุ่นปัจจุบันที่คงชื่อฐานข้อมูลบางฟิลด์ เช่น `category_id`, `is_active`, `stock_quantity` และ `size_chart`

API ที่ต้อง Login อ่าน HttpOnly cookie แยกระหว่าง Customer (`occasion_session`) และ Admin (`occasion_admin_session`) Frontend ต้องส่ง `credentials: include` และยังรองรับ `Authorization: Bearer <token>` สำหรับเครื่องมือภายนอก

## Public API

| Method | Path | หน้าที่ |
| --- | --- | --- |
| GET | `/` | ข้อมูล API และลิงก์ endpoint หลัก |
| GET | `/health` | สถานะ Server, Database และบริการที่ตั้งค่าไว้ |
| GET | `/products`, `/products/:id` | สินค้าที่เปิดขายและรายละเอียดสินค้า |
| GET | `/lookbooks`, `/lookbooks/:id` | Lookbook ที่เปิดแสดง |
| GET | `/articles`, `/articles/:id` | บทความที่เผยแพร่แล้ว |
| GET | `/uploads/:id` | อ่านรูปจาก GridFS |
| POST | `/recommend` | วิเคราะห์รูป Mix & Match สูงสุด 2 รูป |
| POST | `/contact` | ส่งแบบฟอร์มติดต่อหลังผ่าน validation |

`POST /recommend` รับ multipart fields ชื่อ `top` และ `bottom` อย่างน้อยหนึ่งรูป รองรับ JPG, PNG, WebP และ GIF ไม่เกิน 5 MB ต่อไฟล์ ระบบตรวจ MIME และ file signature ก่อนส่งให้ Gemini หากรูปไม่ใช่เสื้อผ้าจะคืน `422` พร้อม `data.invalidSlots`

## Authentication

| Method | Path | สิทธิ์/ผลลัพธ์ |
| --- | --- | --- |
| POST | `/auth/register` | สมัคร Customer และตั้ง session |
| POST | `/auth/login` | Login Customer |
| POST | `/auth/refresh` | ต่ออายุ session |
| POST | `/auth/logout` | ล้าง Customer session |
| GET | `/auth/me` | Customer ที่ Login |
| PUT | `/auth/profile` | แก้ Profile |
| POST | `/auth/change-password` | เปลี่ยนรหัสผ่านและยกเลิก token เก่า |
| POST | `/auth/forgot-password` | ขออีเมล Reset Password |
| POST | `/auth/reset-password/:token` | ตั้งรหัสผ่านใหม่ด้วย token |
| POST | `/admin/auth/login` | Login Admin และตั้ง Admin session |
| GET | `/admin/auth/me` | ตรวจ Admin session |
| POST | `/admin/auth/logout` | ล้าง Admin session |

SMTP ต้องตั้ง `SMTP_USER` และ `SMTP_PASS` ก่อน Forgot Password และ Welcome Coupon จะส่งอีเมลจริง

## Customer API

| Method | Path | หน้าที่ |
| --- | --- | --- |
| GET, POST | `/users/addresses` | อ่าน/เพิ่มที่อยู่ของ Customer |
| PUT, DELETE | `/users/addresses/:addressId` | แก้/ลบที่อยู่ |
| PATCH | `/users/addresses/:addressId/default` | ตั้งที่อยู่หลัก |
| GET, PUT, DELETE | `/users/me/size-profile` | อ่าน/บันทึก/ลบ Size Profile ของตนเอง |
| POST | `/lookbooks/:id/favorite` | เพิ่มหรือลบ Favorite Lookbook |
| POST | `/orders` | สร้าง Order จากข้อมูลที่ Server ตรวจราคาและ stock แล้ว |
| GET | `/orders/my` | Order History ของ Customer |
| GET | `/orders/my/:id` | รายละเอียด Order ของตนเอง |
| PATCH | `/orders/my/:id/cancel` | ยกเลิก Order ตามสถานะที่ระบบอนุญาต |
| POST | `/payment/create-payment-intent` | สร้างหรือใช้ Stripe PaymentIntent เดิมของ Order |
| POST | `/payment/cancel-payment-intent` | ยกเลิก PaymentIntent ที่ยังชำระไม่สำเร็จ |
| POST | `/coupons/validate` | ตรวจ Coupon กับผู้ใช้และยอดสั่งซื้อ |

Stripe ส่ง webhook เข้า `POST /api/payment/webhook` โดย Server ตรวจ `STRIPE_WEBHOOK_SECRET` ก่อนเปลี่ยนสถานะ Order

### Size Profile

```json
{
  "chestCm": 90,
  "waistCm": 76,
  "hipsCm": 96,
  "preferredFit": "regular",
  "consentGiven": true
}
```

- `preferredFit` รองรับ `fitted`, `regular`, `relaxed`
- ต้องยืนยัน Consent ก่อนบันทึก
- Customer เข้าถึงได้เฉพาะข้อมูลตนเอง และ Admin Customer API ไม่ส่ง `sizeProfile`
- Product Detail ใช้ `size_chart` ก่อน หากไม่มีจะใช้เกณฑ์ S/M/L กลางและแจ้งระดับความมั่นใจ
- คำแนะนำเลือกเฉพาะไซส์ของสินค้า ส่วนสต็อกของสี/ไซส์แสดงเป็นสถานะแยกกัน

## Admin API

ทุก endpoint ด้านล่างต้องมี Admin session และ role `admin`

| Method | Path | หน้าที่ |
| --- | --- | --- |
| GET | `/admin/dashboard` | ยอดสรุปสำหรับ Dashboard |
| GET, POST | `/admin/products` | อ่านสินค้าทั้งหมด/เพิ่มสินค้า |
| PUT, DELETE | `/admin/products/:id` | แก้ไข/ซ่อนสินค้า |
| GET | `/admin/orders` | อ่าน Order ทั้งหมด |
| PATCH | `/admin/orders/:id/status` | เปลี่ยนสถานะ Order |
| GET | `/admin/customers` | อ่าน Customer โดยไม่ส่ง Size Profile |
| PUT | `/admin/customers/:id` | แก้ username/avatar |
| PATCH | `/admin/customers/:id/status` | ระงับ/เปิดบัญชี |
| GET | `/users` | Legacy Admin User list |
| GET | `/users/:id` | Customer อ่านได้เฉพาะตนเอง; Admin อ่านผู้ใช้รายคน |
| GET, POST | `/admin/lookbooks` | อ่านทั้งหมด/เพิ่ม Lookbook |
| PUT | `/admin/lookbooks/:id` | แก้ Lookbook |
| PATCH | `/admin/lookbooks/:id/status` | เปิด/ซ่อน Lookbook |
| GET, POST | `/admin/articles` | อ่านทั้งหมด/เพิ่มบทความ |
| PUT | `/admin/articles/:id` | แก้บทความ |
| PATCH | `/admin/articles/:id/status` | เผยแพร่/ซ่อนบทความ |
| GET, POST | `/admin/coupons` | อ่าน/เพิ่ม General Coupon |
| PUT | `/admin/coupons/:id` | แก้ Coupon |
| PATCH | `/admin/coupons/:id/status` | เปิด/ปิด Coupon |
| POST | `/uploads` | อัปโหลดรูปหนึ่งไฟล์เข้า GridFS |

Review endpoints ไม่มีอยู่ในระบบปัจจุบัน

## Product Payload

```json
{
  "productId": "TOP-001",
  "category_id": "CATEGORY_MONGODB_ID",
  "title": "Everyday T-Shirt",
  "description": "เสื้อยืด Unisex",
  "tags": ["casual"],
  "gender": "unisex",
  "is_active": true,
  "images": [
    {"image_url": "/api/uploads/IMAGE_ID", "display_order": 0}
  ],
  "variants": [
    {
      "sku": "TOP-WHT-M",
      "size_or_color": "M / White",
      "size": "M",
      "color": "White",
      "price": 590,
      "stock_quantity": 10
    }
  ],
  "size_chart": [
    {
      "size_name": "M",
      "garment_chest_actual": 104,
      "garment_waist_actual": 100,
      "garment_hips_actual": 104
    }
  ]
}
```

- Product ต้องมีอย่างน้อยหนึ่ง variant
- ราคาและ stock ต้องไม่ติดลบ; API ตรวจราคาและรูปแบบข้อมูลเพิ่มเติม
- ไม่ส่ง `size_chart` ตอนแก้ไขหมายถึงเก็บค่าเดิม ส่ง array เพื่อแทนที่ และส่ง `[]` เพื่อล้าง
- `DELETE /admin/products/:id` เป็น soft delete โดยปิด `is_active`

## Rate Limits

| Endpoint | Limit ต่อ IP |
| --- | --- |
| Customer Login | 20 ครั้ง / 15 นาที |
| Admin Login | 10 ครั้ง / 15 นาที |
| Register | 10 ครั้ง / 1 ชั่วโมง |
| Forgot Password | 5 ครั้ง / 1 ชั่วโมง |
| Reset Password | 10 ครั้ง / 1 ชั่วโมง |
| Mix & Match | 10 ครั้ง / 15 นาที |
| Admin Upload | 30 ครั้ง / 15 นาที |

ตัวนับใช้ MongoDB ร่วมกันเมื่อฐานข้อมูลพร้อม และ fallback เป็น memory ของ process เมื่อ shared store ใช้งานไม่ได้

## ขอบเขตที่ยังไม่มี

- Cart อยู่ใน Customer Client; ยังไม่มี Cart model หรือ `/cart` route
- Product flow ใช้ `/products`; scaffold `/items` ถูกนำออกแล้ว
- Review feature ถูกถอดออกแล้ว
