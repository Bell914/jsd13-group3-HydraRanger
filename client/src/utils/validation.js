export const validateRegisterForm = (formData) => {
  const errors = {};

  // ตรวจสอบชื่อ (Required)
  if (!formData.username?.trim()) {
    errors.username = 'กรุณากรอกชื่อผู้ใช้งาน';
  }

  // ตรวจสอบ Email
  if (!formData.email?.trim()) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  // ตรวจสอบ รหัสผ่าน
  if (!formData.password) {
    errors.password = 'กรุณากรอกรหัสผ่าน';
  } else if (formData.password.length < 6) {
    errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
  }

  // ตรวจสอบ ยืนยันรหัสผ่าน
  if (formData.confirmPassword !== undefined && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'รหัสผ่านยืนยันไม่ตรงกัน';
  }

  return errors;
};

export const validateForm = validateRegisterForm;