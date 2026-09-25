export const validateRegisterForm = (formData) => {
  const errors = {}; // ตรวจสอบชื่อผู้ใช้งาน

  if (!formData.username?.trim()) {
    errors.username = "กรุณากรอกชื่อผู้ใช้งาน";
  } // ตรวจสอบ อีเมล

  if (!formData.email?.trim()) {
    errors.email = "กรุณากรอกอีเมล";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  } // ตรวจสอบ รหัสผ่าน

  if (!formData.password) {
    errors.password = "กรุณากรอกรหัสผ่าน";
  } else if (formData.password.length < 8) {
    errors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }

  // ตรวจสอบการยืนยันรหัสผ่าน
  if (!formData.confirmPassword) {
    errors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
  }

  return errors;
};

export const validateForm = validateRegisterForm;
