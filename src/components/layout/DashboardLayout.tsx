import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  ChevronRight,
  ExternalLink,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Sliders,
  Sun,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePageTitle?: string;
  activeBreadcrumb?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activePageTitle,
  activeBreadcrumb,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Login Events', path: '/events', icon: Activity },
    { name: 'Risk Analysis', path: '/analysis', icon: Sliders },
    { name: 'Security Alerts', path: '/alerts', icon: AlertOctagon, badge: 2 },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#0F0F0F] text-[#111111] dark:text-[#F4F4F2] flex">
      {/* Desktop Sidebar (Fixed left 260px) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#E8E6DF] dark:border-[#222222] bg-[#FFFFFF] dark:bg-[#141414] shrink-0 sticky top-0 h-screen justify-between transition-colors">
        <div>
          {/* Brand Wordmark */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#E8E6DF] dark:border-[#222222]">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#111111] text-[#E6C65C] dark:bg-[#E6C65C] dark:text-[#111111] flex items-center justify-center font-bold text-xs shadow-xs">
                <Shield className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-base font-bold tracking-tight text-[#111111] dark:text-white">
                RiskAuthAI
              </span>
            </Link>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F0EEE6] dark:bg-[#222222] text-[#66635C] dark:text-[#9E9B93]">
              Console
            </span>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#8A867E] dark:text-[#78756E]">
              Security Operations
            </div>

            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111]'
                      : 'text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white hover:bg-[#F0EEE6] dark:hover:bg-[#1F1F1F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Profile & Utilities */}
        <div className="p-3 border-t border-[#E8E6DF] dark:border-[#222222] space-y-2">
          {/* Quick simulator shortcut */}
          <Link
            to="/#risk-engine"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white rounded-lg hover:bg-[#F0EEE6] dark:hover:bg-[#1F1F1F]"
          >
            <span className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-[#E6C65C]" />
              Simulator Engine
            </span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white rounded-lg hover:bg-[#F0EEE6] dark:hover:bg-[#1F1F1F] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#E6C65C]" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}</span>
            </span>
            <span className="text-[10px] font-mono uppercase opacity-60">{theme}</span>
          </button>

          {/* Current User Card */}
          <div className="pt-2 border-t border-[#E8E6DF] dark:border-[#222222] flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#111111] text-[#E6C65C] dark:bg-[#282828] dark:text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser?.name?.charAt(0) || 'E'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#111111] dark:text-white truncate">
                  {currentUser?.name || 'Elena Rostova'}
                </p>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93] truncate">
                  {currentUser?.role || 'Security Admin'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-[#88857E] hover:text-rose-600 transition-colors rounded cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-[#E8E6DF] dark:border-[#222222] bg-[#FFFFFF]/80 dark:bg-[#141414]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Contextual Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-[#66635C] dark:text-[#9E9B93]">
              <Link to="/dashboard" className="hover:text-[#111111] dark:hover:text-white transition-colors">
                Console
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              <span className="font-semibold text-[#111111] dark:text-[#F4F4F2]">
                {activeBreadcrumb || activePageTitle || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Header Zone */}
          <div className="flex items-center gap-3">
            {/* Real-time ML Engine status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F0EEE6] dark:bg-[#1E1E1E] text-[11px] font-mono text-[#66635C] dark:text-[#9E9B93]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Risk Engine: Active</span>
            </div>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white px-2 py-1"
            >
              <span>Landing Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Link
              to="/settings"
              className="p-2 text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white rounded-lg hover:bg-[#F0EEE6] dark:hover:bg-[#1E1E1E]"
              title="Risk Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Scrim */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar content */}
            <div className="relative w-72 bg-white dark:bg-[#141414] h-full flex flex-col justify-between p-4 shadow-xl border-r border-[#E8E6DF] dark:border-[#222222]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF] dark:border-[#222222]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#111111] text-[#E6C65C] dark:bg-[#E6C65C] dark:text-[#111111] flex items-center justify-center font-bold text-xs">
                      <Shield className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="font-bold text-sm text-[#111111] dark:text-white">
                      RiskAuthAI
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 text-[#66635C] hover:text-[#111111]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg ${
                          isActive
                            ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111]'
                            : 'text-[#66635C] dark:text-[#9E9B93]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E6DF] dark:border-[#222222] space-y-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#66635C] dark:text-[#9E9B93]"
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#E6C65C]" /> : <Moon className="w-3.5 h-3.5" />}
                    <span>Theme: {theme}</span>
                  </span>
                </button>
                <Link
                  to="/"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="block px-3 py-2 text-xs text-[#66635C]"
                >
                  Back to Landing Page
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
