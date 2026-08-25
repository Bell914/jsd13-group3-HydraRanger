# OCCASION — Sprint 2 MERN E-commerce Application

OCCASION เป็นเว็บไซต์ E-commerce แฟชั่นแบบ Unisex ที่ช่วยให้ลูกค้าค้นหา เลือกซื้อ และจับคู่เสื้อผ้าผ่าน Lookbook / Mix & Match

Repository นี้มีไว้สำหรับ Sprint 2 โดยพัฒนาต่อยอดจาก Static HTML Prototype ใน Sprint 1 ไปเป็น MERN Stack Application

> Junior Software Developer Bootcamp — Batch 13

## Sprint 1 Repository

Sprint 1 Prototype:

```text
https://github.com/pathsharasakon-ws/group-project-3
```

Sprint 1 ประกอบด้วย:

- Business Model Canvas
- Use Case Diagram
- Entity-Relationship Diagram
- MongoDB Schema
- API Specification
- Wireframes
- Static HTML/CSS/JavaScript Prototype

## Sprint 2 Goal

เปลี่ยนส่วนสำคัญของเว็บไซต์จาก Static HTML เป็น React และทำให้ Product กับ Cart เชื่อมต่อ Express, Mongoose และ MongoDB

เมื่อจบ Sprint 2:

- Product, Product List, Cart และ Checkout สร้างด้วย React
- Admin ดู เพิ่ม แก้ไข และลบสินค้าได้
- ลูกค้าดู เพิ่ม แก้จำนวน และลบสินค้าใน Cart ได้
- Product Form ตรวจข้อมูลก่อนบันทึก
- ระบบแสดงข้อความที่เข้าใจง่ายเมื่อข้อมูลไม่ถูกต้อง
- Product และ Cart บันทึกใน MongoDB จริง
- สมาชิกอธิบาย Flow และโค้ดที่รับผิดชอบได้

## Team Members

| Name | Role | Feature Ownership |
|---|---|---|
| Nae | Team Leader | Product/Lookbook Mock Data, Admin, Integration และ Demo |
| Mos | Technical Setup / Frontend | React, Express, MongoDB Setup, Shared Layout และ Lookbook React |
| BM | Product Developer | Product Model, Product API, Product Card, List และ Detail |
| Bird | Cart Developer | Cart Model, Cart API, Cart และ Checkout |
| LukNok | User Developer | Authentication UI, Profile, Form Validation และ Testing |

Feature Owner รับผิดชอบให้ Flow ทำงานสำเร็จ แต่สามารถขอ Pair Programming และ Review จากสมาชิกได้

## Technology

### Frontend

- React
- React Router
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express
- Mongoose

### Database

- MongoDB

### Collaboration

- Git
- GitHub
- Trello
- Pull Requests
- Code Review

## System Architecture

```text
React + Tailwind CSS
          |
        Axios
          |
          v
Node.js + Express
          |
       Mongoose
          |
          v
       MongoDB
```

## Sprint 2 Required Features

### Product

- Product Card
- Product List
- Product Detail
- Product Variants
- Color and Size Selection
- Product CRUD
- Product Form Validation

### Cart

- Read Cart
- Add Cart Item
- Update Cart Item Quantity
- Delete Cart Item
- Stock Validation
- Subtotal and Total

### Checkout

- Cart Summary
- Shipping Information
- Order Summary
- Simulated Payment

### Admin

- Product List
- Create Product
- Update Product
- Delete Product
- Variant and Stock Management

## Product Data

Sprint 2 starts with:

- 5 Unisex Tops
- 5 Unisex Bottoms
- 2 Colors per Product
- Sizes S, M and L
- 6 Variants per Product
- 10 Lookbook Looks

Product example:

```js
{
  name: "Oversized T-Shirt",
  description: "เสื้อยืดทรง Oversized",
  category: "tops",
  gender: "unisex",
  tags: ["casual", "minimal"],
  imageUrl: "/images/products/oversized-tshirt-white.jpg",
  variants: [
    {
      sku: "TOP-001-WHT-S",
      color: "white",
      size: "S",
      price: 590,
      stockQuantity: 10
    }
  ]
}
```

Add-to-Cart data:

```js
{
  productId: "PRODUCT_ID",
  variantId: "VARIANT_ID",
  quantity: 1
}
```

Backend must retrieve the actual Price and Stock from MongoDB.

## Project Structure

```text
group-project-3-sprint-2/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── routes/
│       ├── App.jsx
│       └── main.jsx
├── server/
│   └── src/
│       ├── config/
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       ├── validators/
│       ├── data/
│       ├── scripts/
│       ├── app.js
│       └── server.js
├── docs/
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

## Getting Started

The setup commands must be verified after the React and Express setup is merged.

### Prerequisites

- Node.js
- npm
- Git
- MongoDB or MongoDB Atlas

### Clone

```bash
git clone <sprint-2-repository-url>
cd group-project-3-sprint-2
```

### Client

```bash
cd client
npm install
npm run dev
```

### Server

Open another Terminal:

```bash
cd server
npm install
npm run dev
```

### Environment Variables

Copy the example file:

```text
server/.env.example
```

Create:

```text
server/.env
```

Example:

```env
PORT=5000
MONGODB_URI=
CLIENT_URL=http://localhost:5173
```

Never commit `.env`.

### Health Check

After starting the Server, open:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is running"
}
```

## API Endpoints

### Products

```text
GET    /api/products
GET    /api/products/:productId
POST   /api/products
PUT    /api/products/:productId
DELETE /api/products/:productId
```

### Cart

```text
GET    /api/users/:userId/cart
POST   /api/users/:userId/cart/items
PUT    /api/users/:userId/cart/items/:itemId
DELETE /api/users/:userId/cart/items/:itemId
```

API endpoints may be refined during Sprint 2, but Frontend and Backend must follow the same agreed contract.

## Git Workflow

```text
main
  ↑
develop
  ↑
feature/<task-name>
```

Rules:

- Do not commit directly to `main`
- Do not commit directly to `develop`
- Create Feature Branches from the latest `develop`
- Open Pull Requests into `develop`
- Require at least one Reviewer
- Test before merging

Read [CONTRIBUTING.md](CONTRIBUTING.md) before starting work.

## Sprint 2 Progress

### Setup

- [ ] React and Tailwind CSS
- [ ] React Router
- [ ] Shared Layout
- [ ] Express Server
- [ ] MongoDB and Mongoose
- [ ] Environment Variables
- [ ] Health Check

### Product

- [ ] Product Mock Data
- [ ] Product Images
- [ ] Product Model
- [ ] Product API
- [ ] Product Card
- [ ] Product List
- [ ] Product Detail
- [ ] Variant Selection

### Admin

- [ ] Admin Product List
- [ ] Product Form
- [ ] Create Product
- [ ] Update Product
- [ ] Delete Product

### Cart and Checkout

- [ ] Cart Model
- [ ] Cart API
- [ ] Cart React Components
- [ ] Add to Cart
- [ ] Update Quantity
- [ ] Remove Cart Item
- [ ] Cart Summary
- [ ] Checkout

### Integration

- [ ] Product-to-Cart Integration
- [ ] MongoDB CRUD Testing
- [ ] Form Validation Testing
- [ ] Error State Testing
- [ ] Sprint Demo

## Documentation

Project documents are stored in:

```text
docs/
├── api-spec/
├── er-diagram/
├── schema/
├── usecase/
└── wireframes/
```

## Educational Use

This project is created for educational purposes.

Third-party Product Images should be treated as temporary references unless the team has permission to use them. Before public deployment, replace them with original, licensed, royalty-free or generated images.
