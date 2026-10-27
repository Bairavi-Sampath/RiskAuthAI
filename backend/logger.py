"""
RiskAuthAI Structured JSON Logging & Data Redaction Module
Provides structured JSON log formatting and automated redaction of sensitive credentials.
"""

import logging
import json
from datetime import datetime, timezone
from typing import Any, Dict, Set
from config import settings

SENSITIVE_KEYS: Set[str] = {
    "password",
    "secret",
    "token",
    "access_token",
    "jwt",
    "authorization",
    "credentials",
    "api_key",
    "client_secret",
}

def sanitize_value(key: str, value: Any) -> Any:
    """Recursively redacts sensitive values based on key names and content patterns."""
    normalized_key = key.lower().replace("-", "_").strip()
    if any(sensitive in normalized_key for sensitive in SENSITIVE_KEYS):
        return "[REDACTED]"

    if isinstance(value, dict):
        return {k: sanitize_value(k, v) for k, v in value.items()}
    elif isinstance(value, list):
        return [sanitize_value(key, item) for item in value]
    elif isinstance(value, str):
        # Mask Bearer tokens in header-like strings
        if value.lower().startswith("bearer "):
            return "Bearer [REDACTED]"
    return value

def sanitize_data(data: Any) -> Any:
    """Recursively redacts sensitive dictionary fields, tokens, and credentials."""
    if isinstance(data, dict):
        return {k: sanitize_value(k, v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_data(item) for item in data]
    return data


class JSONLogFormatter(logging.Formatter):
    """Formats log records as structured JSON lines with timestamps and request context."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }

        # Request context attributes
        for attr in ["request_id", "method", "path", "status_code", "duration_ms", "action", "session_id"]:
            if hasattr(record, attr):
                val = getattr(record, attr)
                if val is not None:
                    log_entry[attr] = val

        # Metadata dictionary with automated redaction
        if hasattr(record, "metadata") and isinstance(record.metadata, dict):
            log_entry["metadata"] = sanitize_data(record.metadata)

        # Exception information
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def setup_logger(name: str = "riskauthai") -> logging.Logger:
    """Configures and returns a logger instance with JSON formatting and configured log level."""
    log_level_name = getattr(settings, "LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    logger = logging.getLogger(name)
    logger.setLevel(log_level)

    # Avoid duplicate handlers on re-initialization
    if not any(isinstance(h.formatter, JSONLogFormatter) for h in logger.handlers):
        handler = logging.StreamHandler()
        handler.setFormatter(JSONLogFormatter())
        logger.addHandler(handler)

    logger.propagate = False
    return logger

logger = setup_logger()
