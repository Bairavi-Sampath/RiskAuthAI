import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Filter,
  Globe,
  HelpCircle,
  Laptop,
  Lock,
  MousePointer,
  Network,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { AuthDecision, LoginEvent, RiskLevel } from '../services/types';

export const LoginEventsPage: React.FC = () => {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [decisionFilter, setDecisionFilter] = useState<'ALL' | AuthDecision>('ALL');
  const [vpnFilter, setVpnFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<LoginEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getLoginEvents();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filtered and searched events
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.ipAddress.includes(searchTerm) ||
      evt.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.device.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || evt.riskLevel === riskFilter;
    const matchesDecision = decisionFilter === 'ALL' || evt.decision === decisionFilter;
    const matchesVpn =
      vpnFilter === 'ALL' || (vpnFilter === 'YES' ? evt.vpn : !evt.vpn);

    return matchesSearch && matchesRisk && matchesDecision && matchesVpn;
  });

  const exportCsv = () => {
    const headers = 'ID,User,Timestamp,IP,Device,Location,VPN,RiskScore,RiskLevel,Decision\n';
    const rows = filteredEvents
      .map(
        (e) =>
          `"${e.id}","${e.userEmail}","${e.timestamp}","${e.ipAddress}","${e.device}","${e.location}",${e.vpn},${e.riskScore},"${e.riskLevel}","${e.decision}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riskauth-login-events-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <DashboardLayout activePageTitle="Login Events" activeBreadcrumb="Login Events">
      <div className="space-y-6">
        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF] dark:border-[#262626]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Login Events Ledger
            </h1>
            <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
              Immutable audit trail of all authentication sessions and contextual risk evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="px-3 py-2 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] hover:bg-[#F2F0E8] dark:hover:bg-[#222222] text-xs font-semibold text-[#111111] dark:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={fetchEvents}
              className="p-2 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#88857E] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user email, IP address, device, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
              />
            </div>

            {/* Risk Level Filter Tabs */}
            <div className="md:col-span-3 flex items-center gap-1 bg-[#F0EEE6] dark:bg-[#222222] p-1 rounded-lg">
              {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setRiskFilter(lvl)}
                  className={`flex-1 py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                    riskFilter === lvl
                      ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white font-semibold shadow-xs'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Decision Filter */}
            <div className="md:col-span-2">
              <select
                value={decisionFilter}
                onChange={(e) => setDecisionFilter(e.target.value as any)}
                className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none"
              >
                <option value="ALL">All Decisions</option>
                <option value="ALLOW">Allowed</option>
                <option value="OTP">OTP Required</option>
                <option value="BLOCK">Blocked</option>
              </select>
            </div>

            {/* VPN Filter */}
            <div className="md:col-span-2">
              <select
                value={vpnFilter}
                onChange={(e) => setVpnFilter(e.target.value as any)}
                className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none"
              >
                <option value="ALL">All Network Types</option>
                <option value="YES">VPN / Proxy Only</option>
                <option value="NO">Non-VPN</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#66635C] dark:text-[#9E9B93] pt-1">
            <span>
              Showing <strong className="text-[#111111] dark:text-white font-mono">{filteredEvents.length}</strong> of{' '}
              <strong className="text-[#111111] dark:text-white font-mono">{events.length}</strong> events
            </span>
            {(riskFilter !== 'ALL' || decisionFilter !== 'ALL' || vpnFilter !== 'ALL' || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setRiskFilter('ALL');
                  setDecisionFilter('ALL');
                  setVpnFilter('ALL');
                  setSearchTerm('');
                }}
                className="text-[#E6C65C] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAFAF8] dark:bg-[#1A1A1A] border-b border-[#E8E6DF] dark:border-[#262626] text-[#66635C] dark:text-[#9E9B93] uppercase font-semibold text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">VPN</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6] dark:divide-[#222222]">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-[#66635C] dark:text-[#9E9B93]">
                      No authentication events match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt) => (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="hover:bg-[#F8F7F3] dark:hover:bg-[#1B1B1B] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#111111] dark:text-white">
                        {evt.userEmail}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#88857E] whitespace-nowrap">
                        {evt.timestamp}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#66635C] dark:text-[#A8A49C]">
                        {evt.ipAddress}
                      </td>
                      <td className="py-3.5 px-4 text-[#33312E] dark:text-[#D1CEC4] max-w-[140px] truncate">
                        {evt.device}
                      </td>
                      <td className="py-3.5 px-4 text-[#66635C] dark:text-[#A8A49C] max-w-[140px] truncate">
                        {evt.location}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-center">
                        {evt.vpn ? (
                          <span className="font-semibold text-rose-600 dark:text-rose-400">Yes</span>
                        ) : (
                          <span className="text-[#88857E]">No</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                        {evt.riskScore}%
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={evt.riskLevel} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge decision={evt.decision} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                          }}
                          className="p-1 rounded text-[#88857E] hover:text-[#111111] dark:hover:text-white hover:bg-[#EFECE6] dark:hover:bg-[#282828]"
                          title="Inspect Telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-over Forensic Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-xl bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF] dark:border-[#262626]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#E6C65C]" />
                  <h3 className="font-bold text-sm text-[#111111] dark:text-white">
                    Event Forensics · {selectedEvent.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 text-[#88857E] hover:text-[#111111] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Event Summary Lockup */}
              <div className="p-4 rounded-xl bg-[#F8F7F3] dark:bg-[#1C1C1C] border border-[#E8E6DF] dark:border-[#2A2A2A] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#111111] dark:text-white">
                    {selectedEvent.userEmail}
                  </p>
                  <p className="text-[11px] font-mono text-[#88857E] mt-0.5">
                    {selectedEvent.timestamp} · {selectedEvent.ipAddress}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#111111] dark:text-white">
                    {selectedEvent.riskScore}%
                  </div>
                  <RiskBadge decision={selectedEvent.decision} size="sm" />
                </div>
              </div>

              {/* Forensic Signal Matrix */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                  Evaluated Context Signals
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]">
                    <span className="text-[#88857E] text-[10px] block">Hardware Fingerprint</span>
                    <span className="font-medium text-[#111111] dark:text-white mt-0.5 block truncate">
                      {selectedEvent.device} ({selectedEvent.deviceStatus})
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]">
                    <span className="text-[#88857E] text-[10px] block">Geolocation Cluster</span>
                    <span className="font-medium text-[#111111] dark:text-white mt-0.5 block truncate">
                      {selectedEvent.location}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]">
                    <span className="text-[#88857E] text-[10px] block">Network Anonymizer</span>
                    <span className="font-medium text-[#111111] dark:text-white mt-0.5 block">
                      {selectedEvent.vpn ? 'VPN / Proxy Detected' : 'Clean ISP Route'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A]">
                    <span className="text-[#88857E] text-[10px] block">Preceding Failures</span>
                    <span className="font-medium text-[#111111] dark:text-white mt-0.5 block font-mono">
                      {selectedEvent.failedAttempts} failed attempts
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              {selectedEvent.riskFactors.length > 0 && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                    Identified Anomalies
                  </span>
                  <ul className="space-y-1">
                    {selectedEvent.riskFactors.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-lg bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] text-xs font-semibold"
                >
                  Close Forensics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
