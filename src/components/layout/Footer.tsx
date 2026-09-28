import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#111111] text-[#9E9B93] border-t border-[#262626] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-base font-bold text-white tracking-tight">
              <div className="w-7 h-7 rounded-lg bg-[#E6C65C] text-[#111111] flex items-center justify-center font-bold text-xs">
                <Shield className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>RiskAuthAI</span>
            </Link>
            <p className="text-xs text-[#88857E] max-w-sm leading-relaxed">
              AI-Powered Risk-Based Authentication System using machine learning for suspicious login detection.
              Transforms static username and password gates into adaptive, contextual security decisions.
            </p>
            <div className="text-[11px] font-mono text-[#77746D]">
              FASTAPI & ML INTEGRATION READY ARCHITECTURE
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Navigation
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#risk-engine" className="hover:text-white transition-colors">
                  Live Risk Engine
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Security Capabilities
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Technical FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Console Links */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Security Console
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Security Dashboard
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Login Events Ledger
                </Link>
              </li>
              <li>
                <Link to="/analysis" className="hover:text-white transition-colors">
                  Risk Analysis Engine
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-white transition-colors">
                  Security Alerts Queue
                </Link>
              </li>
              <li>
                <Link to="/users" className="hover:text-white transition-colors">
                  User Directory
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-white transition-colors">
                  Risk Threshold Policies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#66635C]">
          <p>© {new Date().getFullYear()} RiskAuthAI. All rights reserved. Adaptive Risk-Based Authentication.</p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>SOC 2 Type II Compliant Architecture</span>
            <span>·</span>
            <span>Zero-Trust Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
