import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  HelpCircle,
  Laptop,
  Lock,
  MousePointer,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { LoginEvent } from '../services/types';
import { RiskBadge } from '../components/common/RiskBadge';

export const SecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'SUSPICIOUS' | 'ALLOWED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, evts] = await Promise.all([
        api.getDashboardMetrics(),
        api.getLoginEvents(),
      ]);
      setMetrics(m);
      setEvents(evts);
      setIsLiveData(true);
    } catch (err) {
      console.warn('Backend connection issue, showing stored activity:', err);
      setIsLiveData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute actual dynamic statistics from real backend metrics/database
  const totalLogins = metrics?.totalAttempts ?? (events.length > 0 ? events.length : 0);
  const allowedCount = metrics?.lowRiskCount ?? events.filter((e) => e.decision === 'ALLOW').length;
  const verificationCount =
    metrics?.otpChallengedCount ??
    metrics?.mediumRiskCount ??
    events.filter((e) => e.decision === 'OTP').length;
  const blockedCount =
    metrics?.blockedCount ??
    metrics?.highRiskCount ??
    events.filter((e) => e.decision === 'BLOCK').length;
  const activeAlertsCount = metrics?.activeAlertsCount ?? 0;

  const totalForPercent = Math.max(1, totalLogins);
  const allowedPercent = Math.round((allowedCount / totalForPercent) * 100);
  const verificationPercent = Math.round((verificationCount / totalForPercent) * 100);
  const blockedPercent = Math.max(0, 100 - allowedPercent - verificationPercent);

  // Filter login events
  const filteredEvents = events.filter((evt) => {
    const isSuspicious = evt.decision === 'BLOCK' || evt.decision === 'OTP' || evt.riskLevel !== 'LOW';
    const matchesFilter =
      selectedFilter === 'ALL' ||
      (selectedFilter === 'SUSPICIOUS' && isSuspicious) ||
      (selectedFilter === 'ALLOWED' && evt.decision === 'ALLOW');

    const matchesSearch =
      !searchQuery ||
      evt.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.ipAddress.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  // Recent suspicious logins (for quick review)
  const suspiciousLogins = events
    .filter((e) => e.decision === 'BLOCK' || e.decision === 'OTP' || e.riskScore >= 40)
    .slice(0, 4);

  return (
    <DashboardLayout activePageTitle="Security Overview" activeBreadcrumb="Security Overview">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF] dark:border-[#262626]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveData ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px] font-medium text-[#66635C] dark:text-[#9E9B93]">
                {isLiveData ? 'Live Backend Connected' : 'Local Storage Mode'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Security Overview
            </h1>
            <p className="mt-0.5 text-xs text-[#66635C] dark:text-[#9E9B93]">
              Summary of recent login activity, verification challenges, and blocked threats.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/analysis"
              className="px-3.5 py-2 rounded-lg bg-[#E6C65C] text-[#111111] hover:bg-[#D8B74A] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Risk Simulator</span>
            </Link>
          </div>
        </div>

        {/* Compact Security Alert (only shown when active alerts exist) */}
        {activeAlertsCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/20 text-xs transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  {activeAlertsCount} Suspicious {activeAlertsCount === 1 ? 'Login' : 'Logins'} Need Review
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90">
                  High-risk attempts were automatically blocked or challenged to protect user accounts.
                </p>
              </div>
            </div>

            <Link
              to="/alerts"
              className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs whitespace-nowrap self-start sm:self-auto transition-colors"
            >
              Review Alerts &rarr;
            </Link>
          </div>
        )}

        {/* Four Core Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Login Attempts"
            value={totalLogins}
            subtext="All evaluated logins"
            icon={<Activity className="w-4 h-4 text-blue-500" />}
          />
          <StatCard
            label="Allowed"
            value={allowedCount}
            subtext={`${allowedPercent}% allowed directly`}
            icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          />
          <StatCard
            label="Verification Required"
            value={verificationCount}
            subtext={`${verificationPercent}% prompted for OTP`}
            icon={<HelpCircle className="w-4 h-4 text-amber-500" />}
          />
          <StatCard
            label="Blocked"
            value={blockedCount}
            subtext={`${blockedPercent}% blocked immediately`}
            highlight={blockedCount > 0}
            icon={<ShieldAlert className="w-4 h-4 text-rose-600" />}
          />
        </div>

        {/* Two-Column Overview: Breakdown & Why Logins Are Flagged */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Login Outcome Distribution */}
          <div className="lg:col-span-5 p-5 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#111111] dark:text-white mb-1">
                Login Results Breakdown
              </h2>
              <p className="text-xs text-[#66635C] dark:text-[#9E9B93] mb-5">
                How authentication attempts were handled based on risk scores:
              </p>

              <div className="space-y-4">
                {/* Allowed */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-700 dark:text-emerald-400">Allowed (Low Risk)</span>
                    <span className="font-mono text-[#111111] dark:text-white">
                      {allowedPercent}% ({allowedCount.toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950/50 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${allowedPercent}%` }}
                    />
                  </div>
                </div>

                {/* Verification Required */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-700 dark:text-amber-400">Verification Required (Medium Risk)</span>
                    <span className="font-mono text-[#111111] dark:text-white">
                      {verificationPercent}% ({verificationCount.toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-amber-100 dark:bg-amber-950/50 overflow-hidden">
                    <div
                      className="h-full bg-[#E6C65C] rounded-full transition-all duration-300"
                      style={{ width: `${verificationPercent}%` }}
                    />
                  </div>
                </div>

                {/* Blocked */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-700 dark:text-rose-400">Blocked (High Risk)</span>
                    <span className="font-mono text-[#111111] dark:text-white">
                      {blockedPercent}% ({blockedCount.toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-rose-100 dark:bg-rose-950/50 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-300"
                      style={{ width: `${blockedPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Policy Tiers */}
            <div className="mt-6 pt-4 border-t border-[#F0EEE6] dark:border-[#262626] text-xs text-[#66635C] dark:text-[#9E9B93] space-y-1">
              <div className="flex justify-between">
                <span>Score 0–39:</span>
                <span className="font-semibold text-emerald-600">Allowed without extra steps</span>
              </div>
              <div className="flex justify-between">
                <span>Score 40–69:</span>
                <span className="font-semibold text-amber-600">One-time passcode required</span>
              </div>
              <div className="flex justify-between">
                <span>Score 70–100:</span>
                <span className="font-semibold text-rose-600">Blocked immediately</span>
              </div>
            </div>
          </div>

          {/* Right Column: Why Logins Are Flagged */}
          <div className="lg:col-span-7 p-5 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616]">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-[#111111] dark:text-white">
                Why Logins Are Flagged
              </h2>
              <span className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">6 Key Signals</span>
            </div>
            <p className="text-xs text-[#66635C] dark:text-[#9E9B93] mb-4">
              Every login is checked across these signals to calculate an accurate risk score:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* 1. Trusted Device */}
              <div className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-1">
                  <Laptop className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <span className="font-bold text-[#111111] dark:text-white">Trusted Device</span>
                </div>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Matches the user’s known computer or phone. New or unrecognized devices raise risk.
                </p>
              </div>

              {/* 2. Unusual Location */}
              <div className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <span className="font-bold text-[#111111] dark:text-white">Unusual Location</span>
                </div>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Access from an unexpected city or foreign country raises the risk level.
                </p>
              </div>

              {/* 3. VPN Detected */}
              <div className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <span className="font-bold text-[#111111] dark:text-white">VPN Detected</span>
                </div>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Connections through anonymous VPN proxies or Tor nodes trigger extra checks.
                </p>
              </div>

              {/* 4. Failed Login Attempts */}
              <div className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <span className="font-bold text-[#111111] dark:text-white">Failed Login Attempts</span>
                </div>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Multiple wrong passwords before logging in suggest possible password guessing.
                </p>
              </div>

              {/* 5. Unusual Login Time */}
              <div className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <span className="font-bold text-[#111111] dark:text-white">Unusual Login Time</span>
                </div>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Access occurring outside habitual operating hours or in the middle of the night.
                </p>
              </div>

              {/* 6. Behaviour Changes */}
              <div className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-1">
                  <MousePointer className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <span className="font-bold text-[#111111] dark:text-white">Behaviour Changes</span>
                </div>
                <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93]">
                  Typing cadence or mouse speed that mimics automated scripts instead of humans.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Suspicious Logins Callout (if any flagged recently) */}
        {suspiciousLogins.length > 0 && (
          <div className="p-5 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h2 className="text-sm font-bold text-[#111111] dark:text-white">
                  Recent Suspicious Logins
                </h2>
              </div>
              <Link
                to="/alerts"
                className="text-xs font-semibold text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white flex items-center gap-1"
              >
                <span>View All Alerts</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {suspiciousLogins.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1C1C1C] text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111] dark:text-white truncate max-w-[120px]">
                      {item.userName}
                    </span>
                    <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                      Score: {item.riskScore}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93] truncate">
                    {item.location} · {item.device}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E8E6DF] dark:border-[#2A2A2A]">
                    <span className="text-[10px] text-[#88857E]">{item.timestamp}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.decision === 'BLOCK'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.decision === 'BLOCK' ? 'Blocked' : 'OTP Challenge'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Authentication Activity Table */}
        <div className="p-5 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0EEE6] dark:border-[#262626]">
            <div>
              <h2 className="text-sm font-bold text-[#111111] dark:text-white">
                Recent Login Activity
              </h2>
              <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                Authentication attempts recorded with calculated risk scores and actions taken.
              </p>
            </div>

            {/* Filter Pills and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#88857E]" />
                <input
                  type="text"
                  placeholder="Search user, IP, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-[#F8F7F3] dark:bg-[#1E1E1E] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#F0EEE6] dark:bg-[#202020] p-1 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setSelectedFilter('ALL')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] font-bold ${
                    selectedFilter === 'ALL'
                      ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white shadow-2xs'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  All ({events.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('SUSPICIOUS')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] font-bold ${
                    selectedFilter === 'SUSPICIOUS'
                      ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white shadow-2xs'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Flagged Only
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter('ALLOWED')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer text-[11px] font-bold ${
                    selectedFilter === 'ALLOWED'
                      ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white shadow-2xs'
                      : 'text-[#66635C] dark:text-[#9E9B93]'
                  }`}
                >
                  Allowed
                </button>
              </div>

              <Link
                to="/events"
                className="text-xs font-semibold text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white px-2 py-1"
              >
                All Events &rarr;
              </Link>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8E6DF] dark:border-[#262626] text-[#8A867E]">
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Location & IP</th>
                  <th className="py-2.5 px-3 font-semibold">Device</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Score</th>
                  <th className="py-2.5 px-3 font-semibold">Action Taken</th>
                  <th className="py-2.5 px-3 font-semibold">Flagged Reasons</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6] dark:divide-[#222222]">
                {filteredEvents.slice(0, 10).map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#F8F7F3] dark:hover:bg-[#1C1C1C] transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-semibold text-[#111111] dark:text-white block">
                          {evt.userName}
                        </span>
                        <span className="text-[11px] text-[#8A867E] font-mono">{evt.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#66635C] dark:text-[#9E9B93]">
                      <span className="block text-[#111111] dark:text-white font-medium">{evt.location}</span>
                      <span className="text-[11px] text-[#88857E] font-mono">{evt.ipAddress}</span>
                    </td>
                    <td className="py-3 px-3 text-[#66635C] dark:text-[#9E9B93]">
                      <span className="block text-[#111111] dark:text-white">{evt.device}</span>
                      <span className="text-[10px] text-[#88857E]">
                        {evt.deviceStatus === 'trusted' ? 'Trusted' : 'New Device'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sm text-[#111111] dark:text-white">
                      {evt.riskScore}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded ${
                          evt.decision === 'ALLOW'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : evt.decision === 'OTP'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {evt.decision === 'ALLOW'
                          ? 'Allowed'
                          : evt.decision === 'OTP'
                          ? 'OTP Verification'
                          : 'Blocked'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#66635C] dark:text-[#9E9B93]">
                      {evt.riskFactors && evt.riskFactors.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {evt.riskFactors.slice(0, 2).map((rf, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-[#F0EEE6] dark:bg-[#252525] text-[#55524B] dark:text-[#AAA7A0] truncate"
                            >
                              {rf}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Normal Baseline</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
