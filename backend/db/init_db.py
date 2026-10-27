import json
from .database import engine, SessionLocal, Base
from .models import LoginEventModel, SecurityAlertModel, UserAccountModel, RiskThresholdSettingsModel

INITIAL_THRESHOLDS = {
    "id": 1,
    "low_max": 39,
    "medium_max": 69,
    "high_min": 70,
    "enable_otp_on_medium": True,
    "strict_vpn_policy": False,
    "max_failed_attempts_lock": 5,
    "alert_email_distribution": "admin@riskauth.ai",
    "auto_quarantine_threshold": 70
}

INITIAL_USERS = [
    {
        "id": "usr_01",
        "name": "Elena Rostova",
        "email": "elena.rostova@enterprise.corp",
        "role": "Security Admin",
        "status": "Active",
        "risk_level": "LOW",
        "avg_risk_score": 14,
        "last_login": "2 mins ago",
        "trusted_devices_count": 2,
        "department": "Engineering",
    },
    {
        "id": "usr_02",
        "name": "Marcus Vance",
        "email": "marcus.vance@enterprise.corp",
        "role": "DevOps Lead",
        "status": "Active",
        "risk_level": "LOW",
        "avg_risk_score": 18,
        "last_login": "18 mins ago",
        "trusted_devices_count": 3,
        "department": "Infrastructure",
    },
    {
        "id": "usr_03",
        "name": "Sofia Morales",
        "email": "sofia.morales@enterprise.corp",
        "role": "Platform Engineer",
        "status": "Active",
        "risk_level": "MEDIUM",
        "avg_risk_score": 48,
        "last_login": "1 hour ago",
        "trusted_devices_count": 1,
        "department": "Development",
    },
    {
        "id": "usr_04",
        "name": "Kaito Tanaka",
        "email": "kaito.tanaka@enterprise.corp",
        "role": "Security Analyst",
        "status": "Active",
        "risk_level": "LOW",
        "avg_risk_score": 12,
        "last_login": "3 hours ago",
        "trusted_devices_count": 2,
        "department": "Security",
    },
    {
        "id": "usr_05",
        "name": "David Okafor",
        "email": "david.okafor@enterprise.corp",
        "role": "Finance Manager",
        "status": "Under Review",
        "risk_level": "HIGH",
        "avg_risk_score": 84,
        "last_login": "4 hours ago",
        "trusted_devices_count": 1,
        "department": "Finance",
    },
    {
        "id": "usr_06",
        "name": "Aria Stirling",
        "email": "aria.stirling@enterprise.corp",
        "role": "Product Manager",
        "status": "Active",
        "risk_level": "LOW",
        "avg_risk_score": 22,
        "last_login": "Yesterday",
        "trusted_devices_count": 2,
        "department": "Product",
    },
]

