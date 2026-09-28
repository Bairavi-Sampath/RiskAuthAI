import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  Globe,
  HelpCircle,
  Info,
  Laptop,
  Lock,
  MousePointer,
  RefreshCw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RiskBadge } from '../components/common/RiskBadge';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import {
  evaluateLoginRisk,
  PRESET_MEDIUM,
  PRESET_NORMAL,
  PRESET_SUSPICIOUS,
} from '../services/riskEngine';
import { LoginSignals } from '../services/types';

export const RiskAnalysisPage: React.FC = () => {
  const { theme } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState<'normal' | 'medium' | 'suspicious'>('suspicious');
  const [signals, setSignals] = useState<LoginSignals>({ ...PRESET_SUSPICIOUS });

  const handlePresetChange = (preset: 'normal' | 'medium' | 'suspicious') => {
    setSelectedPreset(preset);
    if (preset === 'normal') setSignals({ ...PRESET_NORMAL });
    if (preset === 'medium') setSignals({ ...PRESET_MEDIUM });
    if (preset === 'suspicious') setSignals({ ...PRESET_SUSPICIOUS });
  };

  const assessment = evaluateLoginRisk(signals);

  // Radar chart data for signal vector anomalies
  const radarData = [
    {
      subject: 'Device Trust',
      deviation: signals.device === 'unknown' ? 85 : 10,
      fullMark: 100,
    },
    {
      subject: 'Geolocation',
      deviation: signals.location === 'unusual' ? 78 : 12,
      fullMark: 100,
    },
    {
      subject: 'VPN / Proxy',
      deviation: signals.vpn === 'yes' ? 95 : 5,
      fullMark: 100,
    },
    {
      subject: 'Failed Attempts',
      deviation: signals.failedAttempts >= 5 ? 90 : signals.failedAttempts >= 3 ? 55 : 0,
      fullMark: 100,
    },
    {
      subject: 'Temporal Window',
      deviation: signals.loginTime === 'unusual' ? 65 : 15,
      fullMark: 100,
    },
    {
      subject: 'Biometrics',
      deviation: signals.behaviour === 'suspicious' ? 88 : 8,
      fullMark: 100,
    },
  ];

  const isDark = theme === 'dark';

  return (
    <DashboardLayout activePageTitle="Risk Analysis" activeBreadcrumb="Risk Analysis">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF] dark:border-[#262626]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Risk Factor Forensics & Explainability
            </h1>
            <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
              Deconstruct feature weights, anomaly vectors, and model inferences for authentication sessions.
            </p>
          </div>

          {/* Quick preset selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F0EEE6] dark:bg-[#222222] rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handlePresetChange('normal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedPreset === 'normal'
                  ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white shadow-xs font-semibold'
                  : 'text-[#66635C] dark:text-[#9E9B93]'
              }`}
            >
              Session: Trusted User (12%)
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('medium')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedPreset === 'medium'
                  ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white shadow-xs font-semibold'
                  : 'text-[#66635C] dark:text-[#9E9B93]'
              }`}
            >
              Session: Geo Shift (54%)
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange('suspicious')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedPreset === 'suspicious'
                  ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white shadow-xs font-semibold'
                  : 'text-[#66635C] dark:text-[#9E9B93]'
              }`}
            >
              Session: Tor Attack (89%)
            </button>
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex items-center gap-5">
            <div className="text-center p-4 rounded-xl bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A] min-w-[120px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93] block">
                Risk Score
              </span>
              <span className="text-4xl font-black font-mono tracking-tight text-[#111111] dark:text-white mt-1 block">
                {assessment.risk_score}%
              </span>
              <span className="text-[10px] font-mono text-[#88857E] mt-1 block">
                0–100 Scale
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                Classification
              </span>
              <div className="flex items-center gap-2">
                <RiskBadge level={assessment.risk_level} size="lg" />
              </div>
              <p className="text-xs text-[#66635C] dark:text-[#9E9B93]">
                Decision: <strong className="text-[#111111] dark:text-white">{assessment.decision}</strong>
              </p>
            </div>
          </div>

          {/* Model Explanation Box */}
          <div className="md:col-span-8 p-4 rounded-xl bg-[#FAFAF8] dark:bg-[#1C1C1C] border border-[#E8E6DF] dark:border-[#2A2A2A]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#111111] dark:text-white mb-1">
              <Cpu className="w-4 h-4 text-[#E6C65C]" />
              <span>
                {assessment.risk_level === 'HIGH'
                  ? 'Why was this login classified as high risk?'
                  : assessment.risk_level === 'MEDIUM'
                  ? 'Why was this login classified as medium risk?'
                  : 'Why was this login classified as low risk?'}
              </span>
              <span className="text-[10px] font-mono text-[#88857E] ml-auto">
                Model: XGBoost-v3.2
              </span>
            </div>
            <p className="text-xs text-[#55524A] dark:text-[#A8A49C] leading-relaxed">
              {assessment.explanation}
            </p>
          </div>
        </div>

        {/* Feature Weights & Anomaly Radar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Signal Factor Weights Table (7 cols on lg) */}
          <div className="lg:col-span-7 p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EEE6] dark:border-[#262626]">
              <h3 className="text-sm font-bold text-[#111111] dark:text-white">
                Contextual Signal Factor Breakdown
              </h3>
              <span className="text-[11px] font-mono text-[#88857E]">
                Contribution Weights
              </span>
            </div>

            <div className="space-y-3">
              {assessment.detailed_factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1A1A1A] flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111111] dark:text-white">
                        {factor.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          factor.status === 'positive'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : factor.status === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {factor.status === 'positive'
                          ? 'Baseline Normal'
                          : factor.status === 'warning'
                          ? 'Moderate Anomaly'
                          : 'Severe Anomaly'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#66635C] dark:text-[#9E9B93] leading-snug">
                      {factor.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#111111] dark:text-white">
                      +{factor.weight}%
                    </span>
                    <span className="text-[10px] text-[#88857E] block">Impact</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Vector Radar (5 cols on lg) */}
          <div className="lg:col-span-5 p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EEE6] dark:border-[#262626]">
                <h3 className="text-sm font-bold text-[#111111] dark:text-white">
                  Multi-Dimensional Threat Radar
                </h3>
                <span className="text-[11px] font-mono text-[#88857E]">
                  Deviation %
                </span>
              </div>

              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke={isDark ? '#333333' : '#E5E5E5'} />
                    <PolarAngleAxis dataKey="subject" stroke={isDark ? '#9E9B93' : '#66635C'} fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? '#555555' : '#CCCCCC'} fontSize={9} />
                    <Radar
                      name="Session Deviation"
                      dataKey="deviation"
                      stroke="#E6C65C"
                      fill="#E6C65C"
                      fillOpacity={0.4}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
                        borderColor: isDark ? '#333333' : '#E5E5E5',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-[#FAFAF8] dark:bg-[#1C1C1C] border border-[#E8E6DF] dark:border-[#2A2A2A] text-[11px] text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
              <span className="font-semibold text-[#111111] dark:text-white block mb-0.5">
                Explainability Notice:
              </span>
              Calculated using simulated SHAP feature attribution weights. High deviations in VPN or failed retries heavily influence the final gradient boost score.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
