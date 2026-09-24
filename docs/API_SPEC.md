# OCCASION API

Base URL: `http://localhost:5002/api` · JSON ใช้ `camelCase`
API ที่ต้อง Login ใช้ HttpOnly session cookie และ Frontend ต้องส่ง `credentials: include` โดยยังรองรับ `Authorization: Bearer <token>` สำหรับเครื่องมือภายนอก

## API ที่มีในโค้ด

| Method | Path | ข้อมูล / สิทธิ์ |
|---|---|---|
| GET | `/health` | ตรวจ Server, Database และสถานะการตั้งค่าอีเมล Reset Password |
| POST | `/auth/register` | username, email, password |
| POST | `/auth/login` | email, password; ตั้ง Customer session cookie |
| GET | `/auth/me` | ต้อง Login |
| POST | `/auth/refresh` | ต่ออายุ session จาก cookie หรือ Bearer token |
| POST | `/auth/change-password` | currentPassword, newPassword; ต้อง Login |
| POST | `/admin/auth/login` | email, password ของ Admin; ตั้ง Admin session cookie |
| GET | `/admin/auth/me` | Admin session |
| GET | `/products`, `/products/:id` | สินค้า active: รายการ / รายชิ้น |
| GET, POST | `/admin/products` | Admin: ดูรายการทั้ง active/inactive / เพิ่ม |
| PUT, DELETE | `/admin/products/:id` | Admin: แก้ / ซ่อน |
| GET | `/admin/dashboard` | Admin session |
| POST | `/orders` | Customer session; สร้างคำสั่งซื้อ |
| GET | `/orders/my` | Customer session; Order ของตนเอง |
| GET | `/admin/orders` | Admin session; Order ทั้งหมด |
| PATCH | `/admin/orders/:id/status` | Admin session; `{status}` |
| GET | `/admin/customers` | Admin session; ลูกค้า role `user` |
| PUT | `/admin/customers/:id` | Admin session; แก้ `{username, avatar}` |
| PATCH | `/admin/customers/:id/status` | Admin session; `{isActive}` ระงับ/เปิดบัญชี |
| POST | `/reviews` | Customer session; รีวิวสินค้าได้เมื่อ Order เป็น `completed` |
| GET | `/reviews/product/:productId` | รีวิวที่แสดงอยู่ คะแนนเฉลี่ย และจำนวนรีวิว |
| GET | `/admin/reviews` | Admin session; รีวิวทั้งหมดรวมที่ถูกซ่อน |
| PATCH | `/admin/reviews/:id/visibility` | Admin session; `{isVisible}` |
| GET | `/lookbooks`, `/lookbooks/:id` | Lookbook ที่เปิดแสดง พร้อมข้อมูลสินค้า |
| GET, POST | `/admin/lookbooks` | Admin session; ดูทั้งหมด / เพิ่ม Lookbook |
| PUT | `/admin/lookbooks/:id` | Admin session; แก้ไข Lookbook |
| POST | `/uploads` | Admin session; อัปโหลด JPG/PNG/WebP/GIF ไม่เกิน 5 MB และจำกัด 30 ครั้งต่อ 15 นาที |
| GET | `/uploads/:id` | อ่านรูปสินค้าที่บันทึกใน GridFS |
| POST | `/recommend` | วิเคราะห์รูป Mix & Match ไม่เกิน 2 รูป และจำกัด 10 ครั้งต่อ 15 นาที |
| PATCH | `/admin/lookbooks/:id/status` | Admin Token; `{isActive}` ซ่อน/เปิดแสดง |
| GET | `/articles`, `/articles/:id` | บทความที่เผยแพร่แล้ว: รายการ / รายละเอียด |
| GET, POST | `/admin/articles` | Admin Token; ดูทั้งหมด / เพิ่มบทความ |
| PUT | `/admin/articles/:id` | Admin Token; แก้ไขบทความ |
| PATCH | `/admin/articles/:id/status` | Admin Token; `{isPublished}` เผยแพร่/ซ่อน |
| GET | `/users/me/size-profile` | Customer Token; อ่านข้อมูล Size & Fit ของตนเอง |
| PUT | `/users/me/size-profile` | Customer Token; บันทึกสัดส่วนพร้อม Consent |
| DELETE | `/users/me/size-profile` | Customer Token; ลบข้อมูลสัดส่วนของตนเอง |

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

### เพิ่ม / แก้ Lookbook

```json
{
  "lookbookId": "LOOK-011",
  "name": "Sunday Brunch",
  "nameTh": "มื้อสายวันอาทิตย์",
  "concept": "ลุคสบายสำหรับวันหยุด",
  "occasion": ["Brunch", "Weekend"],
  "styleTags": ["casual", "relaxed"],
  "imageUrl": "/collection-2026/lookbook/look-11.png",
  "items": [
    {"product": "PRODUCT_MONGODB_ID", "defaultVariantSku": "TOP001-OW-S"}
  ],
  "regularPrice": 1480,
  "setPrice": 1290,
  "isActive": true
}
```

Server คำนวณ `saving` จาก `regularPrice - setPrice` และตรวจว่า Product กับ Variant SKU มีอยู่จริงก่อนบันทึก

### เพิ่ม / แก้บทความ

```json
{
  "title": "แต่งตัวให้เหมาะกับโอกาส",
  "excerpt": "แนวทางเลือกเสื้อผ้าสำหรับแต่ละงาน",
  "content": "เนื้อหาบทความแบบข้อความธรรมดา",
  "category": "Style Guide",
  "imageUrl": "/api/uploads/IMAGE_ID",
  "author": "OCCASION",
  "publishedAt": "2026-09-24",
  "isPublished": true
}
```

Admin อัปโหลดรูปผ่าน `POST /uploads` ได้เหมือนรูปสินค้า บทความที่ `isPublished=false` จะไม่ออกจาก Public API

## Personalized Size Profile API

`PUT /users/me/size-profile`

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
- ลูกค้าอ่าน แก้ไข และลบได้เฉพาะข้อมูลของตนเอง
- Admin Customer API ไม่ส่งข้อมูลสัดส่วนรายบุคคล
- หน้าสินค้าใช้ `size_chart` ก่อน หากไม่มีจะใช้เกณฑ์ S/M/L มาตรฐานและแสดงความมั่นใจระดับปานกลาง

## Cart API ที่เสนอ — ยังไม่มี Route

| Method | Path | Body |
|---|---|---|
| GET | `/cart` | — |
| POST | `/cart/items` | `{productId, variantId, quantity}` |
| PATCH | `/cart/items/:itemId` | `{quantity}` |
| DELETE | `/cart/items/:itemId` | — |

ใช้ Product/Variant `_id`; `itemId` คือรายการใน Cart Server ดึงเจ้าของจาก Token ตรวจ Variant, จำนวนเต็ม ≥ 1 และ Stock แล้วคำนวณราคาจาก MongoDB ผู้ใช้เข้าถึงได้เฉพาะ Cart ตนเอง

**ต้องตกลงก่อนเชื่อม:** Response ของ Cart และ Auth หลัก (`/auth` หรือ `/newuser`) ส่วน Product ยังต้องเพิ่ม Validation Tag/วันที่ผิดรูปแบบ
