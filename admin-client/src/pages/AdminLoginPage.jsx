import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/useAdminAuth.js';

function validateLogin(credentials) {
  const errors = {};

  if (!credentials.email.trim()) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!credentials.email.includes('@')) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  if (!credentials.password) {
    errors.password = 'กรุณากรอกรหัสผ่าน';
  }

  return errors;
}

export function AdminLoginPage() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateCredential(event) {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function submitLogin(event) {
    event.preventDefault();
    const validationErrors = validateLogin(credentials);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      await login(credentials);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand-mark"><LockKeyhole size={26} /></div>
        <p className="eyebrow">BACK-OFFICE ADMIN</p>
        <h1>OCCASION Admin</h1>
        <p className="muted">สำหรับผู้ดูแลระบบเท่านั้น</p>
        {apiError && <p className="error" role="alert">{apiError}</p>}
        <form onSubmit={submitLogin} noValidate>
          <label>Admin email</label>
          <input name="email" type="email" autoComplete="username" value={credentials.email} onChange={updateCredential} aria-invalid={Boolean(errors.email)} />
          {errors.email && <small className="field-error">{errors.email}</small>}
          <label>Password</label>
          <div className="password-field">
            <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={credentials.password} onChange={updateCredential} aria-invalid={Boolean(errors.password)} />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} aria-pressed={showPassword}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              <span>{showPassword ? 'ซ่อน' : 'แสดง'}</span>
            </button>
          </div>
          {errors.password && <small className="field-error">{errors.password}</small>}
          <button type="submit" disabled={loading}>{loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ Admin'}</button>
        </form>
      </section>
    </main>
  );
}
