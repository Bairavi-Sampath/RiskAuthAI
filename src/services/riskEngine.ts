/**
 * RiskAuthAI Risk Engine (Client-side Simulation)
 *
 * NOTE: In production, this module connects to the FastAPI + Machine Learning
 * backend endpoint (POST /api/v1/evaluate-risk).
 * For this demonstration, it replicates the ML model weights and scoring matrix.
 */

import {
  AuthDecision,
  DetailedFactor,
  LoginSignals,
  RiskAssessmentResult,
  RiskLevel,
} from './types';

export const PRESET_NORMAL: LoginSignals = {
  device: 'trusted',
  ipAddress: '192.168.1.104',
  location: 'normal',
  locationName: 'San Francisco, CA, USA',
  vpn: 'no',
  failedAttempts: 0,
  loginTime: 'normal',
  behaviour: 'normal',
  browser: 'Chrome 128 / macOS',
  os: 'macOS Sonoma',
};

export const PRESET_MEDIUM: LoginSignals = {
  device: 'unknown',
  ipAddress: '82.165.197.12',
  location: 'unusual',
  locationName: 'London, UK (Unusual for User)',
  vpn: 'no',
  failedAttempts: 3,
  loginTime: 'normal',
  behaviour: 'normal',
  browser: 'Firefox 130 / Windows',
  os: 'Windows 11',
};

export const PRESET_SUSPICIOUS: LoginSignals = {
  device: 'unknown',
  ipAddress: '185.220.101.45',
  location: 'unusual',
  locationName: 'Tor Exit Node / Frankfurt, Germany',
  vpn: 'yes',
  failedAttempts: 5,
  loginTime: 'unusual',
  behaviour: 'suspicious',
  browser: 'Headless Chromium / Linux',
  os: 'Linux x86_64',
};

/**
 * Calculates risk score (0-100) and returns the ML decision payload
 */
export function evaluateLoginRisk(signals: LoginSignals): RiskAssessmentResult {
  let score = 5; // Baseline floor risk
  const riskFactors: string[] = [];
  const detailedFactors: DetailedFactor[] = [];

  // 1. Device Trust
  if (signals.device === 'unknown') {
    score += 24;
    riskFactors.push('Unrecognized device hardware fingerprint');
    detailedFactors.push({
      title: 'Device Trust',
      status: 'warning',
      weight: 24,
      description: 'Device not observed in user 90-day device baseline ledger.',
    });
  } else {
    detailedFactors.push({
      title: 'Device Trust',
      status: 'positive',
      weight: 0,
      description: 'Matching SHA-256 hardware cookie & TLS client fingerprint.',
    });
  }

  // 2. Geolocation & Impossible Travel
  if (signals.location === 'unusual') {
    score += 20;
    riskFactors.push('Unusual geographic anomaly or impossible travel velocity');
    detailedFactors.push({
      title: 'Geolocation',
      status: 'warning',
      weight: 20,
      description: `Connection originating from ${signals.locationName || 'unregistered zone'}.`,
    });
  } else {
    detailedFactors.push({
      title: 'Geolocation',
      status: 'positive',
      weight: 0,
      description: 'Origin coordinates align with primary operating zone.',
    });
  }

  // 3. Commercial VPN / Anonymizer / Proxy
  if (signals.vpn === 'yes') {
    score += 25;
    riskFactors.push('Commercial VPN or anonymous exit relay detected');
    detailedFactors.push({
      title: 'Network / VPN',
      status: 'critical',
      weight: 25,
      description: 'Known proxy / hosting provider ASN detected.',
    });
  } else {
    detailedFactors.push({
      title: 'Network / VPN',
      status: 'positive',
      weight: 0,
      description: 'Residential / enterprise ISP with clean threat reputation score.',
    });
  }

  // 4. Failed Login Attempts
  if (signals.failedAttempts >= 5) {
    score += 22;
    riskFactors.push('5+ consecutive failed password submissions');
    detailedFactors.push({
      title: 'Failed Attempts',
      status: 'critical',
      weight: 22,
      description: 'Repeated authentication failures indicate automated brute-force pattern.',
    });
  } else if (signals.failedAttempts >= 3) {
    score += 12;
    riskFactors.push('3 consecutive failed password attempts');
    detailedFactors.push({
      title: 'Failed Attempts',
      status: 'warning',
      weight: 12,
      description: 'Elevated password retry count within 15-minute rolling window.',
    });
  } else {
    detailedFactors.push({
      title: 'Failed Attempts',
      status: 'positive',
      weight: 0,
      description: 'Zero preceding authentication failures recorded.',
    });
  }

  // 5. Login Time Anomaly
  if (signals.loginTime === 'unusual') {
    score += 10;
    riskFactors.push('Authentication out of typical user working hours');
    detailedFactors.push({
      title: 'Time of Day',
      status: 'warning',
      weight: 10,
      description: 'Login attempt occurs outside normal temporal activity window.',
    });
  } else {
    detailedFactors.push({
      title: 'Time of Day',
      status: 'positive',
      weight: 0,
      description: 'Timestamp aligns with historical active access schedule.',
    });
  }

  // 6. Behavioral Biometrics / Keystroke & Mouse Trajectory
  if (signals.behaviour === 'suspicious') {
    score += 18;
    riskFactors.push('Synthetic / automated interaction telemetry detected');
    detailedFactors.push({
      title: 'Interaction Biometrics',
      status: 'critical',
      weight: 18,
      description: 'Zero micro-mouse tremors, instantaneous form field injection.',
    });
  } else {
    detailedFactors.push({
      title: 'Interaction Biometrics',
      status: 'positive',
      weight: 0,
      description: 'Natural typing cadence and human mouse trajectory variance.',
    });
  }

  // Cap at 0-100
  const finalScore = Math.min(100, Math.max(0, score));

  let risk_level: RiskLevel = 'LOW';
  let decision: AuthDecision = 'ALLOW';
  let requires_otp = false;

  if (finalScore <= 39) {
    risk_level = 'LOW';
    decision = 'ALLOW';
    requires_otp = false;
  } else if (finalScore <= 69) {
    risk_level = 'MEDIUM';
    decision = 'OTP';
    requires_otp = true;
  } else {
    risk_level = 'HIGH';
    decision = 'BLOCK';
    requires_otp = false;
  }

  // Generate model explanation
  let explanation = '';
  if (risk_level === 'LOW') {
    explanation = 'Signals match trusted baseline: verified device fingerprint, established ISP, and normal behavioral biometric variance. Low probability of credential misuse.';
  } else if (risk_level === 'MEDIUM') {
    explanation = `Moderate deviation detected. ${riskFactors.slice(0, 2).join(' and ')}. Second-factor challenge (FIDO2 / OTP) required to confirm identity.`;
  } else {
    explanation = `Severe risk threshold breached (${finalScore}%). Concurrent anomalies detected: ${riskFactors.join(', ')}. Automated lockout enforced to protect sensitive enterprise resources.`;
  }

  return {
    risk_score: finalScore,
    risk_level,
    decision,
    requires_otp,
    risk_factors: riskFactors,
    detailed_factors: detailedFactors,
    explanation,
    evaluated_at: new Date().toISOString(),
    session_id: 'req_' + Math.random().toString(36).substring(2, 9),
    model_version: 'riskauth-xgb-v3.2',
  };
}
