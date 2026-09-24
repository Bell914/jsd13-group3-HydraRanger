import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../services/authService';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await resetPassword({ token, password });
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {!isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">Reset Password</h2>
            <p className="text-xs text-secondary mb-6">
              Enter your new password below to reset your account password.
            </p>

            {error && <div className="mb-4 text-xs text-accent bg-accent/10 p-3 rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-slate-700/70 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
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

            <div className="mt-6">
              <Link to="/login" className="text-xs text-secondary hover:underline">
                ← Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">Password Reset Successful!</h2>
            <p className="text-xs text-secondary mb-6">
              Your password has been changed successfully.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-hover transition"
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
