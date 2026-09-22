import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { forgotPassword, resetPassword } from '../services/authService';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Form, 2: Check Email, 3: Set New, 4: Success
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Step 1: ส่งคำขอ Reset Link ไปยัง Backend
  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // เรียกใช้ authService ยิง API ขอรีเซ็ตรหัสผ่าน
      await forgotPassword(email);

      // ยิงสำเร็จ ให้เปลี่ยนไปหน้าแจ้งเตือนเช็กอีเมล
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: ตั้งรหัสผ่านใหม่
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // เรียกใช้ authService ส่งรหัสผ่านใหม่ไปอัปเดต
      await resetPassword({ password: newPassword });

      // รีเซ็ตสำเร็จ ไป Step 4
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* Step 1: Forgot Password? */}
        {step === 1 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">Forgot Password?</h2>
            <p className="text-xs text-secondary mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && <div className="mb-4 text-xs text-accent bg-accent/10 p-3 rounded-xl">{error}</div>}

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
                className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-hover transition disabled:opacity-50"
              >
                {loading ? 'Sending Request...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6">
              <Link to="/login" className="text-xs text-secondary hover:underline">
                ← Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Check Your Email */}
        {step === 2 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">Check Your Email</h2>
            <p className="text-xs text-secondary mb-6">
              We have sent a password reset link to your email address <span className="font-semibold text-black">{email}</span>. Please check your inbox.
            </p>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-hover transition mb-4"
            >
              Open Reset Link
            </button>

            <p className="text-xs text-secondary">
              Didn't receive the email?{' '}
              <button onClick={() => setStep(1)} className="text-accent underline font-semibold">
                Resend link
              </button>
            </p>
          </div>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-primary mb-2">Set New Password</h2>
            <p className="text-xs text-secondary mb-6">
              Your new password must be different from previously used passwords.
            </p>

            {error && <div className="mb-4 text-xs text-accent bg-accent/10 p-3 rounded-xl">{error}</div>}

            <form onSubmit={handleResetPassword} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-slate-700/70 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-slate-700/70 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-hover transition disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Password Reset Successful! */}
        {step === 4 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">Password Reset Successful!</h2>
            <p className="text-xs text-secondary mb-6">
              Your password has been changed successfully. You can now log in with your new password.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-hover transition"
            >
              Back to Log In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}