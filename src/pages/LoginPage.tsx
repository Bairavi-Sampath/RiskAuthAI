import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { evaluateLoginRisk, PRESET_MEDIUM, PRESET_NORMAL, PRESET_SUSPICIOUS } from '../services/riskEngine';
import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail, loginAsDemoAdmin } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('elena.rostova@enterprise.corp');
  const [password, setPassword] = useState('••••••••••••');
  const [demoPreset, setDemoPreset] = useState<'low' | 'medium' | 'high'>('low');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePresetSelect = (preset: 'low' | 'medium' | 'high') => {
    setDemoPreset(preset);
    setErrorMsg(null);
    if (preset === 'low') {
      setEmail('elena.rostova@enterprise.corp');
    } else if (preset === 'medium') {
      setEmail('sofia.morales@enterprise.corp');
    } else {
      setEmail('david.okafor@enterprise.corp');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    setErrorMsg(null);

    // Simulate login signals based on preset or email
    const signals =
      demoPreset === 'high'
        ? PRESET_SUSPICIOUS
        : demoPreset === 'medium'
        ? PRESET_MEDIUM
        : PRESET_NORMAL;

    // Evaluate risk
    const assessment = await api.evaluateRisk(signals);

    // Record this login event in system audit logs
    await api.recordLoginEvent({
      userEmail: email,
      userName: email.split('@')[0].replace('.', ' '),
      ipAddress: signals.ipAddress,
      device: signals.browser || 'Corporate Device',
      deviceStatus: signals.device,
      location: signals.locationName,
      locationStatus: signals.location,
      vpn: signals.vpn === 'yes',
      riskScore: assessment.risk_score,
      riskLevel: assessment.risk_level,
      decision: assessment.decision,
      failedAttempts: signals.failedAttempts,
      behaviour: signals.behaviour,
      loginTimeStatus: signals.loginTime,
      riskFactors: assessment.risk_factors,
    });

    setIsEvaluating(false);

    if (assessment.decision === 'BLOCK') {
      setErrorMsg(
        `Login Blocked (Risk Score: ${assessment.risk_score}%). Automated perimeter lockout triggered due to suspicious location or relay ASN.`
      );
      return;
    }

    if (assessment.decision === 'OTP') {
      setShowOtpScreen(true);
      return;
    }

    // LOW RISK -> Proceed directly to dashboard
    await loginWithEmail(email);
    navigate('/dashboard');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }
    await loginWithEmail(email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#0F0F0F] text-[#111111] dark:text-[#F4F4F2] flex flex-col justify-between transition-colors">
      {/* Simple Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#E8E6DF] dark:border-[#262626]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#111111] text-[#E6C65C] dark:bg-[#E6C65C] dark:text-[#111111] flex items-center justify-center font-bold text-xs">
            <Shield className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-bold text-base text-[#111111] dark:text-white">
            RiskAuthAI
          </span>
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white"
        >
          Back to Overview
        </Link>
      </header>

      {/* Main Authentication Box */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] rounded-2xl p-6 sm:p-8 shadow-sm">
          {!showOtpScreen ? (
            <>
              {/* Top Lockup */}
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#F8F7F3] dark:bg-[#222222] text-[#111111] dark:text-[#E6C65C] flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold text-[#111111] dark:text-white">
                  Enterprise Authentication
                </h1>
                <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                  Sign in to your corporate or developer account.
                </p>
              </div>

              {/* Demo Persona Quick Toggles */}
              <div className="mt-5 p-2 rounded-lg bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93] block mb-1.5 px-1">
                  Simulation Test Personas
                </span>
                <div className="grid grid-cols-3 gap-1 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => handlePresetSelect('low')}
                    className={`py-1.5 px-2 rounded text-center transition-all cursor-pointer ${
                      demoPreset === 'low'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-[#66635C] hover:bg-white dark:hover:bg-[#2A2A2A]'
                    }`}
                  >
                    Low Risk (Allow)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect('medium')}
                    className={`py-1.5 px-2 rounded text-center transition-all cursor-pointer ${
                      demoPreset === 'medium'
                        ? 'bg-[#E6C65C] text-[#111111] font-semibold'
                        : 'text-[#66635C] hover:bg-white dark:hover:bg-[#2A2A2A]'
                    }`}
                  >
                    Medium (OTP)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect('high')}
                    className={`py-1.5 px-2 rounded text-center transition-all cursor-pointer ${
                      demoPreset === 'high'
                        ? 'bg-rose-600 text-white font-semibold'
                        : 'text-[#66635C] hover:bg-white dark:hover:bg-[#2A2A2A]'
                    }`}
                  >
                    High (Block)
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] dark:text-[#F4F4F2] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8A867E] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
                      placeholder="name@enterprise.corp"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#111111] dark:text-[#F4F4F2]">
                      Password
                    </label>
                    <span className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                      Mock Auth
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#8A867E] absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Error Banner if High Risk Blocked */}
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#111111] text-white hover:bg-[#282828] dark:bg-[#E6C65C] dark:text-[#111111] dark:hover:bg-[#D8B74A] font-semibold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <>
                      <Cpu className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Risk Signals...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Contextual Risk Evaluation Message */}
              <div className="mt-5 pt-4 border-t border-[#E8E6DF] dark:border-[#262626] text-center">
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93] flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <span>Your login is evaluated using contextual risk signals.</span>
                </p>
              </div>
            </>
          ) : (
            /* Adaptive Step-Up OTP Verification Screen */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-200 dark:border-amber-900">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#111111] dark:text-white">
                  Step-Up OTP Verification
                </h2>
                <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                  Medium risk detected (54%). Please confirm identity via 6-digit authentication code.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] dark:text-white mb-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="847291"
                    className="w-full text-center text-xl font-mono tracking-widest py-2.5 px-3 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
                  />
                  <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93] mt-1 text-center">
                    Enter any 6 digits for simulation demo
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#111111] text-white hover:bg-[#282828] dark:bg-[#E6C65C] dark:text-[#111111] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Verify & Proceed to Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  className="w-full text-center text-xs text-[#66635C] dark:text-[#9E9B93] hover:underline"
                >
                  Cancel and Try Different Account
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[#E8E6DF] dark:border-[#262626] text-center text-xs text-[#8A867E]">
        RiskAuthAI · AI-Powered Risk-Based Authentication System
      </footer>
    </div>
  );
};
