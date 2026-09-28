import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  Filter,
  Flame,
  Globe,
  HelpCircle,
  Laptop,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatCard } from '../components/common/StatCard';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RiskSimulator } from '../components/simulator/RiskSimulator';
import { api } from '../services/api';
import { LoginEvent, SecurityAlert } from '../services/types';
import { useTheme } from '../context/ThemeContext';

export const SecurityDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<LoginEvent[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatorModalOpen, setSimulatorModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, evts, alrts] = await Promise.all([
        api.getDashboardMetrics(),
        api.getLoginEvents(),
        api.getSecurityAlerts(),
      ]);
      setMetrics(m);
      setRecentEvents(evts.slice(0, 6));
      setActiveAlerts(alrts.filter((a) => a.status === 'active'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#262626' : '#E8E6DF';
  const textColor = isDark ? '#9E9B93' : '#66635C';

  return (
    <DashboardLayout activePageTitle="Security Dashboard" activeBreadcrumb="Overview">
      <div className="space-y-8">
        {/* Page Header with Real-Time Quick Simulator Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E6DF] dark:border-[#262626]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-[#88857E] uppercase tracking-wider">
                Risk Engine: Online · v3.2-xgb
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Security Dashboard
            </h1>
            <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
              Continuous risk-based authentication monitoring, signal telemetry, and automated lockout control.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setSimulatorModalOpen(true)}
              className="px-3.5 py-2 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] hover:bg-[#F2F0E8] dark:hover:bg-[#222222] text-[#111111] dark:text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-[#E6C65C]" />
              <span>Simulate Attack Probe</span>
            </button>

            <Link
              to="/analysis"
              className="px-3.5 py-2 rounded-lg bg-[#111111] text-white hover:bg-[#282828] dark:bg-[#E6C65C] dark:text-[#111111] dark:hover:bg-[#D8B74A] text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Deep Risk Analysis</span>
            </Link>
          </div>
        </div>

        {/* Top 5 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Attempts"
            value={metrics?.totalAttempts || 5240}
            subtext="Last 24 hours rolling window"
            trend={{ direction: 'neutral', value: '+4.2% vs yesterday' }}
            icon={<Activity className="w-4 h-4" />}
          />
          <StatCard
            label="Low Risk (0–39)"
            value={metrics?.lowRiskCount || 4560}
            subtext="Seamless pass-through"
            trend={{ direction: 'down', value: '87.1% allowed' }}
            icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          />
          <StatCard
            label="Medium Risk (40–69)"
            value={metrics?.mediumRiskCount || 512}
            subtext="OTP / MFA challenged"
            trend={{ direction: 'up', value: '9.8% step-up' }}
            icon={<HelpCircle className="w-4 h-4 text-amber-500" />}
          />
          <StatCard
            label="High Risk (70–100)"
            value={metrics?.highRiskCount || 168}
            subtext="Anomalous threats blocked"
            trend={{ direction: 'up', value: '+18% velocity' }}
            highlight={true}
            icon={<ShieldAlert className="w-4 h-4 text-rose-600" />}
          />
          <StatCard
            label="Blocked Attempts"
            value={metrics?.blockedCount || 142}
            subtext="Perimeter gate lockouts"
            trend={{ direction: 'up', value: '100% intercepted' }}
            icon={<Lock className="w-4 h-4 text-rose-700" />}
          />
        </div>

        {/* Charts Section: 2 Charts Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Activity Timeline (8 cols on lg) */}
          <div className="lg:col-span-8 p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#F0EEE6] dark:border-[#262626]">
              <div>
                <h3 className="text-sm font-bold text-[#111111] dark:text-white">
                  24-Hour Authentication Activity
                </h3>
                <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                  Allowed logins vs. Step-up OTP challenges vs. Blocked attempts
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Allowed (0–39)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E6C65C]" /> OTP (40–69)
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Blocked (70–100)
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              {metrics && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.activityTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOtp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E6C65C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E6C65C" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="time" stroke={textColor} fontSize={11} tickLine={false} />
                    <YAxis stroke={textColor} fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                        borderColor: isDark ? '#333333' : '#E5E5E5',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: isDark ? '#FFFFFF' : '#111111',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="allowed"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAllowed)"
                    />
                    <Area
                      type="monotone"
                      dataKey="otp"
                      stroke="#E6C65C"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOtp)"
                    />
                    <Area
                      type="monotone"
                      dataKey="blocked"
                      stroke="#EF4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBlocked)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Risk Distribution Breakdown (4 cols on lg) */}
          <div className="lg:col-span-4 p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111] dark:text-white">
                Risk Score Distribution
              </h3>
              <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                Authentication volume classified by risk score band
              </p>

              <div className="mt-4 h-48 w-full">
                {metrics && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.riskDistribution} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke={textColor} fontSize={10} width={90} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                          borderColor: isDark ? '#333333' : '#E5E5E5',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {metrics.riskDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#F0EEE6] dark:border-[#262626] flex items-center justify-between text-xs text-[#66635C] dark:text-[#9E9B93]">
              <span>Decision: Low (0–39) · Medium (40–69) · High (70–100)</span>
              <Link to="/analysis" className="text-[#E6C65C] font-semibold hover:underline">
                Inspect →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Login Events Table + Active Alerts Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Events Table (8 cols on lg) */}
          <div className="lg:col-span-8 p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EEE6] dark:border-[#262626]">
              <div>
                <h3 className="text-sm font-bold text-[#111111] dark:text-white">
                  Recent Authentication Events
                </h3>
                <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                  Real-time telemetry stream from authentication endpoints
                </p>
              </div>

              <Link
                to="/events"
                className="text-xs font-semibold text-[#111111] dark:text-[#E6C65C] hover:underline flex items-center gap-1"
              >
                <span>View Full Audit Log</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E6DF] dark:border-[#262626] text-[#66635C] dark:text-[#9E9B93] uppercase font-semibold text-[10px]">
                    <th className="pb-2.5 font-medium">User</th>
                    <th className="pb-2.5 font-medium">Device & Location</th>
                    <th className="pb-2.5 font-medium">VPN</th>
                    <th className="pb-2.5 font-medium">Risk Score</th>
                    <th className="pb-2.5 font-medium text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EEE6] dark:divide-[#222222]">
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-[#F8F7F3] dark:hover:bg-[#1A1A1A] transition-colors">
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-[#111111] dark:text-white truncate max-w-[160px]">
                          {event.userEmail}
                        </p>
                        <p className="text-[11px] font-mono text-[#88857E] mt-0.5">
                          {event.ipAddress}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="text-[#33312E] dark:text-[#D1CEC4] truncate max-w-[150px]">
                          {event.device}
                        </p>
                        <p className="text-[11px] text-[#88857E] mt-0.5 truncate max-w-[150px]">
                          {event.location}
                        </p>
                      </td>
                      <td className="py-3 pr-3 font-mono">
                        {event.vpn ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">Yes</span>
                        ) : (
                          <span className="text-[#88857E]">No</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <RiskBadge level={event.riskLevel} showScore={event.riskScore} size="sm" />
                      </td>
                      <td className="py-3 text-right">
                        <RiskBadge decision={event.decision} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Security Alerts (4 cols on lg) */}
          <div className="lg:col-span-4 p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EEE6] dark:border-[#262626]">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-[#111111] dark:text-white">
                    Active Security Alerts
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {activeAlerts.length} Critical
                </span>
              </div>

              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1F1F1F] space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[#111111] dark:text-white leading-snug">
                        {alert.title}
                      </p>
                      <span className="text-[10px] font-mono text-[#88857E] shrink-0">
                        {alert.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93] line-clamp-2 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="font-mono font-semibold text-rose-600">
                        Score: {alert.riskScore}%
                      </span>
                      <Link
                        to="/alerts"
                        className="text-[#E6C65C] font-semibold hover:underline"
                      >
                        Investigate →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#F0EEE6] dark:border-[#262626]">
              <Link
                to="/alerts"
                className="w-full block text-center py-2 px-3 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1C1C1C] hover:bg-[#F2F0E8] dark:hover:bg-[#262626] text-xs font-semibold text-[#111111] dark:text-white transition-colors"
              >
                Open Incident Queue
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal for Live Demo Testing */}
      {simulatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] rounded-2xl shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-[#E8E6DF] dark:border-[#262626] flex items-center justify-between sticky top-0 bg-white dark:bg-[#161616] z-10">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#E6C65C]" />
                <h3 className="font-bold text-sm text-[#111111] dark:text-white">
                  Live Attack & Authentication Simulator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSimulatorModalOpen(false)}
                className="p-1.5 text-[#88857E] hover:text-[#111111] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <RiskSimulator
                onRecordedEvent={() => {
                  loadData();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
