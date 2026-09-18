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
| POST | `/orders` | Customer Token; สร้างคำสั่งซื้อ |
| GET | `/orders/my` | Customer Token; Order ของตนเอง |
| GET | `/admin/orders` | Admin Token; Order ทั้งหมด |
| PATCH | `/admin/orders/:id/status` | Admin Token; `{status}` |
| GET | `/admin/customers` | Admin Token; ลูกค้า role `user` |
| PUT | `/admin/customers/:id` | Admin Token; แก้ `{username, avatar}` |
| PATCH | `/admin/customers/:id/status` | Admin Token; `{isActive}` ระงับ/เปิดบัญชี |
| POST | `/reviews` | Customer Token; รีวิวสินค้าจาก Order ที่ชำระแล้ว |
| GET | `/reviews/product/:productId` | รีวิวที่แสดงอยู่ คะแนนเฉลี่ย และจำนวนรีวิว |
| GET | `/admin/reviews` | Admin Token; รีวิวทั้งหมดรวมที่ถูกซ่อน |
| PATCH | `/admin/reviews/:id/visibility` | Admin Token; `{isVisible}` |

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

## Order API

`POST /orders` รับข้อมูลจาก Checkout:

```json
{
  "email": "customer@example.com",
  "items": [
    {"productId": "PRODUCT_MONGODB_ID", "variantId": "VARIANT_MONGODB_ID", "sku": "TOP-WHT-S", "quantity": 2}
  ],
  "shippingAddress": {
    "firstName": "Occasion",
    "lastName": "Customer",
    "phone": "0812345678",
    "address": "123 ถนนสุขุมวิท",
    "city": "Bangkok",
    "state": "Bangkok",
    "zipCode": "10110",
    "location": "Thailand",
    "deliveryNote": ""
  },
  "shippingMethod": "standard",
  "shippingCost": 0,
  "paymentMethod": "credit-card"
}
```

Server อ่านราคาและสต็อกจาก Product ใน MongoDB เอง ไม่ใช้ราคาหรือยอดรวมจากหน้าบ้าน สถานะที่รองรับคือ `pending`, `paid`, `processing`, `shipped`, `completed`, `cancelled`

### สร้างรีวิวสินค้า

```json
{
  "orderId": "ORDER_MONGODB_ID",
  "productId": "PRODUCT_MONGODB_ID",
  "rating": 5,
  "comment": "สินค้าคุณภาพดีและตรงปก"
}
```

ลูกค้าต้องเป็นเจ้าของ Order ซึ่งมีสินค้านี้ และ Order ต้องอยู่ในสถานะ `paid`, `processing`, `shipped` หรือ `completed` ลูกค้ารีวิวสินค้าเดิมได้หนึ่งครั้งต่อ Order

## Cart API ที่เสนอ — ยังไม่มี Route

| Method | Path | Body |
|---|---|---|
| GET | `/cart` | — |
| POST | `/cart/items` | `{productId, variantId, quantity}` |
| PATCH | `/cart/items/:itemId` | `{quantity}` |
| DELETE | `/cart/items/:itemId` | — |

ใช้ Product/Variant `_id`; `itemId` คือรายการใน Cart Server ดึงเจ้าของจาก Token ตรวจ Variant, จำนวนเต็ม ≥ 1 และ Stock แล้วคำนวณราคาจาก MongoDB ผู้ใช้เข้าถึงได้เฉพาะ Cart ตนเอง

**ต้องตกลงก่อนเชื่อม:** Response ของ Cart และ Auth หลัก (`/auth` หรือ `/newuser`) ส่วน Product ยังต้องเพิ่ม Validation Tag/วันที่ผิดรูปแบบ
