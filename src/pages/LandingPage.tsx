import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
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
  Fingerprint,
  Globe,
  HelpCircle,
  KeyRound,
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
  UserCheck,
  Workflow,
  X,
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
      device: 'Trusted Device ✓',
      location: 'Normal Location (San Francisco) ✓',
      vpn: 'VPN: No ✓',
      failed: 'Failed Attempts: 0 ✓',
      behaviour: 'Normal Behaviour ✓',
      badgeClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      decisionColor: 'text-emerald-600 dark:text-emerald-400',
      barColor: 'bg-emerald-500',
    },
    medium: {
      score: 54,
      level: 'MEDIUM RISK',
      decision: 'OTP VERIFICATION REQUIRED',
      device: 'Unknown Device (Firefox / Win11) ⚠',
      location: 'Unusual Location (London, UK) ⚠',
      vpn: 'VPN: No ✓',
      failed: 'Failed Attempts: 3 ⚠',
      behaviour: 'Normal Behaviour ✓',
      badgeClass: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      decisionColor: 'text-amber-600 dark:text-amber-400',
      barColor: 'bg-[#E6C65C]',
    },
    high: {
      score: 89,
      level: 'HIGH RISK',
      decision: 'LOGIN BLOCKED + SECURITY ALERT',
      device: 'Headless Linux Automation ✗',
      location: 'Tor Exit Node / Frankfurt ✗',
      vpn: 'VPN: Yes (Tor) ✗',
      failed: 'Failed Attempts: 5+ (Brute Force) ✗',
      behaviour: 'Suspicious Telemetry ✗',
      badgeClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      decisionColor: 'text-rose-600 dark:text-rose-400',
      barColor: 'bg-rose-600',
    },
  }[heroState];

  const faqs = [
    {
      q: 'What is Risk-Based Authentication?',
      a: 'Risk-Based Authentication (RBA) is a dynamic access security model that assesses context and behavioural telemetry during every login attempt. Instead of treating every correct password equally, it scores real-time threat signals to decide whether to allow immediate login, challenge with step-up verification (OTP/FIDO2), or block suspicious traffic.',
    },
    {
      q: 'What signals does RiskAuthAI analyse?',
      a: 'RiskAuthAI ingests seven primary telemetry vectors: Hardware device fingerprint, IP reputation & ASN, Geolocation cluster & travel velocity, Commercial VPN & Tor presence, Preceding failed attempt velocity, Temporal/schedule variance, and Behavioral interaction dynamics (typing cadence and pointer entropy).',
    },
    {
      q: 'What happens during medium-risk login?',
      a: 'When an authentication session falls between 40% and 69% risk (for example, a legitimate employee using a new laptop or logging in from a conference overseas), RiskAuthAI seamlessly prompts for an adaptive verification challenge, such as a time-based one-time passcode (TOTP) or hardware security key.',
    },
    {
      q: 'What happens during high-risk login?',
      a: 'Logins scoring 70% or above (indicating credential stuffing, Tor relays, or brute-force velocity) are blocked at the perimeter before any session token is issued. A critical security incident is dispatched immediately to the SOC triage queue.',
    },
    {
      q: 'Does RiskAuthAI replace passwords?',
      a: 'No. RiskAuthAI works in synergy with existing credentials, passwordless passkeys, or Single Sign-On (SSO) providers. It provides an intelligent threat analysis layer that intercepts compromised or leaked credentials before attackers gain internal access.',
    },
    {
      q: 'Can RiskAuthAI connect to a machine-learning backend?',
      a: 'Yes. RiskAuthAI is built with a backend-ready architecture. The React frontend consumes a strictly typed API service layer (/services/api) ready to connect to a FastAPI microservice hosting scikit-learn or XGBoost inference pipelines backed by PostgreSQL.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] dark:bg-[#0F0F0F] transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                <span className="w-2 h-2 rounded-full bg-[#E6C65C]" />
                Machine Learning Login Anomaly Detection
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2] leading-[1.1] text-balance">
                Stop Suspicious Logins Before They Become Security Threats
              </h1>

              <p className="text-base sm:text-lg text-[#55524A] dark:text-[#A8A49C] leading-relaxed max-w-2xl">
                RiskAuthAI uses machine learning and multiple login signals to detect suspicious
                authentication attempts and decide whether to allow, verify, or block access.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 rounded-lg bg-[#111111] text-white hover:bg-[#282828] dark:bg-[#E6C65C] dark:text-[#111111] dark:hover:bg-[#D8B74A] font-semibold text-sm tracking-wide transition-all shadow-sm flex items-center gap-2 group whitespace-nowrap"
                >
                  <span>Try Live Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] hover:bg-[#F2F0E8] dark:hover:bg-[#242424] text-[#111111] dark:text-white font-semibold text-sm tracking-wide transition-colors whitespace-nowrap"
                >
                  How It Works
                </a>
              </div>

              {/* Micro proof line */}
              <div className="pt-4 flex items-center gap-6 text-xs text-[#66635C] dark:text-[#8E8B84] font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Multi-Signal Telemetry
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> 0–100 Risk Scoring
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Adaptive Step-Up MFA
                </span>
              </div>
            </div>

            {/* Right: Interactive Security Monitoring Card */}
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
                      className={`px-2 py-0.5 rounded transition-colors ${
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
                      className={`px-2 py-0.5 rounded transition-colors ${
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
                      className={`px-2 py-0.5 rounded transition-colors ${
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
                      RISK SCORE
                    </span>
                    <div className="text-4xl font-extrabold font-mono tracking-tight text-[#111111] dark:text-white tabular-nums">
                      {heroCardConfig.score}%
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
                    <span>Location</span>
                    <span className="font-mono font-medium">{heroCardConfig.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#44423C] dark:text-[#CCCCCC]">
                    <span>Network Anonymizer</span>
                    <span className="font-mono font-medium">{heroCardConfig.vpn}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#44423C] dark:text-[#CCCCCC]">
                    <span>Prior Retries</span>
                    <span className="font-mono font-medium">{heroCardConfig.failed}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#44423C] dark:text-[#CCCCCC]">
                    <span>Interaction Biometrics</span>
                    <span className="font-mono font-medium">{heroCardConfig.behaviour}</span>
                  </div>
                </div>

                {/* Final Decision Box */}
                <div className="mt-6 p-4 rounded-xl bg-[#F8F7F3] dark:bg-[#1F1F1F] border border-[#E8E6DF] dark:border-[#2A2A2A]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                    FINAL DECISION
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
              Contextual Telemetry
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Every Login Tells a Story.
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              RiskAuthAI evaluates multiple contextual vectors across hardware, network, location, and behavioural telemetry in milliseconds.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: 'Device', icon: Laptop, desc: 'TLS fingerprint & hardware signature' },
              { label: 'IP Address', icon: Network, desc: 'ASN reputation & threat feeds' },
              { label: 'Location', icon: Globe, desc: 'Geo-cluster & velocity speed' },
              { label: 'VPN', icon: Shield, desc: 'Datacenter proxy & Tor nodes' },
              { label: 'Login Time', icon: Clock, desc: 'Historical access schedule' },
              { label: 'Failed Attempts', icon: Lock, desc: 'Credential stuffing velocity' },
              { label: 'Behaviour', icon: MousePointer, desc: 'Keystroke & cursor dynamics' },
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

      {/* Problem / Solution Comparison */}
      <section className="py-20 border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              The Security Gap
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Passwords Alone Don't Understand Risk
            </h2>
            <p className="mt-3 text-sm text-[#55524A] dark:text-[#9E9B93] leading-relaxed">
              When an attacker acquires stolen credentials through credential stuffing or phishing,
              traditional authentication blindly grants complete access. RiskAuthAI analyzes the full attack context.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Traditional Flow Card */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF] dark:border-[#262626]">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Traditional Authentication
                  </span>
                  <span className="text-xs text-[#8A867E]">Binary Gate</span>
                </div>

                <div className="mt-8 flex flex-col items-center space-y-4 max-w-xs mx-auto text-center">
                  <div className="w-full py-3 px-4 rounded-lg bg-[#F8F7F3] dark:bg-[#202020] border border-[#E8E6DF] dark:border-[#2E2E2E] text-xs font-semibold text-[#111111] dark:text-white">
                    Password Submission
                  </div>
                  <ArrowDown className="w-4 h-4 text-[#88857E]" />
                  <div className="w-full py-3 px-4 rounded-lg bg-[#F8F7F3] dark:bg-[#202020] border border-[#E8E6DF] dark:border-[#2E2E2E] text-xs font-semibold text-[#111111] dark:text-white">
                    String Match Hash Check
                  </div>
                  <ArrowDown className="w-4 h-4 text-[#88857E]" />
                  <div className="w-full py-3 px-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-700 dark:text-rose-300">
                    Blind Access Granted (Even to Attackers)
                  </div>
                </div>
              </div>

              <p className="mt-8 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed pt-4 border-t border-[#E8E6DF] dark:border-[#262626]">
                Flaw: Lacks situational context. Stolen or phished corporate credentials bypass defenses undetected.
              </p>
            </div>

            {/* RiskAuthAI Flow Card */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#161616] border-2 border-[#E6C65C] dark:border-[#E6C65C]/80 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF] dark:border-[#262626]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-[#E6C65C]">
                    RiskAuthAI Adaptive Architecture
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#E6C65C]/20 text-[#111111] dark:text-[#E6C65C]">
                    Context-Aware
                  </span>
                </div>

                <div className="mt-8 flex flex-col items-center space-y-3 max-w-sm mx-auto text-center">
                  <div className="w-full py-2.5 px-4 rounded-lg bg-[#F8F7F3] dark:bg-[#202020] border border-[#E8E6DF] dark:border-[#2E2E2E] text-xs font-semibold">
                    1. Telemetry Collection (Device, IP, Geo, VPN, Biometrics)
                  </div>
                  <ArrowDown className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <div className="w-full py-2.5 px-4 rounded-lg bg-[#F8F7F3] dark:bg-[#202020] border border-[#E8E6DF] dark:border-[#2E2E2E] text-xs font-semibold">
                    2. AI Risk Analysis (Feature Extraction & Anomaly Scoring)
                  </div>
                  <ArrowDown className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <div className="w-full py-2.5 px-4 rounded-lg bg-[#F8F7F3] dark:bg-[#202020] border border-[#E8E6DF] dark:border-[#2E2E2E] text-xs font-semibold">
                    3. Risk Score (0–100) Computed
                  </div>
                  <ArrowDown className="w-3.5 h-3.5 text-[#E6C65C]" />
                  <div className="w-full py-2.5 px-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    4. Adaptive Action: Allow / Step-Up OTP / Block + Alert
                  </div>
                </div>
              </div>

              <p className="mt-8 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed pt-4 border-t border-[#E8E6DF] dark:border-[#262626]">
                Benefit: Eliminates unnecessary friction for trusted users while actively blocking malicious automated attempts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#FAFAF8] dark:bg-[#121212] border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Authentication Lifecycle
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              How RiskAuthAI Operates
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              Four streamlined stages safeguard every access request with sub-50ms latency.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Collect Signals',
                desc: 'Passive sensor collection of TLS client fingerprint, network routing, geolocation, timezone variance, and keystroke cadence.',
                icon: Layers,
              },
              {
                step: '02',
                title: 'Analyse Risk',
                desc: 'Features are standardized and compared against the user’s established 90-day baseline and global threat intelligence feeds.',
                icon: Brain,
              },
              {
                step: '03',
                title: 'Calculate Risk Score',
                desc: 'The machine learning scoring model outputs a deterministic risk confidence metric ranging from 0 to 100.',
                icon: Cpu,
              },
              {
                step: '04',
                title: 'Take Security Action',
                desc: 'Executes zero-friction login (0–39), adaptive OTP/MFA step-up (40–69), or immediate perimeter lockout (70–100).',
                icon: ShieldCheck,
              },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-white dark:bg-[#181818] border border-[#E8E6DF] dark:border-[#262626] relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black font-mono text-[#E6C65C]">
                        {st.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[#F8F7F3] dark:bg-[#242424] flex items-center justify-center text-[#111111] dark:text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[#111111] dark:text-white">
                      {st.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Risk Engine Simulator */}
      <section id="risk-engine" className="py-20 border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Live Authentication Simulator
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              See RiskAuthAI Think in Real Time
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              Toggle contextual inputs below to explore how the risk scoring engine adapts decisions between Allow, OTP Verification, and Block.
            </p>
          </div>

          <RiskSimulator />
        </div>
      </section>

      {/* Risk Levels Breakdown */}
      <section className="py-20 bg-[#FAFAF8] dark:bg-[#121212] border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Adaptive Thresholds
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Risk Tiers & Decision Policy
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              Continuous risk classification replaces rigid yes-or-no rules with proportionate security responses.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LOW RISK */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#181818] border border-emerald-200 dark:border-emerald-900/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    LOW RISK
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    0–39
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#111111] dark:text-white">
                  LOGIN ALLOWED
                </h3>
                <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                  Trusted hardware fingerprint, habitual geolocation, residential or corporate ISP, zero failed retries. The user authenticates smoothly with zero friction or delays.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0EEE6] dark:border-[#262626] text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Action: Seamless Authorization
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
                    40–69
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#111111] dark:text-white">
                  OTP VERIFICATION
                </h3>
                <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                  Recognized credentials but with moderate variance, such as an unfamiliar browser, mild location shift, or minor password retries. A fast step-up OTP challenge verifies identity.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0EEE6] dark:border-[#262626] text-[11px] font-mono text-amber-600 dark:text-amber-400">
                Action: Step-Up MFA Challenge
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
                    70–100
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#111111] dark:text-white">
                  LOGIN BLOCKED
                </h3>
                <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                  Severe anomaly cluster: Tor exit relay, 5+ password brute force retries, impossible geo-velocity, or headless automation. Access blocked instantly; high-priority security alert dispatched.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F0EEE6] dark:border-[#262626] text-[11px] font-mono text-rose-600 dark:text-rose-400">
                Action: Perimeter Lockout & Incident Dispatch
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Enterprise Capabilities
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Engineered for Modern Security Teams
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              Modular, explainable, and production-grade security tooling designed for seamless integration.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'AI Risk Prediction',
                desc: 'Gradient-boosted decision trees trained on credential stuffing and anomalous session patterns predict unauthorized access with extreme precision.',
                icon: Brain,
              },
              {
                title: 'Multi-Signal Analysis',
                desc: 'Synchronous ingestion across hardware, IP reputation, ASN categorization, travel velocity, and temporal deviation vectors.',
                icon: Layers,
              },
              {
                title: 'Adaptive Authentication',
                desc: 'Eliminates MFA fatigue by skipping challenges for trusted baseline sessions while stepping up security only when risk spikes.',
                icon: ShieldCheck,
              },
              {
                title: 'Real-Time Detection',
                desc: 'Sub-50 millisecond inference latency guarantees zero noticeable overhead in high-throughput enterprise sign-in workflows.',
                icon: Zap,
              },
              {
                title: 'Risk Scoring & Explainability',
                desc: 'Every classification includes explicit factor weights so security analysts can audit why a session was challenged or blocked.',
                icon: Sliders,
              },
              {
                title: 'Security Monitoring',
                desc: 'Centralized telemetry dashboard with live audit ledgers, automated incident queues, and user risk profiling.',
                icon: Activity,
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

      {/* Visual Architecture */}
      <section className="py-20 bg-[#FAFAF8] dark:bg-[#121212] border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Technical Pipeline
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              RiskAuthAI End-to-End Pipeline
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              From client submission to adaptive authorization enforcement.
            </p>
          </div>

          <div className="mt-14 max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] shadow-xs">
            {/* Steps in Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
              {[
                { title: 'LOGIN', sub: 'Client Attempt' },
                { title: 'SIGNALS', sub: 'Device / IP / Geo' },
                { title: 'FEATURES', sub: 'Vector Transform' },
                { title: 'ML MODEL', sub: 'XGBoost Inference' },
                { title: 'SCORE', sub: '0–100 Scale' },
                { title: 'DECISION', sub: 'Adaptive Engine' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#F8F7F3] dark:bg-[#202020] border border-[#E8E6DF] dark:border-[#2A2A2A]"
                >
                  <p className="text-xs font-bold font-mono text-[#111111] dark:text-white">
                    {step.title}
                  </p>
                  <p className="text-[10px] text-[#66635C] dark:text-[#9E9B93] mt-0.5">
                    {step.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* Split Outcomes */}
            <div className="mt-8 pt-6 border-t border-[#E8E6DF] dark:border-[#262626]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93] block text-center mb-4">
                Adaptive Decision Routing
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    LOW (0–39)
                  </span>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-1 block">
                    Direct Login Allowed
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                    MEDIUM (40–69)
                  </span>
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-1 block">
                    Step-Up OTP Challenge
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                    HIGH (70–100)
                  </span>
                  <span className="text-xs font-medium text-rose-700 dark:text-rose-400 mt-1 block">
                    Login Blocked + SOC Alert
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
                Console Preview
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
                Enterprise Security Console
              </h2>
              <p className="mt-1 text-sm text-[#66635C] dark:text-[#9E9B93]">
                Deep visibility into all authentication traffic with instant forensic drill-downs.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#111111] dark:text-[#E6C65C] hover:underline"
            >
              Open Full Security Console <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Realistic Console Mockup Card */}
          <div className="rounded-2xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] overflow-hidden shadow-sm">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#E8E6DF] dark:divide-[#262626] p-4 bg-[#FAFAF8] dark:bg-[#1A1A1A] text-xs">
              <div className="p-3">
                <span className="text-[#66635C] dark:text-[#9E9B93] block">Total Logins</span>
                <span className="text-xl font-bold font-mono text-[#111111] dark:text-white mt-1 block">
                  5,248
                </span>
              </div>
              <div className="p-3">
                <span className="text-[#66635C] dark:text-[#9E9B93] block">Low Risk</span>
                <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
                  4,562
                </span>
              </div>
              <div className="p-3">
                <span className="text-[#66635C] dark:text-[#9E9B93] block">Medium Risk</span>
                <span className="text-xl font-bold font-mono text-amber-600 mt-1 block">
                  518
                </span>
              </div>
              <div className="p-3">
                <span className="text-[#66635C] dark:text-[#9E9B93] block">High Risk</span>
                <span className="text-xl font-bold font-mono text-rose-600 mt-1 block">
                  168
                </span>
              </div>
              <div className="p-3">
                <span className="text-[#66635C] dark:text-[#9E9B93] block">Blocked Attempts</span>
                <span className="text-xl font-bold font-mono text-rose-700 dark:text-rose-400 mt-1 block">
                  142
                </span>
              </div>
            </div>

            {/* Recent Events Sample */}
            <div className="p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93] mb-3">
                Live Intercept Feed
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111] dark:text-white">
                        elena.rostova@enterprise.corp
                      </p>
                      <p className="text-[#66635C] dark:text-[#9E9B93] text-[11px]">
                        Trusted Device · Normal Location (San Francisco) · VPN: No
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-semibold text-emerald-600">Risk: 12%</span>
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-[11px]">
                      ALLOWED
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold">
                      ⚠
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111] dark:text-white">
                        sofia.morales@enterprise.corp
                      </p>
                      <p className="text-[#66635C] dark:text-[#9E9B93] text-[11px]">
                        Unknown Device · Location Shift (London) · 3 Failed Attempts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-semibold text-amber-600">Risk: 54%</span>
                    <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold text-[11px]">
                      OTP REQUIRED
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center font-bold">
                      ✗
                    </div>
                    <div>
                      <p className="font-semibold text-[#111111] dark:text-white">
                        david.okafor@enterprise.corp
                      </p>
                      <p className="text-[#66635C] dark:text-[#9E9B93] text-[11px]">
                        Tor Exit Relay · Frankfurt Node · 5+ Passwords Tried
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-semibold text-rose-600">Risk: 89%</span>
                    <span className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold text-[11px]">
                      BLOCKED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-[#FAFAF8] dark:bg-[#121212] border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Target Deployments
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Where RiskAuthAI Protects
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              Tailored risk thresholds for mission-critical infrastructure and public applications.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Web Applications',
                desc: 'Safeguard consumer user databases from credential stuffing, botnets, and automated credential spraying attacks without harming sign-up conversion.',
                icon: Globe,
              },
              {
                title: 'Banking & FinTech',
                desc: 'Prevent unauthorized wire transfers and account takeovers by enforcing step-up verification for suspicious IP shifts and proxy usage.',
                icon: CreditCard,
              },
              {
                title: 'Enterprise Systems',
                desc: 'Protect internal VPNs, SSO gates, and cloud consoles from compromised employee laptops and rogue contractor relays.',
                icon: Building2,
              },
              {
                title: 'SaaS Platforms',
                desc: 'Multi-tenant authentication security allowing organizational admins to inspect cross-tenant login health and policy thresholds.',
                icon: Server,
              },
            ].map((uc, i) => {
              const Icon = uc.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-white dark:bg-[#181818] border border-[#E8E6DF] dark:border-[#262626] flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-[#F8F7F3] dark:bg-[#222222] flex items-center justify-center text-[#111111] dark:text-[#E6C65C]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[#111111] dark:text-white">
                      {uc.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                      {uc.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
              Core Advantages
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Better Security Without Unnecessary Friction
            </h2>
            <p className="mt-2 text-sm text-[#66635C] dark:text-[#9E9B93]">
              Strike the optimal equilibrium between user convenience and high-assurance defense.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E6C65C]">
                01 · DETECT
              </span>
              <h3 className="mt-3 text-xl font-bold text-[#111111] dark:text-white">
                Identify Suspicious Login Patterns
              </h3>
              <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                Spot anomalous travel velocities, newly crafted machine identifiers, rapid password testing, and behavioral bot indicators before they execute.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E6C65C]">
                02 · VERIFY
              </span>
              <h3 className="mt-3 text-xl font-bold text-[#111111] dark:text-white">
                Request Additional Authentication When Risk Increases
              </h3>
              <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                Deliver prompt step-up challenges only when context warrants verification. Trusted sessions remain frictionless without disruptive prompt spam.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E6C65C]">
                03 · PROTECT
              </span>
              <h3 className="mt-3 text-xl font-bold text-[#111111] dark:text-white">
                Block High-Risk Authentication Attempts
              </h3>
              <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93] leading-relaxed">
                Automatically deny access to high-confidence adversary sessions, log immutable audit trails, and notify SOC analysts for proactive containment.
              </p>
            </div>
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

      {/* Final CTA */}
      <section className="py-20 border-b border-[#E8E6DF] dark:border-[#222222]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
            <ShieldCheck className="w-4 h-4 text-[#E6C65C]" />
            Enterprise-Grade Protection
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] dark:text-white">
            Make Every Login a Risk-Aware Decision
          </h2>

          <p className="text-sm sm:text-base text-[#55524A] dark:text-[#9E9B93] max-w-xl mx-auto leading-relaxed">
            Detect suspicious authentication attempts, verify uncertain users, and protect high-risk access with intelligent authentication.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 rounded-lg bg-[#111111] text-white hover:bg-[#262626] dark:bg-[#E6C65C] dark:text-[#111111] dark:hover:bg-[#D8B74A] font-semibold text-sm tracking-wide transition-all shadow-sm"
            >
              Launch Live Demo
            </Link>
            <a
              href="#risk-engine"
              className="px-6 py-3.5 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#181818] hover:bg-[#F2F0E8] dark:hover:bg-[#222222] text-[#111111] dark:text-white font-semibold text-sm tracking-wide transition-colors"
            >
              Explore Risk Engine
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
