import json
from sqlalchemy import Column, String, Integer, Boolean, Text
from .database import Base

class LoginEventModel(Base):
    __tablename__ = "login_events"

    id = Column(String(64), primary_key=True, index=True)
    user_email = Column(String(255), nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    timestamp = Column(String(64), nullable=False)
    ip_address = Column(String(64), nullable=False)
    device = Column(String(255), nullable=False)
    device_status = Column(String(32), nullable=False, default="trusted")
    location = Column(String(255), nullable=False)
    location_status = Column(String(32), nullable=False, default="normal")
    vpn = Column(Boolean, nullable=False, default=False)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(32), nullable=False)
    decision = Column(String(32), nullable=False)
    failed_attempts = Column(Integer, nullable=False, default=0)
    behaviour = Column(String(32), nullable=False, default="normal")
    login_time_status = Column(String(32), nullable=False, default="normal")
    risk_factors = Column(Text, nullable=False, default="[]")

    def to_dict(self):
        factors = []
        if self.risk_factors:
            try:
                factors = json.loads(self.risk_factors)
            except Exception:
                factors = []
        return {
            "id": self.id,
            "userEmail": self.user_email,
            "userName": self.user_name,
            "timestamp": self.timestamp,
            "ipAddress": self.ip_address,
            "device": self.device,
            "deviceStatus": self.device_status,
            "location": self.location,
            "locationStatus": self.location_status,
            "vpn": bool(self.vpn),
            "riskScore": int(self.risk_score),
            "riskLevel": self.risk_level,
            "decision": self.decision,
            "failedAttempts": int(self.failed_attempts),
            "behaviour": self.behaviour,
            "loginTimeStatus": self.login_time_status,
            "riskFactors": factors
        }


class SecurityAlertModel(Base):
    __tablename__ = "security_alerts"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(String(32), nullable=False) # 'critical', 'high', 'medium', 'low'
    timestamp = Column(String(64), nullable=False)
    user_email = Column(String(255), nullable=False, index=True)
    risk_score = Column(Integer, nullable=False)
    status = Column(String(32), nullable=False, default="active") # 'active', 'investigating', 'resolved'
    description = Column(Text, nullable=False)
    signals = Column(Text, nullable=False, default="{}")
    recommended_action = Column(String(255), nullable=False)
    event_id = Column(String(64), nullable=True, index=True) # Linked login event to avoid duplicates

    def to_dict(self):
        signals_dict = {}
        if self.signals:
            try:
                signals_dict = json.loads(self.signals)
            except Exception:
                signals_dict = {}
        return {
            "id": self.id,
            "title": self.title,
            "severity": self.severity,
            "timestamp": self.timestamp,
            "userEmail": self.user_email,
            "riskScore": int(self.risk_score),
            "status": self.status,
            "description": self.description,
            "signals": signals_dict,
            "recommendedAction": self.recommended_action
        }


class UserAccountModel(Base):
    __tablename__ = "user_accounts"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False, default="Active")
    risk_level = Column(String(32), nullable=False, default="LOW")
    avg_risk_score = Column(Integer, nullable=False, default=15)
    last_login = Column(String(64), nullable=False, default="Recently")
    trusted_devices_count = Column(Integer, nullable=False, default=1)
    department = Column(String(64), nullable=False, default="Engineering")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "status": self.status,
            "riskLevel": self.risk_level,
            "avgRiskScore": int(self.avg_risk_score),
            "lastLogin": self.last_login,
            "trustedDevicesCount": int(self.trusted_devices_count),
            "department": self.department
        }


class RiskThresholdSettingsModel(Base):
    __tablename__ = "risk_threshold_settings"

    id = Column(Integer, primary_key=True, default=1)
    low_max = Column(Integer, nullable=False, default=39)
    medium_max = Column(Integer, nullable=False, default=69)
    high_min = Column(Integer, nullable=False, default=70)
    enable_otp_on_medium = Column(Boolean, nullable=False, default=True)
    strict_vpn_policy = Column(Boolean, nullable=False, default=False)
    max_failed_attempts_lock = Column(Integer, nullable=False, default=5)
    alert_email_distribution = Column(String(255), nullable=False, default="admin@riskauth.ai")
    auto_quarantine_threshold = Column(Integer, nullable=False, default=70)

    def to_dict(self):
        return {
            "lowMax": int(self.low_max),
            "mediumMax": int(self.medium_max),
            "highMin": int(self.high_min),
            "enableOtpOnMedium": bool(self.enable_otp_on_medium),
            "strictVpnPolicy": bool(self.strict_vpn_policy),
            "maxFailedAttemptsLock": int(self.max_failed_attempts_lock),
            "alertEmailDistribution": self.alert_email_distribution,
            "autoQuarantineThreshold": int(self.auto_quarantine_threshold)
        }
