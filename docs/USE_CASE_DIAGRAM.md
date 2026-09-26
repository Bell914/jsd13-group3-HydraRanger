# OCCASION Use Case Diagram — Sprint 3

เอกสารนี้แสดงขอบเขตที่มีในระบบปัจจุบัน ใช้ร่วมกับ [API Specification](API_SPEC.md) และ [Database Schema](DATABASE_SCHEMA.md)

```mermaid
flowchart LR
    Guest((Guest))
    Customer((Customer))
    Admin((Admin))
    SMTP[(SMTP)]
    Stripe[(Stripe)]
    Gemini[(Gemini)]

    subgraph Public[Public Shopping]
      Browse[ดูสินค้า Lookbook และบทความ]
      Register[สมัครและเข้าสู่ระบบ]
      Reset[ขอเปลี่ยนรหัสผ่าน]
      Mix[Mix & Match จากรูปเสื้อผ้า]
    end

    subgraph Member[Customer Account]
      Profile[จัดการ Profile และที่อยู่]
      SizeProfile[บันทึกหรือลบ Size Profile พร้อม Consent]
      Recommend[รับคำแนะนำไซส์และตรวจ Stock ตามสี]
      Favorite[บันทึก Favorite Lookbook]
      Checkout[Cart ฝั่ง Client และ Checkout]
      Order[ดูหรือยกเลิก Order ของตนเอง]
      Coupon[ตรวจและใช้ Coupon]
    end

    subgraph Backoffice[Admin Management]
      Dashboard[ดู Dashboard และ Notifications]
      Products[เพิ่ม แก้ ซ่อน Product Variant Stock และ Size Chart]
      Orders[ตรวจและเปลี่ยนสถานะ Order]
      Customers[แก้ข้อมูลหรือระงับ Customer]
      Content[จัดการ Lookbook และ Article]
      Coupons[เพิ่ม แก้ เปิดหรือปิด General Coupon]
      Upload[อัปโหลดรูปเข้า GridFS]
    end

    Guest --> Browse
    Guest --> Register
    Guest --> Reset --> SMTP
    Guest --> Mix --> Gemini
    Customer --> Browse
    Customer --> Profile
    Customer --> SizeProfile --> Recommend
    Customer --> Favorite
    Customer --> Checkout --> Stripe
    Customer --> Order
    Customer --> Coupon --> Checkout
    Admin --> Dashboard
    Admin --> Products
    Admin --> Orders
    Admin --> Customers
    Admin --> Content
    Admin --> Coupons
    Admin --> Upload
```

## ขอบเขตที่ไม่รวม

- Cart ไม่มี model หรือ CRUD API ฝั่ง Server
- Review ถูกถอดออกจากระบบ
- Shipping provider และ Audit Log ไม่มี integration ในระบบปัจจุบัน
- Security เช่น authentication, role authorization, validation, CORS, rate limit และ upload signature เป็นเงื่อนไขกำกับทุก use case ที่เกี่ยวข้อง

Use Case Diagram และ ERD ของ Sprint 1 เก็บเป็นหลักฐานแนวคิดเดิมแยกต่างหาก ไม่ควรใช้แทนสถานะ implementation ของ Sprint 3
