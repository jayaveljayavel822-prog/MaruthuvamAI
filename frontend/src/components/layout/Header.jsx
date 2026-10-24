import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Activity,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  Compass,
  Link2,
  Bot,
  HeartPulse,
  LogOut,
  Menu,
  X,
  Globe,
  User as UserIcon,
} from 'lucide-react';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Activity },
    { path: '/triage', label: t('triage'), icon: AlertTriangle },
    { path: '/profile', label: t('profile'), icon: UserIcon },
    { path: '/records', label: t('records'), icon: FileText },
    { path: '/reminders', label: t('reminders'), icon: Clock },
    { path: '/appointments', label: t('appointments'), icon: Calendar },
    { path: '/nearby', label: t('nearby'), icon: Compass },
    { path: '/abha', label: t('abha'), icon: Link2 },
    { path: '/carehub', label: t('careHub'), icon: HeartPulse },
    { path: '/copilot', label: t('aiCopilot'), icon: Bot },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="text-2xl hb">🩺</span>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent">
                Maruthuvam.AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400 font-medium">
                {t('appSubtitle')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-2 scrollbar-none max-w-2xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Language Selector, User Badge & Logout */}
          <div className="flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center bg-slate-50 border border-pink-100 rounded-full px-2.5 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-pink-500 mr-1.5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-slate-700 font-medium outline-none cursor-pointer pr-1"
                aria-label="Select Interface Language"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native}
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-block text-xs font-semibold text-slate-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                  👤 {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:px-3 sm:py-1 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold shadow hover:opacity-95 transition-all"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Hamburger */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-pink-600"
                aria-label="Toggle navigation drawer"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-pink-100 px-4 pt-2 pb-4 space-y-1 animate-slideDown shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs font-medium ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                      : 'bg-pink-50/50 text-slate-700 hover:bg-pink-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
