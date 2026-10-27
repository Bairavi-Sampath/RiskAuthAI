import React, { useEffect, useState } from 'react';
import { Save, Settings, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { RiskThresholdSettings } from '../services/types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<RiskThresholdSettings>({
    lowMax: 39,
    mediumMax: 69,
    highMin: 70,
    enableOtpOnMedium: true,
    strictVpnPolicy: false,
    maxFailedAttemptsLock: 5,
    alertEmailDistribution: 'admin@riskauth.ai',
    autoQuarantineThreshold: 70,
  });

  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateSettings(settings);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <DashboardLayout activePageTitle="Risk Settings" activeBreadcrumb="Risk Settings">
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E6DF] dark:border-[#262626]">
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
            Risk Settings
          </h1>
          <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
            Configure authorization decision score ranges and automated policy rules.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] space-y-5">
            <h2 className="text-sm font-bold text-[#111111] dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#E6C65C]" />
              <span>Score Boundaries</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#1C1C1C] border border-[#E8E6DF] dark:border-[#2E2E2E]">
                <span className="font-semibold text-emerald-600 block mb-1">LOW RISK (ALLOW)</span>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Score 0 to <strong>39</strong>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#1C1C1C] border border-[#E8E6DF] dark:border-[#2E2E2E]">
                <span className="font-semibold text-amber-600 block mb-1">MEDIUM RISK (OTP)</span>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Score <strong>40</strong> to <strong>69</strong>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#1C1C1C] border border-[#E8E6DF] dark:border-[#2E2E2E]">
                <span className="font-semibold text-rose-600 block mb-1">HIGH RISK (BLOCK)</span>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Score <strong>70</strong> to <strong>100</strong>
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#F0EEE6] dark:border-[#262626] text-xs">
              <div>
                <label className="block font-semibold text-[#111111] dark:text-white mb-1">
                  Alert Email Address
                </label>
                <input
                  type="email"
                  value={settings.alertEmailDistribution}
                  onChange={(e) =>
                    setSettings({ ...settings, alertEmailDistribution: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-[#F8F7F3] dark:bg-[#1C1C1C] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enableOtp"
                  checked={settings.enableOtpOnMedium}
                  onChange={(e) =>
                    setSettings({ ...settings, enableOtpOnMedium: e.target.checked })
                  }
                  className="accent-[#E6C65C]"
                />
                <label htmlFor="enableOtp" className="font-semibold text-[#111111] dark:text-white">
                  Require Step-Up OTP Verification on Medium Risk (40–69)
                </label>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="submit"
                className="py-2.5 px-5 rounded-lg bg-[#111111] text-white hover:bg-[#282828] dark:bg-[#E6C65C] dark:text-[#111111] font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>

              {savedMsg && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Settings saved successfully!
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
