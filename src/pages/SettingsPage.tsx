import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Cpu,
  Globe,
  Info,
  KeyRound,
  Lock,
  Moon,
  Save,
  Server,
  Shield,
  Sliders,
  Sun,
  Webhook,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { INITIAL_THRESHOLDS } from '../services/mockData';
import { RiskThresholdSettings } from '../services/types';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [thresholds, setThresholds] = useState<RiskThresholdSettings>({ ...INITIAL_THRESHOLDS });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <DashboardLayout activePageTitle="Settings" activeBreadcrumb="Settings">
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-[#E8E6DF] dark:border-[#262626]">
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
            System Configuration & Risk Policies
          </h1>
          <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
            Configure adaptive score cutoffs, step-up MFA verification methods, and SOC alert distribution channels.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Policy configuration saved successfully (Simulation local state).</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Risk Thresholds */}
          <div className="p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0EEE6] dark:border-[#262626]">
              <Sliders className="w-4 h-4 text-[#E6C65C]" />
              <h2 className="text-sm font-bold text-[#111111] dark:text-white">
                Risk Score Thresholds
              </h2>
            </div>

            <p className="text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
              Define the numerical score bands that govern the adaptive authentication engine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Low Risk */}
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  LOW RISK (ALLOW)
                </span>
                <div className="text-2xl font-black font-mono text-emerald-800 dark:text-emerald-300">
                  0 – 39
                </div>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Seamless pass-through. No challenge issued.
                </p>
              </div>

              {/* Medium Risk */}
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  MEDIUM RISK (OTP CHALLENGE)
                </span>
                <div className="text-2xl font-black font-mono text-amber-800 dark:text-amber-300">
                  40 – 69
                </div>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Enforce step-up second factor verification.
                </p>
              </div>

              {/* High Risk */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  HIGH RISK (BLOCK + ALERT)
                </span>
                <div className="text-2xl font-black font-mono text-rose-800 dark:text-rose-300">
                  70 – 100
                </div>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Instant gate lockout and dispatch incident alert.
                </p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#88857E] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Threshold tuning policy is currently in baseline simulation mode. Changes do not alter production backend gates.</span>
            </div>
          </div>

          {/* Section 2: Authentication Settings */}
          <div className="p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0EEE6] dark:border-[#262626]">
              <KeyRound className="w-4 h-4 text-[#E6C65C]" />
              <h2 className="text-sm font-bold text-[#111111] dark:text-white">
                Authentication & MFA Rules
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1A1A1A]">
                <div>
                  <p className="font-semibold text-[#111111] dark:text-white">
                    Step-Up MFA on Medium Risk (Score ≥ 40%)
                  </p>
                  <p className="text-[#66635C] dark:text-[#9E9B93] text-[11px]">
                    Challenge uncertain users with TOTP or FIDO2 hardware passkeys.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={thresholds.enableOtpOnMedium}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, enableOtpOnMedium: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#111111] dark:accent-[#E6C65C] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1A1A1A]">
                <div>
                  <p className="font-semibold text-[#111111] dark:text-white">
                    Strict Commercial VPN & Anonymizer Policy
                  </p>
                  <p className="text-[#66635C] dark:text-[#9E9B93] text-[11px]">
                    Automatically challenge all commercial datacenter IP connections regardless of credentials.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={thresholds.strictVpnPolicy}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, strictVpnPolicy: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#111111] dark:accent-[#E6C65C] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1A1A1A]">
                <div>
                  <p className="font-semibold text-[#111111] dark:text-white">
                    Maximum Failed Credential Submissions
                  </p>
                  <p className="text-[#66635C] dark:text-[#9E9B93] text-[11px]">
                    Consecutive password retries before triggering automated 15-minute perimeter freeze.
                  </p>
                </div>
                <select
                  value={thresholds.maxFailedAttemptsLock}
                  onChange={(e) =>
                    setThresholds({
                      ...thresholds,
                      maxFailedAttemptsLock: parseInt(e.target.value, 10),
                    })
                  }
                  className="py-1 px-2.5 rounded-md border border-[#E8E6DF] dark:border-[#2A2A2A] bg-white dark:bg-[#111111] text-xs font-mono"
                >
                  <option value={3}>3 Attempts</option>
                  <option value={5}>5 Attempts (Default)</option>
                  <option value={10}>10 Attempts</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Notification Settings */}
          <div className="p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0EEE6] dark:border-[#262626]">
              <Bell className="w-4 h-4 text-[#E6C65C]" />
              <h2 className="text-sm font-bold text-[#111111] dark:text-white">
                Notification & SOC Alerts
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#111111] dark:text-white mb-1">
                  SOC Triage Alert Distribution List
                </label>
                <input
                  type="email"
                  value={thresholds.alertEmailDistribution}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, alertEmailDistribution: e.target.value })
                  }
                  className="w-full max-w-md py-1.5 px-3 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Appearance */}
          <div className="p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0EEE6] dark:border-[#262626]">
              <Sun className="w-4 h-4 text-[#E6C65C]" />
              <h2 className="text-sm font-bold text-[#111111] dark:text-white">
                Appearance & Theme
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                    : 'border-[#E8E6DF] bg-white text-[#66635C]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light Theme (#F8F7F3)</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'border-[#E6C65C] bg-[#1A1A1A] text-[#E6C65C] shadow-xs'
                    : 'border-[#262626] bg-[#141414] text-[#9E9B93]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Theme (#0F0F0F)</span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#111111] text-white hover:bg-[#282828] dark:bg-[#E6C65C] dark:text-[#111111] dark:hover:bg-[#D8B74A] font-semibold text-xs tracking-wide transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Policy Settings</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
