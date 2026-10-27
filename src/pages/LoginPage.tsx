import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRESET_MEDIUM, PRESET_NORMAL, PRESET_SUSPICIOUS } from '../services/riskEngine';
import { api } from '../services/api';
import { RiskAssessmentResult } from '../services/types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail } = useAuth();

  const [email, setEmail] = useState('elena.rostova@enterprise.corp');
  const [password, setPassword] = useState('••••••••••••');
  const [demoPreset, setDemoPreset] = useState<'low' | 'medium' | 'high'>('low');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<RiskAssessmentResult | null>(null);

  // Verification Screens
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [showManualVerification, setShowManualVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [verificationNote, setVerificationNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePresetSelect = (preset: 'low' | 'medium' | 'high') => {
    setDemoPreset(preset);
    setErrorMsg(null);
    setSuccessMsg(null);
    setAssessmentResult(null);
    setShowManualVerification(false);
    setShowOtpScreen(false);
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
    setSuccessMsg(null);

    // Pick signals based on persona
    const signals =
      demoPreset === 'high'
        ? PRESET_SUSPICIOUS
        : demoPreset === 'medium'
        ? PRESET_MEDIUM
        : PRESET_NORMAL;

    // Send signals to FastAPI Backend / ML Random Forest Model
    const result = await api.evaluateRisk(signals);
    setAssessmentResult(result);

    // Save event to recent activity log
    await api.recordLoginEvent({
      userEmail: email,
      userName: email.split('@')[0].replace('.', ' '),
      ipAddress: signals.ipAddress,
      device: signals.browser || 'User Device',
      deviceStatus: signals.device,
      location: signals.locationName,
      locationStatus: signals.location,
      vpn: signals.vpn === 'yes',
      riskScore: result.risk_score,
      riskLevel: result.risk_level,
      decision: result.decision,
      failedAttempts: signals.failedAttempts,
      behaviour: signals.behaviour,
      loginTimeStatus: signals.loginTime,
      riskFactors: result.risk_factors,
    });

    setIsEvaluating(false);

    if (result.decision === 'BLOCK') {
      setErrorMsg(
        `High Risk Blocked (Score: ${result.risk_score}%). ${
          result.risk_factors.join(', ') || 'Anomalies detected'
        }.`
      );
      return;
    }

    if (result.decision === 'OTP') {
      setShowOtpScreen(true);
      return;
    }

    // LOW RISK -> Proceed directly to dashboard
    await loginWithEmail(email);
    navigate('/dashboard');
  };

  // OTP Handler for Medium Risk
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }
    await loginWithEmail(email);
    navigate('/dashboard');
  };

  // Manual Verification Handler for High Risk
  const handleSubmitManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityPin.trim()) {
      setErrorMsg('Please enter your 4-digit Security PIN or Employee ID.');
      return;
    }

    setIsEvaluating(true);

    // Record manual override in event log
    await api.recordLoginEvent({
      userEmail: email,
      userName: email.split('@')[0].replace('.', ' ') + ' (Manual Approved)',
      ipAddress: '127.0.0.1',
      device: 'Manual Verification Device',
      deviceStatus: 'trusted',
      location: 'Verified User Location',
      locationStatus: 'normal',
      vpn: false,
      riskScore: 0,
      riskLevel: 'LOW',
      decision: 'ALLOW',
      failedAttempts: 0,
      behaviour: 'normal',
      loginTimeStatus: 'normal',
      riskFactors: ['Manual Identity Verification Approved by Security Pin'],
    });

    setIsEvaluating(false);
    setSuccessMsg('Manual verification approved! Proceeding to dashboard...');

    setTimeout(async () => {
      await loginWithEmail(email);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] dark:bg-[#0F0F0F] text-[#111111] dark:text-[#F4F4F2] flex flex-col justify-between transition-colors">
      {/* Header */}
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
          to="/dashboard"
          className="text-xs font-semibold text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white"
        >
          Go to Dashboard
        </Link>
      </header>

      {/* Main Authentication Box */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* SCREEN 1: Standard Login Form */}
          {!showOtpScreen && !showManualVerification && (
            <>
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#F8F7F3] dark:bg-[#222222] text-[#111111] dark:text-[#E6C65C] flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold text-[#111111] dark:text-white">
                  User Login
                </h1>
                <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                  Test AI risk-based authentication with live backend signals.
                </p>
              </div>

              {/* Demo Persona Toggles */}
              <div className="mt-5 p-2 rounded-lg bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93] block mb-1.5 px-1">
                  Select Test Scenario
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
                    Medium Risk (OTP)
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
                    High Risk (Block)
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
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111111] dark:text-[#F4F4F2] mb-1">
                    Password
                  </label>
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

                {/* Error Banner for Blocked Logins */}
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 space-y-2">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>

                    {/* Manual Verification Option when High Risk is Blocked */}
                    {assessmentResult?.decision === 'BLOCK' && (
                      <div className="pt-2 border-t border-rose-200 dark:border-rose-900">
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMsg(null);
                            setShowManualVerification(true);
                          }}
                          className="w-full py-2 px-3 rounded-md bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Verify Identity Manually</span>
                        </button>
                      </div>
                    )}
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
                      <span>Evaluating Risk Score...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-[#E8E6DF] dark:border-[#262626] text-center">
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93] flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <span>Calculates risk score (0–100) using Random Forest model.</span>
                </p>
              </div>
            </>
          )}

          {/* SCREEN 2: OTP Verification for Medium Risk */}
          {showOtpScreen && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-200 dark:border-amber-900">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#111111] dark:text-white">
                  OTP Verification Required
                </h2>
                <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                  Medium Risk Score ({assessmentResult?.risk_score || 48}/100) detected. Please enter code to confirm.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111111] dark:text-white mb-1 text-center">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center text-xl font-mono tracking-widest py-2.5 px-3 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
                  />
                  <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93] mt-1 text-center">
                    Enter any 6 digits for testing demo
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#111111] text-white hover:bg-[#282828] dark:bg-[#E6C65C] dark:text-[#111111] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Verify Code & Continue
                </button>

                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  className="w-full text-center text-xs text-[#66635C] dark:text-[#9E9B93] hover:underline"
                >
                  Back to Login
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 3: Manual Verification for High Risk */}
          {showManualVerification && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-200 dark:border-rose-900">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#111111] dark:text-white">
                  Manual Identity Verification
                </h2>
                <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                  High Risk ({assessmentResult?.risk_score || 75}%) detected. Verify user identity manually to unlock access.
                </p>
              </div>

              {successMsg ? (
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 text-center flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitManualVerification} className="space-y-4 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#111111] dark:text-white mb-1">
                      Registered Security PIN or Employee ID
                    </label>
                    <input
                      type="password"
                      required
                      value={securityPin}
                      onChange={(e) => setSecurityPin(e.target.value)}
                      placeholder="e.g. 8899 or PIN"
                      className="w-full py-2.5 px-3 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
                    />
                    <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93] mt-1">
                      Enter any Security PIN (e.g. 8899) for manual verification demo.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111111] dark:text-white mb-1">
                      Reason / Verification Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={verificationNote}
                      onChange={(e) => setVerificationNote(e.target.value)}
                      placeholder="e.g. Identity verified via phone / corporate badge"
                      className="w-full py-2 px-3 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isEvaluating}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isEvaluating ? (
                      <Cpu className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    <span>Approve Manual Verification</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualVerification(false)}
                    className="w-full text-center text-xs text-[#66635C] dark:text-[#9E9B93] hover:underline"
                  >
                    Cancel and Return
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="px-6 py-4 border-t border-[#E8E6DF] dark:border-[#262626] text-center text-xs text-[#8A867E]">
        RiskAuthAI · Machine Learning Risk Authentication Project
      </footer>
    </div>
  );
};
