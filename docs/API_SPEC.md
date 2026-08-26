# 📖 REST API Specification — OCCASION Backend

Customer และ Admin ใช้หน้าเว็บและ Login endpoint แยกกัน โดยใช้ฐานข้อมูล User ร่วมกัน
แต่ Backend เป็นผู้ตรวจสอบ role

Base URL: `http://localhost:5000/api`

---

## 🔐 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **Path**: `/auth/register`
- **Auth Required**: No
- **Request Body**:
```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "SecurePassword123!"
}
```

Public registration always creates role user. The API ignores client-supplied role values.
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "role": "user",
      "createdAt": "2026-08-24T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 Login User
- **Method**: `POST`
- **Path**: `/auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "johndoe@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 Get Current User Profile (Me)
- **Method**: `GET`
- **Path**: `/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "username": "johndoe",
    "email": "johndoe@example.com",
    "role": "user"
  }
}
```

### 1.4 Login Admin
- **Method**: `POST`
- **Path**: `/admin/auth/login`
- **Auth Required**: No
- **Rule**: รับเฉพาะบัญชีที่มี role เป็น admin

### 1.5 Get Current Admin
- **Method**: `GET`
- **Path**: `/admin/auth/me`
- **Auth Required**: Yes (`Bearer <admin-token>`)
- **Rule**: Token ต้องมี role เป็น admin

---

## 👥 2. User Management Endpoints

### 2.1 Get All Users
- **Method**: `GET`
- **Path**: `/users`
- **Auth Required**: Admin only (`Bearer <admin-token>`)
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "role": "user"
    }
  ]
}
```

### 2.2 Get User by ID
- **Method**: `GET`
- **Path**: `/users/:id`
- **Auth Required**: Admin หรือเจ้าของบัญชีเท่านั้น

---

## 📦 3. Items / Resources Endpoints (CRUD)

### 3.1 Get All Items
- **Method**: `GET`
- **Path**: `/items`
- **Query Parameters**:
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
  - `category` (optional)
  - `search` (optional)
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 3,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "data": [
    {
      "id": "item-101",
      "title": "OCCASION Item Manager",
      "description": "Task management module for Sprint 2",
      "category": "Development",
      "status": "In Progress",
      "priority": "High",
      "createdBy": "johndoe",
      "createdAt": "2026-08-24T10:30:00.000Z"
    }
  ]
}
```

### 3.2 Create New Item
- **Method**: `POST`
- **Path**: `/items`
- **Auth Required**: Yes (`Bearer <token>`)
- **Request Body**:
```json
{
  "title": "OCCASION Item Manager",
  "description": "Task management module for Sprint 2",
  "category": "Development",
  "status": "In Progress",
  "priority": "High"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": "item-101",
    "title": "OCCASION Item Manager",
    "description": "Task management module for Sprint 2",
    "category": "Development",
    "status": "In Progress",
    "priority": "High",
    "createdAt": "2026-08-24T10:30:00.000Z"
  }
}
```

### 3.3 Get Item by ID
- **Method**: `GET`
- **Path**: `/items/:id`
- **Auth Required**: No

### 3.4 Update Item
- **Method**: `PUT` / `PATCH`
- **Path**: `/items/:id`
- **Auth Required**: Yes (`Bearer <token>`)

### 3.5 Delete Item
- **Method**: `DELETE`
- **Path**: `/items/:id`
- **Auth Required**: Yes (`Bearer <token>`)