INITIAL_EVENTS = [
    {
        "id": "evt_1001",
        "user_email": "david.okafor@enterprise.corp",
        "user_name": "David Okafor",
        "timestamp": "2026-09-30 14:48:12",
        "ip_address": "185.220.101.5",
        "device": "Unknown Browser",
        "device_status": "unknown",
        "location": "Frankfurt, Germany",
        "location_status": "unusual",
        "vpn": True,
        "risk_score": 78,
        "risk_level": "HIGH",
        "decision": "BLOCK",
        "failed_attempts": 5,
        "behaviour": "suspicious",
        "login_time_status": "unusual",
        "risk_factors": json.dumps([
            "Unrecognized device hardware",
            "Unusual location detected",
            "Active VPN proxy detected",
            "5 failed login attempts",
        ]),
    },
    {
        "id": "evt_1002",
        "user_email": "sofia.morales@enterprise.corp",
        "user_name": "Sofia Morales",
        "timestamp": "2026-09-30 14:12:05",
        "ip_address": "82.165.197.12",
        "device": "Firefox / Windows",
        "device_status": "unknown",
        "location": "London, UK",
        "location_status": "unusual",
        "vpn": False,
        "risk_score": 48,
        "risk_level": "MEDIUM",
        "decision": "OTP",
        "failed_attempts": 3,
        "behaviour": "normal",
        "login_time_status": "normal",
        "risk_factors": json.dumps([
            "Unrecognized device hardware",
            "Unusual location detected",
            "3 failed login attempts",
        ]),
    },
    {
        "id": "evt_1003",
        "user_email": "elena.rostova@enterprise.corp",
        "user_name": "Elena Rostova",
        "timestamp": "2026-09-30 13:55:40",
        "ip_address": "192.168.1.104",
        "device": "Chrome / macOS",
        "device_status": "trusted",
        "location": "San Francisco, CA",
        "location_status": "normal",
        "vpn": False,
        "risk_score": 5,
        "risk_level": "LOW",
        "decision": "ALLOW",
        "failed_attempts": 0,
        "behaviour": "normal",
        "login_time_status": "normal",
        "risk_factors": json.dumps([]),
    },
    {
        "id": "evt_1004",
        "user_email": "marcus.vance@enterprise.corp",
        "user_name": "Marcus Vance",
        "timestamp": "2026-09-30 12:30:18",
        "ip_address": "192.168.1.110",
        "device": "Chrome / Linux",
        "device_status": "trusted",
        "location": "San Francisco, CA",
        "location_status": "normal",
        "vpn": False,
        "risk_score": 12,
        "risk_level": "LOW",
        "decision": "ALLOW",
        "failed_attempts": 0,
        "behaviour": "normal",
        "login_time_status": "normal",
        "risk_factors": json.dumps([]),
    },
    {
        "id": "evt_1005",
        "user_email": "kaito.tanaka@enterprise.corp",
        "user_name": "Kaito Tanaka",
        "timestamp": "2026-09-30 11:15:00",
        "ip_address": "192.168.1.115",
        "device": "Safari / macOS",
        "device_status": "trusted",
        "location": "San Jose, CA",
        "location_status": "normal",
        "vpn": False,
        "risk_score": 8,
        "risk_level": "LOW",
        "decision": "ALLOW",
        "failed_attempts": 0,
        "behaviour": "normal",
        "login_time_status": "normal",
        "risk_factors": json.dumps([]),
    },
    {
        "id": "evt_1006",
        "user_email": "david.okafor@enterprise.corp",
        "user_name": "David Okafor",
        "timestamp": "2026-09-30 10:02:44",
        "ip_address": "185.220.101.45",
        "device": "Unknown Browser",
        "device_status": "unknown",
        "location": "Frankfurt, Germany",
        "location_status": "unusual",
        "vpn": True,
        "risk_score": 82,
        "risk_level": "HIGH",
        "decision": "BLOCK",
        "failed_attempts": 6,
        "behaviour": "suspicious",
        "login_time_status": "unusual",
        "risk_factors": json.dumps([
            "Unrecognized device hardware",
            "Unusual location detected",
            "Active VPN proxy detected",
            "6 failed login attempts",
        ]),
    },
]

INITIAL_ALERTS = [
    {
        "id": "alt_01",
        "title": "High-Risk Login Blocked (78%)",
        "severity": "critical",
        "timestamp": "15 minutes ago",
        "user_email": "david.okafor@enterprise.corp",
        "risk_score": 78,
        "status": "active",
        "description": "High-risk login blocked from IP 185.220.101.5. Signals: Unknown Device, Unusual Location, Active VPN, 5 Failed Attempts.",
        "signals": json.dumps({
            "device": "Unknown Browser",
            "ip": "185.220.101.5",
            "location": "Frankfurt, Germany",
            "vpn": True,
            "failedAttempts": 5,
        }),
        "recommended_action": "Verify user credentials and check for unauthorized access attempts.",
        "event_id": "evt_1001"
    },
    {
        "id": "alt_02",
        "title": "High-Risk Login Blocked (82%)",
        "severity": "critical",
        "timestamp": "4 hours ago",
        "user_email": "david.okafor@enterprise.corp",
        "risk_score": 82,
        "status": "active",
        "description": "High-risk login blocked from IP 185.220.101.45. Signals: Unknown Device, Unusual Location, Active VPN, 6 Failed Attempts.",
        "signals": json.dumps({
            "device": "Unknown Browser",
            "ip": "185.220.101.45",
            "location": "Frankfurt, Germany",
            "vpn": True,
            "failedAttempts": 6,
        }),
        "recommended_action": "Verify user credentials or trigger password reset.",
        "event_id": "evt_1006"
    },
]

def init_db():
    """Initializes tables and populates baseline seed records if empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Settings
        existing_settings = db.query(RiskThresholdSettingsModel).first()
        if not existing_settings:
            db.add(RiskThresholdSettingsModel(**INITIAL_THRESHOLDS))
            db.commit()

        # Users
        if db.query(UserAccountModel).count() == 0:
            for u in INITIAL_USERS:
                db.add(UserAccountModel(**u))
            db.commit()

        # Login Events
        if db.query(LoginEventModel).count() == 0:
            for e in INITIAL_EVENTS:
                db.add(LoginEventModel(**e))
            db.commit()

        # Alerts
        if db.query(SecurityAlertModel).count() == 0:
            for a in INITIAL_ALERTS:
                db.add(SecurityAlertModel(**a))
            db.commit()

        print("[SUCCESS] Database initialized and seeded successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
