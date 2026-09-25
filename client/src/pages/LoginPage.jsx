import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, UserRound, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/Auth/useAuth.jsx";
import { Button, Card } from "../components/index.js";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <div
              className="mb-6 flex items-center gap-3 rounded-xl border border-accent/35 bg-accent/10 p-3.5 text-sm text-accent"
              role="alert"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-700/70 text-sm text-black placeholder-slate-500 focus:outline-none focus:ring-primary focus:ring-1 focus:border-primary transition-all"
                placeholder="customer@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1.5">
                Password
              </label>
              {/* 2. หุ้มด้วย relative เพื่อวางปุ่มไอคอนทับด้านขวา */}
              <div className="relative">
                <input
                  // 3. สลับ type ตาม state showPassword และใส่ pr-10 เว้นพื้นที่ไม่ให้ข้อความทับไอคอน
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-slate-700/70 text-sm text-black placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                {/* 4. เพิ่มปุ่มสลับการมองเห็นรหัสผ่าน */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="rounded-sm text-xs font-semibold text-accent hover:text-accent-hover hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              icon={LogIn}
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 border-t border-occasion-border/45 pt-5 text-center text-xs text-secondary">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="rounded-sm font-semibold text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/45"
            >
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
