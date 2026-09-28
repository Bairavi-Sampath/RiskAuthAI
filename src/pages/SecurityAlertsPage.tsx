import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  KeyRound,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  UserX,
  X,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { SecurityAlert } from '../services/types';

export const SecurityAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'investigating' | 'resolved'>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
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

  const handleUpdateStatus = async (
    alertId: string,
    newStatus: 'active' | 'investigating' | 'resolved',
    actionDesc?: string
  ) => {
    await api.updateAlertStatus(alertId, newStatus);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: newStatus });
    }
    setActionFeedback(actionDesc || `Alert marked as ${newStatus}.`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const filteredAlerts = alerts.filter(
    (a) => filterStatus === 'ALL' || a.status === filterStatus
  );

  return (
    <DashboardLayout activePageTitle="Security Alerts" activeBreadcrumb="Security Alerts">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF] dark:border-[#262626]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Security Incident Alerts
            </h1>
            <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
              Triage real-time suspicious authentication attempts, Tor exit nodes, and automated credential stuffing spikes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAlerts}
              className="p-2 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
              title="Refresh alerts"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action toast feedback */}
        {actionFeedback && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium flex items-center justify-between animate-fade-in">
            <span>✓ {actionFeedback}</span>
            <button type="button" onClick={() => setActionFeedback(null)} className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-[#F0EEE6] dark:bg-[#222222] p-1 rounded-lg">
            {(['ALL', 'active', 'investigating', 'resolved'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white font-semibold shadow-xs'
                    : 'text-[#66635C] dark:text-[#9E9B93]'
                }`}
              >
                {st === 'ALL' ? 'All Alerts' : st}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-[#66635C] dark:text-[#9E9B93]">
            {filteredAlerts.length} total incidents
          </span>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616]">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#111111] dark:text-white">
                Queue Clear
              </p>
              <p className="text-xs text-[#66635C] dark:text-[#9E9B93] mt-1">
                No alerts match the selected status filter.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] hover:border-[#D1CEC4] dark:hover:border-[#3D3D3D] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Alert Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          alert.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : alert.severity === 'high'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : alert.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {alert.severity}
                      </span>

                      <span className="text-xs font-mono font-bold text-[#111111] dark:text-white">
                        Risk Score: {alert.riskScore}%
                      </span>

                      <span className="text-xs text-[#88857E]">·</span>
                      <span className="text-xs font-mono text-[#88857E]">{alert.timestamp}</span>

                      <span className="text-xs text-[#88857E]">·</span>
                      <span
                        className={`text-xs font-semibold capitalize ${
                          alert.status === 'active'
                            ? 'text-rose-600'
                            : alert.status === 'investigating'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        ● {alert.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#111111] dark:text-white pt-1">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-[#55524A] dark:text-[#A8A49C] leading-relaxed max-w-3xl">
                      {alert.description}
                    </p>

                    <div className="pt-2 flex items-center gap-4 text-[11px] text-[#66635C] dark:text-[#9E9B93] flex-wrap">
                      <span>Target: <strong className="text-[#111111] dark:text-white">{alert.userEmail}</strong></span>
                      <span>·</span>
                      <span>IP: <strong className="font-mono text-[#111111] dark:text-white">{alert.signals.ip}</strong></span>
                      <span>·</span>
                      <span>Origin: {alert.signals.location}</span>
                      <span>·</span>
                      <span>VPN: {alert.signals.vpn ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAlert(alert)}
                      className="px-3 py-1.5 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] hover:bg-[#F2F0E8] dark:hover:bg-[#222222] text-xs font-semibold text-[#111111] dark:text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    {alert.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(alert.id, 'investigating')}
                        className="px-3 py-1.5 rounded-lg bg-[#F0EEE6] dark:bg-[#262626] text-xs font-semibold text-[#111111] dark:text-white hover:bg-[#E5E3DC] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Investigate
                      </button>
                    )}

                    {alert.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Incident Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-xl bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF] dark:border-[#262626]">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-sm text-[#111111] dark:text-white">
                    Incident Forensics · {selectedAlert.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="p-1.5 text-[#88857E] hover:text-[#111111] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  {selectedAlert.severity} Severity Threat
                </span>
                <h2 className="text-lg font-bold text-[#111111] dark:text-white mt-1">
                  {selectedAlert.title}
                </h2>
                <p className="text-xs text-[#55524A] dark:text-[#A8A49C] mt-2 leading-relaxed">
                  {selectedAlert.description}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A] space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93] block">
                  Recommended SOC Remediation
                </span>
                <p className="text-xs text-[#111111] dark:text-white font-medium">
                  {selectedAlert.recommendedAction}
                </p>
              </div>

              {/* Remediation Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8E6DF] dark:border-[#262626]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(
                        selectedAlert.id,
                        'resolved',
                        `Enforced password reset for ${selectedAlert.userEmail}.`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] text-xs font-semibold hover:bg-[#F2F0E8] dark:hover:bg-[#222222] flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(
                        selectedAlert.id,
                        'resolved',
                        `Added IP ${selectedAlert.signals.ip} to firewall perimeter blocklist.`
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 dark:border-rose-900 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Block IP Address</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
