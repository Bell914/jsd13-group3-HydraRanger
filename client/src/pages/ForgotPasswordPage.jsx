import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { forgotPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Form, 2: Check Email Notice
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ยิง API ขอ Reset Password Link ไปยัง Backend
  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // เรียกใช้ authService ยิง API ส่งอีเมล
      await forgotPassword(email.trim());

      // สำเร็จ -> เปลี่ยนไป Step 2 แสดงข้อความแจ้งเตือนให้เช็กอีเมล
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {/* Step 1: กรอกอีเมลรับ ลิงก์รีเซ็ตรหัสผ่าน */}
        {step === 1 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">Forgot Password?</h2>
            <p className="text-xs text-secondary mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-4 flex items-center justify-center gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendResetLink} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-semibold text-black mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youremail@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-700/70 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-hover transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sending Request...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs text-secondary hover:underline">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: แจ้งเตือนให้ตรวจสอบอีเมล */}
        {step === 2 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">Check Your Email</h2>
            <p className="text-xs text-secondary mb-6">
              If an account with <span className="font-semibold text-black">{email}</span> exists, we have sent a password reset link to your email address. Please check your inbox.
            </p>

            <Link
              to="/login"
              className="block w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition text-sm mb-4"
            >
              Back to Sign In
            </Link>

            <p className="text-xs text-secondary">
              Didn't receive the email?{' '}
              <button
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
                className="text-accent underline font-semibold cursor-pointer"
              >
                Resend link
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}