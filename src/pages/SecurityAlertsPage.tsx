import React, { useEffect, useState } from 'react';
import { AlertOctagon, CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { SecurityAlert } from '../services/types';

export const SecurityAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getSecurityAlerts();
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleToggleStatus = async (alertId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'resolved' ? 'active' : 'resolved';
    await api.updateAlertStatus(alertId, nextStatus);
    fetchAlerts();
  };

  return (
    <DashboardLayout activePageTitle="Security Alerts" activeBreadcrumb="Alerts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E6DF] dark:border-[#262626]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Security Alerts
            </h1>
            <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
              Notifications for High-Risk and blocked login attempts.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAlerts}
            className="p-2 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            title="Refresh alerts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                alert.status === 'resolved'
                  ? 'bg-white dark:bg-[#161616] border-[#E8E6DF] dark:border-[#262626] opacity-75'
                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 mt-0.5 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#111111] dark:text-white text-sm">
                      {alert.title}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200 font-bold">
                      Score: {alert.riskScore}%
                    </span>
                    <span className="text-[#8A867E] text-[11px]">{alert.timestamp}</span>
                  </div>

                  <p className="text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="pt-2 text-[11px] text-[#8A867E]">
                    User: <strong className="text-[#111111] dark:text-white">{alert.userEmail}</strong> | Action: {alert.recommendedAction}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleStatus(alert.id, alert.status)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                  alert.status === 'resolved'
                    ? 'border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#66635C]'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {alert.status === 'resolved' ? 'Mark Active' : 'Mark Resolved'}
              </button>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="p-12 text-center text-[#8A867E] bg-white dark:bg-[#161616] rounded-xl border border-[#E8E6DF] dark:border-[#262626]">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs">No active security alerts recorded.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
