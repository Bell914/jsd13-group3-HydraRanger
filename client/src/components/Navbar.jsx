import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Home, LogIn, UserPlus, LogOut } from 'lucide-react';
import { authService } from '../services/authService.js';
import { Button } from './Button.jsx';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
            <Shield size={20} className="text-slate-950 font-extrabold" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-white">
              Hydra<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Ranger</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Sprint 2
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-150 ${
              isActive('/') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home size={18} />
            Home
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-150 ${
              isActive('/dashboard') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{user?.username || 'HydraUser'}</span>
              </div>
              <Button
                variant="danger"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" icon={LogIn}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={UserPlus}>
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
