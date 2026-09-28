/**
 * RiskAuthAI API Client Layer
 *
 * Provides a clean interface for UI components. Currently connects to
 * isolated local mock stores, and is architected to switch to
 * `fetch('/api/v1/...')` once the FastAPI backend is deployed.
 */

import {
  MOCK_ACTIVITY_TIMELINE,
  MOCK_LOGIN_EVENTS,
  MOCK_RISK_DISTRIBUTION,
  MOCK_SECURITY_ALERTS,
  MOCK_SIGNAL_ANOMALY_BREAKDOWN,
  MOCK_USERS,
  INITIAL_THRESHOLDS,
} from './mockData';
import { evaluateLoginRisk } from './riskEngine';
import {
  LoginEvent,
  LoginSignals,
  RiskAssessmentResult,
  RiskThresholdSettings,
  SecurityAlert,
  UserAccount,
} from './types';

// In-memory state for the active session
let currentEvents: LoginEvent[] = [...MOCK_LOGIN_EVENTS];
let currentAlerts: SecurityAlert[] = [...MOCK_SECURITY_ALERTS];
let currentUsers: UserAccount[] = [...MOCK_USERS];
let currentThresholds: RiskThresholdSettings = { ...INITIAL_THRESHOLDS };

export const api = {
  /**
   * Evaluates login signals through the ML Risk Engine
   * Future endpoint: POST /api/v1/evaluate-risk
   */
  async evaluateRisk(signals: LoginSignals): Promise<RiskAssessmentResult> {
    // Simulated network delay of 120ms to mimic ML inference
    await new Promise((resolve) => setTimeout(resolve, 120));
    return evaluateLoginRisk(signals);
  },

  /**
   * Fetches historical login events
   * Future endpoint: GET /api/v1/login-events
   */
  async getLoginEvents(): Promise<LoginEvent[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return [...currentEvents];
  },

  /**
   * Adds a new login event (e.g. from the live simulator or login page)
   */
  async recordLoginEvent(event: Omit<LoginEvent, 'id' | 'timestamp'>): Promise<LoginEvent> {
    const newEvent: LoginEvent = {
      ...event,
      id: 'evt_' + Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    currentEvents = [newEvent, ...currentEvents];

    // If high risk, automatically trigger security alert
    if (newEvent.riskLevel === 'HIGH') {
      const newAlert: SecurityAlert = {
        id: 'alt_' + Math.random().toString(36).substring(2, 7),
        title: `High-Risk Authentication Blocked (${newEvent.riskScore}%)`,
        severity: 'critical',
        timestamp: 'Just now',
        userEmail: newEvent.userEmail,
        riskScore: newEvent.riskScore,
        status: 'active',
        description: `Login blocked from IP ${newEvent.ipAddress} (${newEvent.location}). Risk factors: ${newEvent.riskFactors.join(', ')}`,
        signals: {
          device: newEvent.device,
          ip: newEvent.ipAddress,
          location: newEvent.location,
          vpn: newEvent.vpn,
          failedAttempts: newEvent.failedAttempts,
        },
        recommendedAction: 'Verify session authenticity or reset user credentials.',
      };
      currentAlerts = [newAlert, ...currentAlerts];
    }

    return newEvent;
  },

  /**
   * Fetches active security alerts
   * Future endpoint: GET /api/v1/alerts
   */
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return [...currentAlerts];
  },

  /**
   * Updates an alert status
   * Future endpoint: PATCH /api/v1/alerts/{id}
   */
  async updateAlertStatus(
    alertId: string,
    status: 'active' | 'investigating' | 'resolved'
  ): Promise<void> {
    currentAlerts = currentAlerts.map((a) => (a.id === alertId ? { ...a, status } : a));
  },

  /**
   * Fetches user accounts
   * Future endpoint: GET /api/v1/users
   */
  async getUsers(): Promise<UserAccount[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return [...currentUsers];
  },

  /**
   * Fetches dashboard metric summaries
   * Future endpoint: GET /api/v1/dashboard/metrics
   */
  async getDashboardMetrics() {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const total = currentEvents.length;
    const low = currentEvents.filter((e) => e.riskLevel === 'LOW').length;
    const medium = currentEvents.filter((e) => e.riskLevel === 'MEDIUM').length;
    const high = currentEvents.filter((e) => e.riskLevel === 'HIGH').length;
    const blocked = currentEvents.filter((e) => e.decision === 'BLOCK').length;
    const otpRequired = currentEvents.filter((e) => e.decision === 'OTP').length;

    return {
      totalAttempts: 5240 + total,
      lowRiskCount: 4560 + low,
      mediumRiskCount: 512 + medium,
      highRiskCount: 168 + high,
      blockedCount: 142 + blocked,
      otpChallengedCount: 490 + otpRequired,
      activeAlertsCount: currentAlerts.filter((a) => a.status === 'active').length,
      activityTimeline: MOCK_ACTIVITY_TIMELINE,
      riskDistribution: MOCK_RISK_DISTRIBUTION,
      anomalyBreakdown: MOCK_SIGNAL_ANOMALY_BREAKDOWN,
    };
  },

  /**
   * Fetches system risk thresholds
   * Future endpoint: GET /api/v1/settings/thresholds
   */
  async getSettings(): Promise<RiskThresholdSettings> {
    return { ...currentThresholds };
  },

  /**
   * Updates system risk thresholds
   * Future endpoint: PUT /api/v1/settings/thresholds
   */
  async updateSettings(settings: Partial<RiskThresholdSettings>): Promise<RiskThresholdSettings> {
    currentThresholds = { ...currentThresholds, ...settings };
    return { ...currentThresholds };
  },
};
