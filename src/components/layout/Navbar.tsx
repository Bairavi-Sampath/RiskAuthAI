import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Shield, Sun, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboard =
    location.pathname.startsWith('/dashboard') ||
    location.pathname === '/events' ||
    location.pathname === '/analysis' ||
    location.pathname === '/alerts' ||
    location.pathname === '/users' ||
    location.pathname === '/settings';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F7F3]/90 dark:bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#E8E6DF] dark:border-[#262626] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2] hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-[#111111] text-[#E6C65C] dark:bg-[#E6C65C] dark:text-[#111111] flex items-center justify-center font-bold text-sm shadow-xs">
            <Shield className="w-4 h-4 fill-current" />
          </div>
          <span>RiskAuthAI</span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
          <Link
            to="/"
            className="hover:text-[#111111] dark:hover:text-[#F4F4F2] transition-colors whitespace-nowrap"
          >
            Overview
          </Link>
          <Link
            to="/analysis"
            className="hover:text-[#111111] dark:hover:text-[#F4F4F2] transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E6C65C]" />
            <span>Risk Simulator</span>
          </Link>
          <Link
            to="/login"
            className="hover:text-[#111111] dark:hover:text-[#F4F4F2] transition-colors whitespace-nowrap"
          >
            Demo Login
          </Link>
          <Link
            to="/dashboard"
            className="hover:text-[#111111] dark:hover:text-[#F4F4F2] transition-colors whitespace-nowrap"
          >
            Security Console
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 rounded-lg text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-[#F4F4F2] hover:bg-[#EFECE6] dark:hover:bg-[#1F1F1F] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#E6C65C]" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            to="/login"
            className="hidden sm:inline-block px-3.5 py-1.5 text-xs font-semibold text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>

          <Link
            to="/dashboard"
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#111111] text-white hover:bg-[#282828] dark:bg-[#E6C65C] dark:text-[#111111] dark:hover:bg-[#D8B74A] transition-all shadow-xs whitespace-nowrap"
          >
            {isDashboard ? 'Console Overview' : 'Open Console'}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="md:hidden p-2 text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-[#F4F4F2] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E6DF] dark:border-[#262626] bg-[#F8F7F3] dark:bg-[#141414] px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase text-[#66635C] dark:text-[#9E9B93] py-2"
          >
            Overview
          </Link>
          <Link
            to="/analysis"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase text-[#66635C] dark:text-[#9E9B93] py-2"
          >
            Risk Simulator
          </Link>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase text-[#66635C] dark:text-[#9E9B93] py-2"
          >
            Demo Login
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase text-[#66635C] dark:text-[#9E9B93] py-2"
          >
            Security Console
          </Link>
        </div>
      )}
    </header>
  );
};
