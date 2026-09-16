# OCCASION API

Base URL: `http://localhost:5001/api` · JSON ใช้ `camelCase`
API ที่ต้อง Login ส่ง `Authorization: Bearer <token>`

## API ที่มีในโค้ด

| Method | Path | ข้อมูล / สิทธิ์ |
|---|---|---|
| GET | `/health` | ตรวจ Server |
| POST | `/auth/register` | username, email, password |
| POST | `/auth/login` | email, password; คืน `data.token` |
| GET | `/auth/me` | ต้อง Login |
| POST | `/auth/refresh` | `{token}` ที่ยังไม่หมดอายุ |
| POST | `/auth/change-password` | currentPassword, newPassword; ต้อง Login |
| POST | `/admin/auth/login` | email, password ของ Admin |
| GET | `/admin/auth/me` | Admin Token |
| GET | `/products`, `/products/:id` | สินค้า active: รายการ / รายชิ้น |
| GET, POST | `/admin/products` | Admin: รายการ active / เพิ่ม |
| PUT, DELETE | `/admin/products/:id` | Admin: แก้ / ซ่อน |
| GET | `/admin/dashboard` | Admin Token |

### เพิ่ม / แก้ Product

```json
{
  "name": "T-Shirt",
  "description": "เสื้อยืด",
  "category": "tops",
  "gender": "unisex",
  "tags": ["casual"],
  "availableDate": "2026-09-01",
  "variants": [
    {"sku": "TOP-WHT-S", "color": "white", "size": "S", "price": 590, "stockQuantity": 10}
  ]
}
```

- `:id` ใช้ MongoDB `_id`; PUT ส่งข้อมูลบังคับครบ
- ราคา > 0; Stock เป็นจำนวนเต็ม ≥ 0; DELETE ตั้ง `isActive=false`
- สำเร็จคืน `{success: true, data}`: เพิ่ม 201, อ่าน/แก้ 200; ลบคืน 200 พร้อม message ไม่มี data
- Validator คืน 400 พร้อม `{success: false, message, errors}`; ไม่พบ Product คืน 404; Mongoose Error บางกรณียังคืน 500

## Cart API ที่เสนอ — ยังไม่มี Route

| Method | Path | Body |
|---|---|---|
| GET | `/cart` | — |
| POST | `/cart/items` | `{productId, variantId, quantity}` |
| PATCH | `/cart/items/:itemId` | `{quantity}` |
| DELETE | `/cart/items/:itemId` | — |

ใช้ Product/Variant `_id`; `itemId` คือรายการใน Cart Server ดึงเจ้าของจาก Token ตรวจ Variant, จำนวนเต็ม ≥ 1 และ Stock แล้วคำนวณราคาจาก MongoDB ผู้ใช้เข้าถึงได้เฉพาะ Cart ตนเอง

**ต้องตกลงก่อนเชื่อม:** Response ของ Cart และ Auth หลัก (`/auth` หรือ `/newuser`) ส่วน Product ยังต้องเพิ่ม Validation Tag/วันที่ผิดรูปแบบ
