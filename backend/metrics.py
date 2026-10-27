"""
RiskAuthAI Prometheus Metrics Module
Defines Prometheus metric collectors with strictly bounded label cardinalities.
Ensures zero PII (no usernames, IPs, emails, or credentials) in metric labels.
"""

from prometheus_client import Counter, Histogram, REGISTRY, generate_latest, CONTENT_TYPE_LATEST
import re

# Bounded HTTP metrics
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total number of HTTP requests processed",
    ["method", "endpoint", "status_code"],
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

# Machine Learning specific performance metrics
ML_RISK_EVALUATION_DURATION_SECONDS = Histogram(
    "ml_risk_evaluation_duration_seconds",
    "Machine Learning risk model prediction and SHAP latency in seconds",
    ["model_version"],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0],
)

# Bounded Risk Decision metrics (ALLOW, OTP, BLOCK)
RISK_AUTH_DECISIONS_TOTAL = Counter(
    "risk_auth_decisions_total",
    "Total authentication policy decisions categorized by decision and risk level",
    ["decision", "risk_level"],
)

RISK_SCORE_DISTRIBUTION = Histogram(
    "risk_score_distribution",
    "Evaluated risk score distribution categorized by risk tier",
    ["risk_level"],
    buckets=[0, 20, 40, 60, 70, 80, 90, 100],
)

# Route normalization regex to prevent cardinality explosion from path parameters
ALERT_DETAIL_REGEX = re.compile(r"^/api/v1/alerts/[^/]+$")

def normalize_endpoint(path: str) -> str:
    """
    Normalizes variable request paths into static endpoint patterns.
    Prevents metric label cardinality explosion.
    """
    if ALERT_DETAIL_REGEX.match(path):
        return "/api/v1/alerts/{id}"

    known_endpoints = {
        "/health",
        "/metrics",
        "/api/v1/evaluate-risk",
        "/api/v1/auth/login",
        "/api/v1/auth/me",
        "/api/v1/login-events",
        "/api/v1/alerts",
        "/api/v1/users",
        "/api/v1/dashboard/metrics",
        "/api/v1/settings/thresholds",
        "/docs",
        "/openapi.json",
    }
    if path in known_endpoints:
        return path

    return "other"


def record_http_request(method: str, endpoint: str, status_code: int, duration_seconds: float) -> None:
    """Records HTTP request counts and latency with bounded labels."""
    normalized = normalize_endpoint(endpoint)
    HTTP_REQUESTS_TOTAL.labels(
        method=method.upper(),
        endpoint=normalized,
        status_code=str(status_code),
    ).inc()

    HTTP_REQUEST_DURATION_SECONDS.labels(
        method=method.upper(),
        endpoint=normalized,
    ).observe(duration_seconds)


def record_ml_evaluation(duration_seconds: float, model_version: str = "RandomForest-v2.0") -> None:
    """Records ML inference and SHAP calculation latency."""
    safe_version = str(model_version or "RandomForest-v2.0")
    ML_RISK_EVALUATION_DURATION_SECONDS.labels(model_version=safe_version).observe(duration_seconds)


def record_risk_decision(decision: str, risk_level: str, risk_score: int) -> None:
    """
    Records an authentication risk decision with bounded categorical labels.
    Guarantees no PII or telemetry data is used as metric labels.
    """
    bounded_decisions = {"ALLOW", "OTP", "BLOCK"}
    bounded_risk_levels = {"LOW", "MEDIUM", "HIGH"}

    safe_decision = decision.upper() if decision and decision.upper() in bounded_decisions else "UNKNOWN"
    safe_risk_level = risk_level.upper() if risk_level and risk_level.upper() in bounded_risk_levels else "UNKNOWN"

    RISK_AUTH_DECISIONS_TOTAL.labels(
        decision=safe_decision,
        risk_level=safe_risk_level,
    ).inc()

    RISK_SCORE_DISTRIBUTION.labels(risk_level=safe_risk_level).observe(float(risk_score))


def export_metrics() -> bytes:
    """Exports Prometheus metrics formatted for scraping."""
    return generate_latest(REGISTRY)
