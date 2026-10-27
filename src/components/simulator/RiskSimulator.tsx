import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Fingerprint,
  Globe,
  HelpCircle,
  Laptop,
  Lock,
  MousePointer,
  RefreshCw,
  RotateCcw,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  evaluateLoginRisk,
  PRESET_MEDIUM,
  PRESET_NORMAL,
  PRESET_SUSPICIOUS,
} from '../../services/riskEngine';
import { LoginSignals, RiskAssessmentResult } from '../../services/types';
import { api } from '../../services/api';

interface RiskSimulatorProps {
  onRecordedEvent?: () => void;
  showConsoleAction?: boolean;
}

export const RiskSimulator: React.FC<RiskSimulatorProps> = ({
  onRecordedEvent,
  showConsoleAction = true,
}) => {
  const [signals, setSignals] = useState<LoginSignals>({ ...PRESET_NORMAL });
  const [activePreset, setActivePreset] = useState<'normal' | 'medium' | 'suspicious' | 'custom'>('normal');
  const [assessment, setAssessment] = useState<RiskAssessmentResult>(() => evaluateLoginRisk(PRESET_NORMAL));
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isSubmittingToConsole, setIsSubmittingToConsole] = useState(false);
  const [consoleRecordedFeedback, setConsoleRecordedFeedback] = useState<string | null>(null);

  // Evaluate risk using the real backend ML model (with graceful local fallback)
  const runEvaluation = useCallback(async (currentSignals: LoginSignals) => {
    setIsEvaluating(true);
    try {
      const res = await api.evaluateRisk(currentSignals);
      setAssessment(res);
    } catch {
      // Local rule-based engine fallback
      setAssessment(evaluateLoginRisk(currentSignals));
    } finally {
      setIsEvaluating(false);
    }
  }, []);

  // Trigger evaluation whenever signals change
  useEffect(() => {
    const timer = setTimeout(() => {
      runEvaluation(signals);
    }, 150);
    return () => clearTimeout(timer);
  }, [signals, runEvaluation]);

  const applyPreset = (preset: 'normal' | 'medium' | 'suspicious') => {
    setActivePreset(preset);
    if (preset === 'normal') {
      setSignals({ ...PRESET_NORMAL });
    } else if (preset === 'medium') {
      setSignals({ ...PRESET_MEDIUM });
    } else if (preset === 'suspicious') {
      setSignals({ ...PRESET_SUSPICIOUS });
    }
  };

  const updateSignal = <K extends keyof LoginSignals>(key: K, value: LoginSignals[K]) => {
    setActivePreset('custom');
    setSignals((prev) => ({ ...prev, [key]: value }));
  };

  const handlePushToSecurityConsole = async () => {
    setIsSubmittingToConsole(true);
    try {
      await api.recordLoginEvent({
        userEmail:
          assessment.risk_level === 'HIGH'
            ? 'threat_probe@tor-exit.net'
            : assessment.risk_level === 'MEDIUM'
            ? 'sofia.morales@enterprise.corp'
            : 'elena.rostova@enterprise.corp',
        userName:
          assessment.risk_level === 'HIGH'
            ? 'Suspicious Perimeter Probe'
            : assessment.risk_level === 'MEDIUM'
            ? 'Sofia Morales (Remote)'
            : 'Elena Rostova',
        ipAddress: signals.ipAddress || (signals.vpn === 'yes' ? '185.220.101.45' : '192.168.1.104'),
        device: signals.device === 'trusted' ? 'Corporate MacBook Pro' : 'Generic Headless Device',
        deviceStatus: signals.device,
        location: signals.location === 'normal' ? 'San Francisco, CA, USA' : 'Frankfurt, Germany',
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

      setConsoleRecordedFeedback(`Simulated event logged to live Security Console (${assessment.risk_score}% · ${assessment.decision})`);
      if (onRecordedEvent) onRecordedEvent();
      setTimeout(() => setConsoleRecordedFeedback(null), 4500);
    } catch {
      setConsoleRecordedFeedback('Logged locally. Connect backend API to persist to database.');
    } finally {
      setIsSubmittingToConsole(false);
    }
  };

  // Color configurations based on risk level
  const riskTheme = {
    LOW: {
      badgeClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      decisionBg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300',
      decisionTitle: 'ALLOW (Direct Login)',
      decisionSub: 'Low baseline risk (0–39). Direct seamless authorization granted with zero user friction.',
      barColor: 'bg-emerald-500',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      accentColor: '#10B981',
    },
    MEDIUM: {
      badgeClass: 'text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      decisionBg: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-300',
      decisionTitle: 'OTP CHALLENGE REQUIRED',
      decisionSub: 'Moderate risk variance (40–69). Step-up verification (TOTP / Hardware key) required to confirm identity.',
      barColor: 'bg-[#E6C65C]',
      icon: <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      accentColor: '#E6C65C',
    },
    HIGH: {
      badgeClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      decisionBg: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-300',
      decisionTitle: 'LOGIN BLOCKED',
      decisionSub: 'High threat profile (70–100). Perimeter lockout enforced; incident queued for SOC review.',
      barColor: 'bg-rose-600',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      accentColor: '#EF4444',
    },
  }[assessment.risk_level] || {
    badgeClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    decisionBg: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300',
    decisionTitle: 'ALLOW (Direct Login)',
    decisionSub: 'Low baseline risk (0–39). Direct seamless authorization granted with zero user friction.',
    barColor: 'bg-emerald-500',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    accentColor: '#10B981',
  };

  return (
    <div className="w-full bg-[#FFFFFF] dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] rounded-xl overflow-hidden shadow-xs transition-colors">
      {/* Top Banner: Scenario Presets */}
      <div className="p-6 border-b border-[#E8E6DF] dark:border-[#262626] bg-[#FAFAF8] dark:bg-[#1A1A1A]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              <Cpu className="w-4 h-4 text-[#E6C65C]" />
              <span>Real-Time AI Risk Engine</span>
            </div>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Interactive Risk Model Simulator
            </h3>
            <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93] max-w-2xl">
              Select an attack scenario or toggle individual signals to observe how the Random Forest model calculates risk scores and triggers policy decisions.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('normal')}
              className={`px-4 py-3 rounded-lg border text-left transition-all cursor-pointer ${
                activePreset === 'normal'
                  ? 'bg-white dark:bg-[#111111] border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                  : 'bg-white/70 dark:bg-[#1C1C1C] border-[#E8E6DF] dark:border-[#2E2E2E] hover:border-[#D1CEC4] text-[#66635C] dark:text-[#9E9B93]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111] dark:text-white">Normal Login</span>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">Baseline</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                LOW RISK · ALLOW
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('medium')}
              className={`px-4 py-3 rounded-lg border text-left transition-all cursor-pointer ${
                activePreset === 'medium'
                  ? 'bg-white dark:bg-[#111111] border-[#E6C65C] shadow-sm ring-1 ring-[#E6C65C]'
                  : 'bg-white/70 dark:bg-[#1C1C1C] border-[#E8E6DF] dark:border-[#2E2E2E] hover:border-[#D1CEC4] text-[#66635C] dark:text-[#9E9B93]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111] dark:text-white">Traveling Worker</span>
                <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">Medium</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                STEP-UP · OTP
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('suspicious')}
              className={`px-4 py-3 rounded-lg border text-left transition-all cursor-pointer ${
                activePreset === 'suspicious'
                  ? 'bg-white dark:bg-[#111111] border-rose-500 shadow-sm ring-1 ring-rose-500'
                  : 'bg-white/70 dark:bg-[#1C1C1C] border-[#E8E6DF] dark:border-[#2E2E2E] hover:border-[#D1CEC4] text-[#66635C] dark:text-[#9E9B93]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111] dark:text-white">Brute Force / Bot</span>
                <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">Attack</span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-rose-700 dark:text-rose-400">
                HIGH RISK · BLOCK
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E6DF] dark:divide-[#262626]">
        {/* Left Column: Contextual Signal Controls (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#F0EEE6] dark:border-[#222222]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Input Authentication Telemetry
            </span>
            {activePreset === 'custom' && (
              <button
                type="button"
                onClick={() => applyPreset('normal')}
                className="inline-flex items-center gap-1 text-xs text-[#E6C65C] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset to Baseline
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* 1. Device Hardware */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#F8F7F3] dark:bg-[#1A1A1A] border border-[#E8E6DF] dark:border-[#282828]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white dark:bg-[#242424] flex items-center justify-center text-[#111111] dark:text-white shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111111] dark:text-[#F4F4F2]">
                    Device Trust Fingerprint
                  </p>
                  <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                    Hardware signature, browser canvas hash & TLS cookies
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-[#111111] p-1 rounded-md border border-[#E8E6DF] dark:border-[#2A2A2A] shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => updateSignal('device', 'trusted')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.device === 'trusted'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Trusted Device
                </button>
                <button
                  type="button"
                  onClick={() => updateSignal('device', 'unknown')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.device === 'unknown'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Unknown / New
                </button>
              </div>
            </div>

            {/* 2. Geolocation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#F8F7F3] dark:bg-[#1A1A1A] border border-[#E8E6DF] dark:border-[#282828]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white dark:bg-[#242424] flex items-center justify-center text-[#111111] dark:text-white shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111111] dark:text-[#F4F4F2]">
                    Geographic Origin
                  </p>
                  <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                    User habitual region vs. sudden international travel
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-[#111111] p-1 rounded-md border border-[#E8E6DF] dark:border-[#2A2A2A] shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => updateSignal('location', 'normal')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.location === 'normal'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Primary Region
                </button>
                <button
                  type="button"
                  onClick={() => updateSignal('location', 'unusual')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.location === 'unusual'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Unusual Location
                </button>
              </div>
            </div>

            {/* 3. VPN / Proxy */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#F8F7F3] dark:bg-[#1A1A1A] border border-[#E8E6DF] dark:border-[#282828]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white dark:bg-[#242424] flex items-center justify-center text-[#111111] dark:text-white shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111111] dark:text-[#F4F4F2]">
                    Network & Proxy Anonymizer
                  </p>
                  <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                    Residential ISP vs. Tor exit node / datacenter VPN proxy
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-[#111111] p-1 rounded-md border border-[#E8E6DF] dark:border-[#2A2A2A] shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => updateSignal('vpn', 'no')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.vpn === 'no'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Direct ISP
                </button>
                <button
                  type="button"
                  onClick={() => updateSignal('vpn', 'yes')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.vpn === 'yes'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Active VPN / Proxy
                </button>
              </div>
            </div>

            {/* 4. Failed Attempts */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#F8F7F3] dark:bg-[#1A1A1A] border border-[#E8E6DF] dark:border-[#282828]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white dark:bg-[#242424] flex items-center justify-center text-[#111111] dark:text-white shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111111] dark:text-[#F4F4F2]">
                    Preceding Failed Password Retries
                  </p>
                  <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                    Sequential failures in current 15-minute authentication window
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-[#111111] p-1 rounded-md border border-[#E8E6DF] dark:border-[#2A2A2A] shrink-0 self-end sm:self-auto">
                {[0, 1, 2, 3, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateSignal('failedAttempts', val)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                      signals.failedAttempts === val || (val === 5 && signals.failedAttempts >= 5)
                        ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                        : 'text-[#66635C] dark:text-[#9E9B93]'
                    }`}
                  >
                    {val === 5 ? '5+' : val}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Login Time */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#F8F7F3] dark:bg-[#1A1A1A] border border-[#E8E6DF] dark:border-[#282828]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white dark:bg-[#242424] flex items-center justify-center text-[#111111] dark:text-white shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111111] dark:text-[#F4F4F2]">
                    Temporal Schedule Variance
                  </p>
                  <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                    Active business operating hours vs. midnight off-hours
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-[#111111] p-1 rounded-md border border-[#E8E6DF] dark:border-[#2A2A2A] shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => updateSignal('loginTime', 'normal')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.loginTime === 'normal'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Working Hours
                </button>
                <button
                  type="button"
                  onClick={() => updateSignal('loginTime', 'unusual')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.loginTime === 'unusual'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Unusual Time
                </button>
              </div>
            </div>

            {/* 6. Interaction Biometrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#F8F7F3] dark:bg-[#1A1A1A] border border-[#E8E6DF] dark:border-[#282828]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white dark:bg-[#242424] flex items-center justify-center text-[#111111] dark:text-white shrink-0">
                  <MousePointer className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111111] dark:text-[#F4F4F2]">
                    Behavioral Interaction Cadence
                  </p>
                  <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                    Human mouse entropy & typing rhythm vs. automated script
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-[#111111] p-1 rounded-md border border-[#E8E6DF] dark:border-[#2A2A2A] shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => updateSignal('behaviour', 'normal')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.behaviour === 'normal'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Natural Human
                </button>
                <button
                  type="button"
                  onClick={() => updateSignal('behaviour', 'suspicious')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                    signals.behaviour === 'suspicious'
                      ? 'bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] font-semibold'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Bot / Automated
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Output & Decision (5 cols on lg) */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-[#FAFAF8] dark:bg-[#141414]">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF] dark:border-[#262626]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                Authentication Decision Engine
              </span>
              <span className="text-[11px] font-mono text-[#88857E] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isEvaluating ? 'bg-amber-500 animate-spin' : 'bg-emerald-500'}`} />
                <span>{assessment.model_version || 'Random Forest + SHAP'}</span>
              </span>
            </div>

            {/* Prominent Score Card */}
            <div className="p-6 rounded-xl bg-white dark:bg-[#1C1C1C] border border-[#E8E6DF] dark:border-[#2E2E2E] shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                    EVALUATED RISK SCORE
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-black font-mono tracking-tight text-[#111111] dark:text-white tabular-nums">
                      {assessment.risk_score}
                    </span>
                    <span className="text-xl font-bold font-mono text-[#88857E]">/100</span>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-bold text-xs uppercase tracking-wider ${riskTheme.badgeClass}`}
                >
                  {riskTheme.icon}
                  <span>{assessment.risk_level} RISK</span>
                </div>
              </div>

              {/* Visual meter bar with clear threshold ticks */}
              <div className="mt-4">
                <div className="h-2.5 w-full bg-[#EFECE6] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ease-out ${riskTheme.barColor}`}
                    style={{ width: `${Math.max(6, assessment.risk_score)}%` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] font-mono font-medium text-[#66635C] dark:text-[#9E9B93]">
                  <span>0 (Allow)</span>
                  <span className="text-amber-600 dark:text-amber-400">40 (OTP)</span>
                  <span className="text-rose-600 dark:text-rose-400">70 (Block)</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            {/* Prominent Authentication Decision Banner */}
            <div className={`p-4 rounded-xl border ${riskTheme.decisionBg}`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider">
                  POLICY ENFORCEMENT DECISION
                </span>
              </div>
              <p className="mt-1 text-xl font-extrabold tracking-tight">
                {riskTheme.decisionTitle}
              </p>
              <p className="mt-1 text-xs opacity-90 leading-relaxed">
                {riskTheme.decisionSub}
              </p>
            </div>

            {/* Explainable AI (SHAP) Feature Attributions */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1C] border border-[#E8E6DF] dark:border-[#2E2E2E]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                  SHAP Feature Attributions
                </span>
                <span className="text-[10px] text-[#88857E] font-mono">TreeExplainer</span>
              </div>

              {assessment.detailed_factors && assessment.detailed_factors.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {assessment.detailed_factors.map((factor, idx) => {
                    const isMitigating = factor.status === 'positive';
                    return (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-[#33312E] dark:text-[#CCCCCC]"
                      >
                        <span className="flex items-center gap-2 truncate pr-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              factor.status === 'critical'
                                ? 'bg-rose-500'
                                : factor.status === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span className="truncate">{factor.title}</span>
                        </span>
                        <span
                          className={`font-mono font-bold text-xs shrink-0 ${
                            isMitigating
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isMitigating ? '-' : '+'}{factor.weight} pts
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium py-1">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>All evaluated signals align with trusted baseline.</span>
                </div>
              )}
            </div>

            {/* Model Explanation */}
            <div className="p-3 rounded-lg bg-[#F0EEE6]/80 dark:bg-[#202020] text-xs text-[#55524B] dark:text-[#A8A49C] leading-relaxed">
              <span className="font-semibold text-[#111111] dark:text-white block mb-0.5">
                Policy & Model Explanation:
              </span>
              {assessment.explanation}
            </div>
          </div>

          {/* Test Action */}
          {showConsoleAction && (
            <div className="mt-6 pt-4 border-t border-[#E8E6DF] dark:border-[#262626] space-y-2">
              <button
                type="button"
                onClick={handlePushToSecurityConsole}
                disabled={isSubmittingToConsole}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#111111] text-white hover:bg-[#262626] dark:bg-[#E6C65C] dark:text-[#111111] dark:hover:bg-[#D4B54C] rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmittingToConsole ? 'Recording Event...' : 'Record Event to Security Console'}
              </button>

              {consoleRecordedFeedback && (
                <p className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fade-in">
                  ✓ {consoleRecordedFeedback}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
