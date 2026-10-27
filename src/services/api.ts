/**
 * RiskAuthAI API Client Layer
 *
 * Connects directly to the FastAPI + Machine Learning + SQLite Backend.
 * Base URL: http://localhost:8000
 */

import { evaluateLoginRisk } from './riskEngine';
import {
  LoginEvent,
  LoginSignals,
  RiskAssessmentResult,
  RiskThresholdSettings,
  SecurityAlert,
  UserAccount,
} from './types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL !== undefined
  ? (import.meta as any).env.VITE_API_URL
  : 'http://localhost:8000';

// In-memory / localStorage JWT Auth token management
let memoryToken: string | null = null;

export const getAuthToken = (): string | null => {
  if (memoryToken) return memoryToken;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('riskauth_jwt_token');
  }
  return null;
};

export const setAuthToken = (token: string | null): void => {
  memoryToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    if (token) {
      window.localStorage.setItem('riskauth_jwt_token', token);
    } else {
      window.localStorage.removeItem('riskauth_jwt_token');
    }
  }
};

export const api = {
  /**
   * Authenticates administrative user with backend and stores JWT access token
   * Real endpoint: POST http://localhost:8000/api/v1/auth/login
   */
  async login(username?: string, password?: string): Promise<string> {
    // If credentials are not provided, check if a valid token is already present
    const existing = getAuthToken();
    if (existing && !username && !password) {
      return existing;
    }

    const user = username || 'admin@riskauth.ai';
    const pass = password || 'RiskAuthAdmin2026!';

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: user, password: pass }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed with status ${response.status}`);
    }

    const data = await response.json();
    setAuthToken(data.access_token);
    return data.access_token;
  },

  /**
   * Ensures a valid Bearer token is present, auto-authenticating with session credentials if needed.
   */
  async ensureAuth(): Promise<string> {
    const existing = getAuthToken();
    if (existing) return existing;
    return await this.login();
  },

  /**
   * Evaluates login signals through the FastAPI + Random Forest ML Risk Engine
   * Real endpoint: POST http://localhost:8000/api/v1/evaluate-risk
   */
  async evaluateRisk(signals: LoginSignals): Promise<RiskAssessmentResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/evaluate-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signals),
      });

      if (response.ok) {
        const data = await response.json();
        return data as RiskAssessmentResult;
      }
    } catch (error) {
      console.warn('Backend API connection failed, falling back to local ML simulator:', error);
    }
    // Fallback if backend API is not running
    return evaluateLoginRisk(signals);
  },

  /**
   * Fetches historical login events from persistent database
   * Real endpoint: GET http://localhost:8000/api/v1/login-events
   */
  async getLoginEvents(): Promise<LoginEvent[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/login-events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch login events: ${response.statusText}`);
    }

    const data = await response.json();
    return data as LoginEvent[];
  },

  /**
   * Adds a new login event into the database
   * Real endpoint: POST http://localhost:8000/api/v1/login-events
   */
  async recordLoginEvent(event: Omit<LoginEvent, 'id' | 'timestamp'>): Promise<LoginEvent> {
    const response = await fetch(`${API_BASE_URL}/api/v1/login-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Failed to record login event: ${response.statusText}`);
    }

    const data = await response.json();
    return data as LoginEvent;
  },

  /**
   * Fetches active security alerts from persistent database
   * Real endpoint: GET http://localhost:8000/api/v1/alerts
   */
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/alerts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch security alerts: ${response.statusText}`);
    }

    const data = await response.json();
    return data as SecurityAlert[];
  },

  /**
   * Updates an alert status (requires administrative Bearer token)
   * Real endpoint: PATCH http://localhost:8000/api/v1/alerts/{id}
   */
  async updateAlertStatus(
    alertId: string,
    status: 'active' | 'investigating' | 'resolved'
  ): Promise<void> {
    const token = await this.ensureAuth();
    let response = await fetch(`${API_BASE_URL}/api/v1/alerts/${alertId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (response.status === 401) {
      // Token may have expired, retry once with fresh authentication
      const freshToken = await this.login();
      response = await fetch(`${API_BASE_URL}/api/v1/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`,
        },
        body: JSON.stringify({ status }),
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to update alert status: ${response.statusText}`);
    }
  },

  /**
   * Fetches user accounts directory from persistent database
   * Real endpoint: GET http://localhost:8000/api/v1/users
   */
  async getUsers(): Promise<UserAccount[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    return data as UserAccount[];
  },

  /**
   * Fetches dashboard metric summaries computed dynamically from database
   * Real endpoint: GET http://localhost:8000/api/v1/dashboard/metrics
   */
  async getDashboardMetrics() {
    const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard metrics: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Fetches system risk thresholds from persistent database
   * Real endpoint: GET http://localhost:8000/api/v1/settings/thresholds
   */
  async getSettings(): Promise<RiskThresholdSettings> {
    const response = await fetch(`${API_BASE_URL}/api/v1/settings/thresholds`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }

    const data = await response.json();
    return data as RiskThresholdSettings;
  },

  /**
   * Updates system risk thresholds in persistent database (requires administrative Bearer token)
   * Real endpoint: PUT http://localhost:8000/api/v1/settings/thresholds
   */
  async updateSettings(settings: Partial<RiskThresholdSettings>): Promise<RiskThresholdSettings> {
    const token = await this.ensureAuth();
    let response = await fetch(`${API_BASE_URL}/api/v1/settings/thresholds`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });

    if (response.status === 401) {
      // Token may have expired, retry once with fresh authentication
      const freshToken = await this.login();
      response = await fetch(`${API_BASE_URL}/api/v1/settings/thresholds`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`,
        },
        body: JSON.stringify(settings),
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to update settings: ${response.statusText}`);
    }

    const data = await response.json();
    return data as RiskThresholdSettings;
  },
};
