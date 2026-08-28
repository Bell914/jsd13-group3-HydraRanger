import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserRound, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService.js';
import { Button, Card, FormInput } from '../components/index.js';

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
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/20">
            <UserRound size={24} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-primary">
            Customer Sign In
          </h2>
          <p className="mt-2 text-xs text-secondary sm:text-sm">
            Sign in to shop, save looks and manage your orders
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-accent/35 bg-accent/10 p-3.5 text-sm text-accent" role="alert">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="customer@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <FormInput
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

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

        <div className="mt-6 border-t border-occasion-border/45 pt-5 text-center text-xs text-secondary">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="rounded-sm font-semibold text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
          >
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
};
