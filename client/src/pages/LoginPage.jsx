import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserRound, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService.js';
import { Button, Card } from '../components/index.js';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full py-8">
      <Card>
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 w-12 h-12 rounded-2xl inline-flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
            <UserRound size={24} className="text-slate-950 font-extrabold" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Customer Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Sign in to shop, save looks and manage your orders
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-3.5 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/70 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="customer@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/70 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            icon={LogIn}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
};
