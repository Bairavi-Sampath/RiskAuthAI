/**
 * RiskAuthAI Core Type Definitions
 * Designed for seamless eventual FastAPI + ML backend integration.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type AuthDecision = 'ALLOW' | 'OTP' | 'BLOCK';

export interface LoginSignals {
  device: 'trusted' | 'unknown';
  ipAddress: string;
  location: 'normal' | 'unusual';
  locationName: string;
  vpn: 'no' | 'yes';
  failedAttempts: number; // 0, 3, 5+
  loginTime: 'normal' | 'unusual';
  behaviour: 'normal' | 'suspicious';
  browser?: string;
  os?: string;
}

export interface DetailedFactor {
  title: string;
  status: 'positive' | 'warning' | 'critical';
  weight: number; // Contribution to score
  description: string;
}

export interface RiskAssessmentResult {
  risk_score: number; // 0 - 100
  risk_level: RiskLevel;
  decision: AuthDecision;
  requires_otp: boolean;
  risk_factors: string[];
  detailed_factors: DetailedFactor[];
  explanation: string;
  evaluated_at: string;
  session_id: string;
  model_version: string;
}

export interface LoginEvent {
  id: string;
  userEmail: string;
  userName: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  deviceStatus: 'trusted' | 'unknown';
  location: string;
  locationStatus: 'normal' | 'unusual';
  vpn: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: AuthDecision;
  failedAttempts: number;
  behaviour: 'normal' | 'suspicious';
  loginTimeStatus: 'normal' | 'unusual';
  riskFactors: string[];
}

export interface SecurityAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  userEmail: string;
  riskScore: number;
  status: 'active' | 'investigating' | 'resolved';
  description: string;
  signals: {
    device: string;
    ip: string;
    location: string;
    vpn: boolean;
    failedAttempts: number;
  };
  recommendedAction: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Security Admin' | 'DevOps Lead' | 'Platform Engineer' | 'SOC Analyst' | 'Finance Director' | 'Product Manager';
  status: 'Active' | 'Under Review' | 'Suspended';
  riskLevel: RiskLevel;
  avgRiskScore: number;
  lastLogin: string;
  trustedDevicesCount: number;
  department: string;
}

export interface RiskThresholdSettings {
  lowMax: number; // Default 39
  mediumMax: number; // Default 69
  highMin: number; // Default 70
  enableOtpOnMedium: boolean;
  strictVpnPolicy: boolean;
  maxFailedAttemptsLock: number;
  alertEmailDistribution: string;
  autoQuarantineThreshold: number;
}
