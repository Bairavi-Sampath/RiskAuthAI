import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Shield, Sun, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard') ||
    location.pathname === '/events' ||
    location.pathname === '/analysis' ||
    location.pathname === '/alerts' ||
    location.pathname === '/users' ||
    location.pathname === '/settings';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F7F3]/90 dark:bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#E8E6DF] dark:border-[#262626] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark with clean icon */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2] hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-[#111111] text-[#E6C65C] dark:bg-[#E6C65C] dark:text-[#111111] flex items-center justify-center font-bold text-sm shadow-xs">
            <Shield className="w-4 h-4 fill-current" />
          </div>
          <span>RiskAuthAI</span>
        </Link>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
          <Link
            to="/"
            className="hover:text-[#111111] dark:hover:text-[#F4F4F2] transition-colors whitespace-nowrap"
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            className="hover:text-[#111111] dark:hover:text-[#F4F4F2] transition-colors whitespace-nowrap"
          >
            How It Works
          </a>
          <a
            href="/#features"
            className="hover:text-[#111111] dark:hover:text-[#F4F4F2] transition-colors whitespace-nowrap"
          >
            Features
          </a>
          <a
            href="/#risk-engine"
            className="hover:text-[#111111] dark:hover:text-[#F4F4F2] transition-colors whitespace-nowrap"
          >
            Risk Engine
          </a>
          <a
            href="/#faq"
            className="hover:text-[#111111] dark:hover:text-[#F4F4F2] transition-colors whitespace-nowrap"
          >
            FAQ
          </a>
        </nav>

        {/* Zone 3: Primary Actions + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            className="p-2 rounded-lg text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-[#F4F4F2] hover:bg-[#EFECE6] dark:hover:bg-[#1F1F1F] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#E6C65C]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Login or Dashboard link */}
          <Link
            to="/login"
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-[#111111] dark:text-[#F4F4F2] hover:text-[#E6C65C] dark:hover:text-[#E6C65C] transition-colors"
          >
            Sign In
          </Link>

          {/* Live Demo / Console CTA */}
          <Link
            to="/dashboard"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#111111] text-white hover:bg-[#262626] dark:bg-[#E6C65C] dark:text-[#111111] dark:hover:bg-[#D8B74A] transition-all shadow-xs whitespace-nowrap"
          >
            {isDashboard ? 'Security Console' : 'Live Demo'}
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="md:hidden p-2 text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-[#F4F4F2]"
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
            className="block text-sm font-medium text-[#111111] dark:text-[#F4F4F2] py-1.5"
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#66635C] dark:text-[#9E9B93] py-1.5"
          >
            How It Works
          </a>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#66635C] dark:text-[#9E9B93] py-1.5"
          >
            Features
          </a>
          <a
            href="/#risk-engine"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#66635C] dark:text-[#9E9B93] py-1.5"
          >
            Risk Engine
          </a>
          <a
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#66635C] dark:text-[#9E9B93] py-1.5"
          >
            FAQ
          </a>
          <div className="pt-2 border-t border-[#E8E6DF] dark:border-[#262626] flex items-center justify-between">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-[#111111] dark:text-[#F4F4F2]"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111]"
            >
              Security Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
