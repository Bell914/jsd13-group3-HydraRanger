export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  UNPROCESSABLE_ENTITY: 422,
  BAD_GATEWAY: 502,
  INTERNAL_SERVER_ERROR: 500
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// 🚀 Welcome Coupon Configuration (5%)
export const WELCOME_COUPON = {
  CODE: "WELCOME5",
  DISCOUNT_PERCENT: 5,        // ส่วนลด 5%
  EXPIRES_IN_DAYS: 30,        // หมดอายุใน 30 วัน
  MIN_PURCHASE: 0,            // ยอดซื้อขั้นต่ำ
  MAX_USAGE_PER_USER: 1,      // 1 บัญชีใช้ได้ 1 ครั้ง
  ALLOW_COMBINE: false,       // ห้ามใช้ร่วมกับโปรโมชันอื่น
  APPLICABLE_PRODUCTS: "ALL", // ใช้ได้กับสินค้าทุกรายการในร้าน
  KPIS: [
    "New Member Conversion Rate (อัตราการซื้อหลังสมัครสมาชิก)",
    "Welcome Coupon Redemption Rate (อัตราการนำคูปองไปใช้จริง)",
    "New Customer Revenue (ยอดขายสุทธิจากลูกค้าใหม่)",
  ],
};
