import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Shield, AlertCircle, Eye, EyeOff, CheckCircle2, Mail, Tag, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService.js';
import { useAuth } from '../context/Auth/useAuth.jsx';
import { Button, Card, FormInput } from '../components/index.js';
import { validateForm } from '../utils/validation.js';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // 1. เพิ่ม State สำหรับเปิด-ปิดรหัสผ่านทั้ง 2 ช่อง
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      setIsSuccess(true);
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto w-full py-12 px-4">
        <Card className="text-center p-8 border border-emerald-100 shadow-xl bg-white">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            สมัครสมาชิกสำเร็จ!
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            ยินดีต้อนรับคุณ <span className="font-semibold text-gray-900">{formData.username}</span> สู่ครอบครัว OCCASION
          </p>

          {/* Welcome Coupon Card Notification */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-dashed border-rose-300 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-1">
              <Tag size={16} />
              <span>ของขวัญต้อนรับสมาชิกใหม่</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              รับส่วนลด <b>5%</b> สำหรับการสั่งซื้อครั้งแรกของคุณ
            </p>
            <div className="bg-white rounded-lg p-3 border border-rose-200 flex items-center justify-between">
              <span className="font-mono font-bold text-rose-600 text-lg tracking-wider">
                WELCOME5
              </span>
              <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2 py-1 rounded">
                ลด 5%
              </span>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
              <Mail size={14} className="shrink-0 mt-0.5 text-gray-400" />
              <span>
                เราได้ส่งรายละเอียดโค้ดไปยัง <b className="text-gray-700">{formData.email}</b> แล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="primary"
              icon={ArrowRight}
              onClick={() => navigate("/")}
              className="w-full justify-center"
            >
              เริ่มช้อปปิ้งเลย
            </Button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors py-1"
            >
              ดูข้อมูลโปรไฟล์และคูปองของฉัน
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full py-8">
      <Card>
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
            <Shield size={24} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-primary">
            Join <span className="text-accent">OCCASION</span>
          </h2>
          <p className="mt-2 text-xs text-secondary sm:text-sm">
            Create an account
          </p>
        </div>

        {apiError && (
          <div
            className="mb-6 flex items-center gap-3 rounded-xl border border-accent/35 bg-accent/10 p-3.5 text-sm text-accent"
            role="alert"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="register-username"
            name="username"
            label="Username"
            type="text"
            placeholder="e.g. ranger01"
            value={formData.username}
            onChange={handleChange}
            error={fieldErrors.username}
          />

          <FormInput
            id="register-email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="customer@example.com"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
          />

          {/* 2. ช่อง Password: สลับ type ตาม State showPassword */}
          <div className="relative">
            <FormInput
              id="register-password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-slate-500 hover:text-black focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* 3. ช่อง Confirm Password: สลับ type ตาม State showConfirmPassword */}
          <div className="relative">
            <FormInput
              id="register-confirm-password"
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-slate-500 hover:text-black focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            icon={UserPlus}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 border-t border-occasion-border/45 pt-5 text-center text-xs text-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="rounded-sm font-semibold text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
          >
            Sign in here
          </Link>
        </div>
      </Card>
    </div>
  );
};