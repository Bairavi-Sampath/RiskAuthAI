import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  CreditCard,
  Database,
  ExternalLink,
  Flame,
  Globe,
  Laptop,
  Layers,
  Lock,
  MousePointer,
  Network,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { RiskSimulator } from '../components/simulator/RiskSimulator';

export const LandingPage: React.FC = () => {
  // Hero interactive card state
  const [heroState, setHeroState] = useState<'normal' | 'medium' | 'high'>('normal');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const heroCardConfig = {
    normal: {
      score: 12,
      level: 'LOW RISK',
      decision: 'LOGIN ALLOWED',
      device: 'Trusted Corporate Laptop ✓',
      location: 'Primary Region (San Francisco) ✓',
      vpn: 'Direct Residential ISP ✓',
      failed: '0 Prior Retries ✓',
      behaviour: 'Natural Typing Cadence ✓',
      badgeClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      decisionColor: 'text-emerald-600 dark:text-emerald-400',
      barColor: 'bg-emerald-500',
    },
    medium: {
      score: 54,
      level: 'MEDIUM RISK',
      decision: 'OTP CHALLENGE REQUIRED',
      device: 'Unrecognized Browser / OS ⚠',
      location: 'Unusual Geo Shift (London, UK) ⚠',
      vpn: 'Direct Connection ✓',
      failed: '2 Recent Password Retries ⚠',
      behaviour: 'Human Interaction Dynamics ✓',
      badgeClass: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      decisionColor: 'text-amber-600 dark:text-amber-400',
      barColor: 'bg-[#E6C65C]',
    },
    high: {
      score: 89,
      level: 'HIGH RISK',
      decision: 'ACCESS BLOCKED + INCIDENT CREATED',
      device: 'Headless Script / Bot Identifier ✗',
      location: 'Tor Exit Relay / Data Center ✗',
      vpn: 'Active VPN / Proxy Anonymizer ✗',
      failed: '5+ Consecutive Failures (Brute Force) ✗',
      behaviour: 'Automated Keystroke Entropy ✗',
      badgeClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      decisionColor: 'text-rose-600 dark:text-rose-400',
      barColor: 'bg-rose-600',
    },
  }[heroState];

  const faqs = [
    {
      q: 'What is Risk-Based Authentication (RBA)?',
      a: 'Risk-Based Authentication is an adaptive security model that evaluates the context and telemetry of each login attempt in real time. Instead of treating every correct password equally, it scores threat signals to decide whether to allow immediate login, prompt for a step-up challenge (OTP/FIDO2), or block suspicious traffic at the perimeter.',
    },
    {
      q: 'What signals does the RiskAuthAI ML model analyze?',
      a: 'The Random Forest model evaluates six correlated threat vectors: device hardware trust fingerprint, geographic location variance, commercial VPN and proxy detection, preceding failed attempt velocity, temporal schedule deviation, and behavioral interaction dynamics (typing cadence and cursor entropy).',
    },
    {
      q: 'How does explainable AI (SHAP) work here?',
      a: 'Every risk score is backed by SHAP (SHapley Additive exPlanations) TreeExplainer attribution. For each login, the backend computes exact numerical point contributions for every signal (e.g. -7.7 pts for trusted device vs +18.4 pts for proxy access), allowing SOC analysts to see exactly why a login was challenged or blocked.',
    },
    {
      q: 'What happens during medium-risk logins?',
      a: 'When an authentication session falls between the medium thresholds (40 to 69), RiskAuthAI automatically triggers an adaptive step-up verification challenge (such as a time-based one-time password or security key) to confirm user identity without blocking legitimate employees.',
    },
    {
      q: 'What happens during high-risk logins?',
      a: 'Logins scoring 70 or above—indicating credential stuffing, distributed brute force, or malicious proxy rotation—are blocked immediately before session tokens are issued. A high-priority security alert is dispatched directly to the security operations queue.',
    },
    {
      q: 'How does RiskAuthAI integrate with existing systems?',
      a: 'RiskAuthAI operates as an intelligent microservice with REST APIs (FastAPI) and Prometheus monitoring. It easily integrates into existing identity providers, Okta, Keycloak, Auth0, or custom web and mobile authentication backends.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] dark:bg-[#0F0F0F] text-[#111111] dark:text-[#F4F4F2] transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E6DF] dark:bg-[#1E1E1E] text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                <span className="w-2 h-2 rounded-full bg-[#E6C65C] animate-pulse" />
                <span>AI Risk-Based Authentication</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2] leading-[1.1] text-balance">
                Continuous AI Authentication & Adaptive Threat Defense
              </h1>

              <p className="text-base sm:text-lg text-[#55524A] dark:text-[#A8A49C] leading-relaxed max-w-2xl">
                Evaluate authentication risk in real time using a trained Random Forest model with SHAP explainability. Stop credential stuffing, automated bots, and brute force attacks before tokens are granted.
              </p>

              {/* CTAs with clear visual hierarchy */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#simulator"
                  className="px-6 py-3.5 rounded-lg bg-[#E6C65C] text-[#111111] hover:bg-[#D8B74A] font-bold text-sm tracking-wide transition-all shadow-sm flex items-center gap-2 group whitespace-nowrap cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Launch Risk Simulator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 rounded-lg bg-[#111111] text-white hover:bg-[#282828] dark:bg-[#1F1F1F] dark:text-white dark:hover:bg-[#2A2A2A] font-semibold text-sm tracking-wide transition-all border border-transparent dark:border-[#333333] shadow-xs whitespace-nowrap"
                >
                  Open Security Console
                </Link>

                <Link
                  to="/login"
                  className="px-5 py-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#141414] hover:bg-[#F2F0E8] dark:hover:bg-[#1E1E1E] text-[#111111] dark:text-white font-semibold text-sm tracking-wide transition-colors whitespace-nowrap"
                >
                  Interactive Demo Login
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#66635C] dark:text-[#8E8B84] font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> 6 Threat Signals
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Random Forest + SHAP
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Sub-35ms Latency
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Prometheus Telemetry
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Live Decision Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-white dark:bg-[#171717] border border-[#E8E6DF] dark:border-[#282828] rounded-2xl p-6 sm:p-7 shadow-lg">
                {/* Header with state toggles */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF] dark:border-[#282828]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white">
                      Authentication Gate
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F0EEE6] dark:bg-[#222222] p-1 rounded-md text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setHeroState('normal')}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        heroState === 'normal'
                          ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white font-semibold shadow-xs'
                          : 'text-[#66635C] dark:text-[#9E9B93]'
                      }`}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroState('medium')}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        heroState === 'medium'
                          ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white font-semibold shadow-xs'
                          : 'text-[#66635C] dark:text-[#9E9B93]'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroState('high')}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        heroState === 'high'
                          ? 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white font-semibold shadow-xs'
                          : 'text-[#66635C] dark:text-[#9E9B93]'
                      }`}
                    >
                      High
                    </button>
                  </div>
                </div>

                {/* Risk Score Lockup */}
                <div className="mt-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93] font-medium">
                      EVALUATED RISK SCORE
                    </span>
                    <div className="text-4xl font-extrabold font-mono tracking-tight text-[#111111] dark:text-white tabular-nums">
                      {heroCardConfig.score}
                      <span className="text-base text-[#88857E] font-normal">/100</span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${heroCardConfig.badgeClass}`}
                  >
                    {heroCardConfig.level}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 w-full bg-[#EFECE6] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${heroCardConfig.barColor}`}
                    style={{ width: `${heroCardConfig.score}%` }}
                  />
                </div>

                {/* Evaluated Signal Checklist */}
                <div className="mt-6 space-y-2.5 pt-4 border-t border-[#E8E6DF] dark:border-[#282828] text-xs">
                  <div className="flex items-center justify-between text-[#44423C] dark:text-[#CCCCCC]">
                    <span>Hardware Device</span>
                    <span className="font-mono font-medium">{heroCardConfig.device}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#44423C] dark:text-[#CCCCCC]">
                    <span>Location Context</span>
                    <span className="font-mono font-medium">{heroCardConfig.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#44423C] dark:text-[#CCCCCC]">
                    <span>Network & Proxy</span>
                    <span className="font-mono font-medium">{heroCardConfig.vpn}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#44423C] dark:text-[#CCCCCC]">
                    <span>Password Retries</span>
                    <span className="font-mono font-medium">{heroCardConfig.failed}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#44423C] dark:text-[#CCCCCC]">
                    <span>Biometric Cadence</span>
                    <span className="font-mono font-medium">{heroCardConfig.behaviour}</span>
                  </div>
                </div>

                {/* Final Decision Box */}
                <div className="mt-6 p-4 rounded-xl bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                    POLICY DECISION
                  </span>
                  <div className={`mt-1 text-sm font-extrabold tracking-wide ${heroCardConfig.decisionColor}`}>
                    {heroCardConfig.decision}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-16 bg-[#FAFAF8] dark:bg-[#121212] border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Contextual Ingestion
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Every Login Evaluated in Milliseconds
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              RiskAuthAI analyzes multiple contextual vectors across hardware, network, location, and behavioral telemetry.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Device Trust', icon: Laptop, desc: 'Hardware signature & browser cookie' },
              { label: 'Geolocation', icon: Globe, desc: 'Primary region & travel velocity' },
              { label: 'Network / VPN', icon: Shield, desc: 'Datacenter proxy & Tor exit nodes' },
              { label: 'Failed Retries', icon: Lock, desc: 'Consecutive authentication failures' },
              { label: 'Time of Day', icon: Clock, desc: 'Historical active access window' },
              { label: 'Behavior Dynamics', icon: MousePointer, desc: 'Human typing & mouse cadence' },
            ].map((sig, i) => {
              const Icon = sig.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white dark:bg-[#181818] border border-[#E8E6DF] dark:border-[#262626] flex flex-col items-center text-center hover:border-[#E6C65C] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F8F7F3] dark:bg-[#222222] flex items-center justify-center text-[#111111] dark:text-[#E6C65C]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-[#111111] dark:text-white">
                    {sig.label}
                  </h3>
                  <p className="mt-1 text-[11px] text-[#66635C] dark:text-[#9E9B93] leading-snug">
                    {sig.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Risk Engine Simulator Section */}
      <section id="simulator" className="py-20 border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Live Simulation Playground
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Test the AI Risk Engine in Real Time
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              Toggle contextual inputs below to see the Random Forest model generate risk scores, SHAP explanations, and policy actions.
            </p>
          </div>

          <RiskSimulator showConsoleAction={true} />
        </div>
      </section>

      {/* Adaptive Decision Tiers Section */}
      <section className="py-20 bg-[#FAFAF8] dark:bg-[#121212] border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Policy Enforcement
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Adaptive Thresholds & Response
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              Proportionate security responses replace rigid rules with intelligent access tiers.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LOW RISK */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#181818] border border-emerald-200 dark:border-emerald-900/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    LOW RISK
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Score 0–39
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#111111] dark:text-white">
                  ALLOW (Seamless Login)
                </h3>
                <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                  Known trusted device, regular login region, direct residential/office connection, zero failed attempts. User gains instant frictionless access.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0EEE6] dark:border-[#262626] text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Action: Instant Authorization
              </div>
            </div>

            {/* MEDIUM RISK */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#181818] border border-amber-200 dark:border-amber-900/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    MEDIUM RISK
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Score 40–69
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#111111] dark:text-white">
                  OTP CHALLENGE (Step-Up)
                </h3>
                <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                  Valid credentials with moderate variance: new device, travel location shift, or minor password retries. Prompts for a 2FA OTP code.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0EEE6] dark:border-[#262626] text-[11px] font-mono text-amber-600 dark:text-amber-400">
                Action: Step-Up Verification
              </div>
            </div>

            {/* HIGH RISK */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#181818] border border-rose-200 dark:border-rose-900/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    HIGH RISK
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    Score 70–100
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#111111] dark:text-white">
                  BLOCK (Lockout & Alert)
                </h3>
                <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                  Severe threat profile: 5+ failed attempts (brute force), Tor exit relay, bot velocity, or credential stuffing. Blocked immediately at perimeter.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0EEE6] dark:border-[#262626] text-[11px] font-mono text-rose-600 dark:text-rose-400">
                Action: Perimeter Lockout & Security Alert
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Capabilities Grid */}
      <section className="py-20 border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Production Features
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Built for Modern Security Operations
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              Transparent, explainable, and production-ready architecture designed for enterprise integration.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Random Forest Risk Model',
                desc: 'Trained on correlated attack patterns, detecting credential stuffing and brute force attempts with high accuracy.',
                icon: Brain,
              },
              {
                title: 'Explainable AI with SHAP',
                desc: 'Calculates exact per-instance feature weights via TreeExplainer, revealing why any session was allowed, challenged, or blocked.',
                icon: Sliders,
              },
              {
                title: 'Zero-Friction Authentication',
                desc: 'Eliminates MFA fatigue by allowing trusted sessions without prompts while stepping up security only when risk spikes.',
                icon: ShieldCheck,
              },
              {
                title: 'FastAPI Backend Engine',
                desc: 'Sub-35ms prediction latency guarantees negligible overhead in high-throughput enterprise sign-in workflows.',
                icon: Zap,
              },
              {
                title: 'Prometheus & Grafana Telemetry',
                desc: 'Exposes request throughput, response latency, and decision counters without logging passwords, tokens, or PII.',
                icon: Activity,
              },
              {
                title: 'Persistent Audit Storage',
                desc: 'Full forensic logging of all login events, active incident alerts, and administrative policy threshold management.',
                icon: Database,
              },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] hover:border-[#E6C65C] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F8F7F3] dark:bg-[#222222] flex items-center justify-center text-[#111111] dark:text-[#E6C65C]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#111111] dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 bg-[#FAFAF8] dark:bg-[#121212] border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Technical Answers
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#181818] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-[#111111] dark:text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#66635C] dark:text-[#9E9B93] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#55524A] dark:text-[#A8A49C] leading-relaxed border-t border-[#F0EEE6] dark:border-[#222222]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
            <ShieldCheck className="w-4 h-4 text-[#E6C65C]" />
            <span>Ready to Protect Authentication Traffic?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] dark:text-white">
            Make Every Login a Risk-Aware Decision
          </h2>

          <p className="text-sm sm:text-base text-[#55524A] dark:text-[#9E9B93] max-w-xl mx-auto leading-relaxed">
            Stop account takeover attacks while keeping trusted users frictionless. Explore the simulator or open the live security operations console.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-lg bg-[#E6C65C] text-[#111111] hover:bg-[#D8B74A] font-bold text-sm tracking-wide transition-all shadow-sm"
            >
              Open Security Console
            </Link>
            <a
              href="#simulator"
              className="px-6 py-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#181818] hover:bg-[#F2F0E8] dark:hover:bg-[#222222] text-[#111111] dark:text-white font-semibold text-sm tracking-wide transition-colors cursor-pointer"
            >
              Test Risk Simulator
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
