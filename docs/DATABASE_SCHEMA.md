# OCCASION Database

ใช้ MongoDB ผ่าน Mongoose ฟิลด์ใช้ `camelCase`

## Model ที่มีในโค้ด

| Model | ฟิลด์หลัก |
|---|---|
| User | username, email, password, role, avatar |
| Product | productId, name, description, category, gender, tags[], availableDate, imageUrl, variants[], isActive |
| Lookbook | lookbookId, name, nameTh, concept, occasion[], styleTags[], imageUrl, items[], regularPrice, setPrice, saving, isActive |

ทุก Model ข้างต้นมี `_id`, `createdAt`, `updatedAt`

- **User:** username/email ไม่ซ้ำ; password เก็บแบบ hash; ผู้สมัครทั่วไปเป็น role `user`
- **Product:** `productId` เป็นรหัสธุรกิจไม่ซ้ำ; API ใช้ `_id`; ลบด้วย `isActive=false`
- **Variant:** เก็บใน `variants[]` อย่างน้อย 1 รายการ มี `_id`, sku, color, size, price, stockQuantity และข้อมูลเสริม colorCode, imageUrl, detailImages[]
- **Lookbook Item:** `product` อ้าง Product `_id`; `defaultVariantSku` ระบุ Variant
- **ข้อจำกัด:** Schema กำหนดราคา/Stock ≥ 0; API กำหนดราคา > 0 และ Stock เป็นจำนวนเต็ม มี unique index ที่ `variants.sku`; ต้องตรวจ SKU ซ้ำภายในสินค้าเพิ่มเติม

## Cart / Order ที่เสนอ — ยังไม่มี Model

| ส่วน | ฟิลด์ที่เสนอ |
|---|---|
| Cart | user อ้าง User, items[], createdAt, updatedAt |
| Cart Item | _id, product อ้าง Product, variantId, quantity |
| Order (หากทำ) | user, items พร้อมราคาตอนซื้อ, total, shippingAddress, status, purchasedAt |

Server ตรวจเจ้าของ Cart, Variant และ Stock; quantity เป็นจำนวนเต็ม ≥ 1 ราคาและยอดรวมมาจากฐานข้อมูล

ตกลง User Model หลักก่อนเชื่อม Cart เพราะ `/auth` และ `/newuser` ใช้คนละชุด ดูชื่อข้อมูลรับส่งใน [API_SPEC.md](API_SPEC.md)
