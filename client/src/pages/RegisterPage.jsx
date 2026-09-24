import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
      navigate("/");
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              placeholder="At least 8 characters"
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
