import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "RiskAuthAI API Backend"
    APP_VERSION: str = "2.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Security & JWT Configuration
    SECRET_KEY: str = "riskauthai_super_secret_jwt_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # Administrative Credentials
    ADMIN_USERNAME: str = "admin@riskauth.ai"
    ADMIN_PASSWORD: str = "RiskAuthAdmin2026!"

    # Database
    DATABASE_URL: str = "sqlite:///data/riskauth.db"

    # Rate Limiting via SlowAPI
    RATE_LIMIT_EVALUATE: str = "60/minute"
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_DEFAULT: str = "120/minute"

    # Restricted CORS Allowed Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Logging & Telemetry Configuration
    LOG_LEVEL: str = "INFO"
    PROMETHEUS_METRICS_ENABLED: bool = True

settings = Settings()
