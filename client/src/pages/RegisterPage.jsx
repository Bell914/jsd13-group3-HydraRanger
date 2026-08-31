import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Shield, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService.js';
import { Button, Card, FormInput } from '../components/index.js';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Create an account to start contributing to Sprint 2
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
            id="register-username"
            label="Username"
            type="text"
            placeholder="e.g. ranger01"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <FormInput
            id="register-email"
            label="Email Address"
            type="email"
            placeholder="customer@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <FormInput
            id="register-password"
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <FormInput
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          <Button
            type="submit"
            variant="primary"
            icon={UserPlus}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 border-t border-occasion-border/45 pt-5 text-center text-xs text-secondary">
          Already have an account?{' '}
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
