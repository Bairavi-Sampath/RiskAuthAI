# RiskAuthAI — Enterprise Machine Learning Adaptive Risk Engine

RiskAuthAI is an enterprise-grade adaptive authentication risk engine powered by a Random Forest machine learning pipeline, SHAP per-instance feature attributions, FastAPI REST backend with SQLite persistence, and a modern React monitoring dashboard.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |       React 18 Dashboard Frontend     |
                      |   (Vite, TypeScript, Lucide Icons)    |
                      +-------------------+-------------------+
                                          |
                                          | REST API (HTTP / JSON)
                                          | (Bearer JWT Auth for Admin)
                                          v
                      +---------------------------------------+
                      |         FastAPI REST Backend          |
                      |  - SlowAPI Rate Limiting              |
                      |  - JWT OAuth2 Password Bearer Auth    |
                      |  - Pydantic Settings & Strict Schema  |
                      |  - Restricted CORS Headers            |
                      +---------+-------------------+---------+
                                |                   |
                 Inference &    |                   | ORM Persistence
                 Explainability v                   v (SQLAlchemy)
     +-----------------------------------+     +-------------------------+
     |     Machine Learning Pipeline     |     |     SQLite Database     |
     | - Random Forest Regressor (v2.0)  |     | - Login Events          |
     | - SHAP TreeExplainer (Attribution)|     | - Security Alerts       |
     | - Rule & Threshold Policy Layer   |     | - System Thresholds     |
     +-----------------------------------+     | - User Accounts         |
                                               +-------------------------+
```

---

## Phase 3: Security Hardening & Docker Implementation

### 1. SlowAPI Rate Limiting
- **Adaptive Throttling**: Applied per-client IP (`get_remote_address`) using `slowapi`.
- **Sensitive Endpoints**:
  - `POST /api/v1/auth/login`: Throttled to **10 requests/minute** to protect against brute-force credential stuffing.
  - `POST /api/v1/evaluate-risk`: Throttled to **60 requests/minute** to prevent telemetry scraping and automated probing.
  - Global Default: **120 requests/minute**.
- Throttled requests return standard HTTP `429 Too Many Requests`.

### 2. JWT Authentication & Administrative Access Control
- **Algorithm & Signatures**: HMAC SHA-256 (`HS256`) signed JWT tokens with configurable expiration (default: 120 minutes).
- **Authentication Flow**:
  - `POST /api/v1/auth/login`: Accepts administrative credentials via JSON or OAuth2 form, returns signed Bearer token.
  - `GET /api/v1/auth/me`: Verifies active token and returns admin claims.
- **Protected Endpoints**:
  - `PATCH /api/v1/alerts/{id}`: Requires valid administrative Bearer token.
  - `PUT /api/v1/settings/thresholds`: Requires valid administrative Bearer token.
  - Unauthenticated requests receive HTTP `401 Unauthorized` with `WWW-Authenticate: Bearer` challenge.
  - Non-admin tokens receive HTTP `403 Forbidden`.

### 3. Pydantic-Settings & Environment Management
- Centralized configuration in `backend/config.py` using `pydantic-settings` (`BaseSettings`).
- Zero hardcoded production secrets.
- Automatic fallback to `.env` or system environment variables.
- Clean `.env.example` templates provided at root and backend levels.

### 4. Restricted CORS & Input Validation
- **CORS Allowed Origins**: Strict whitelist configured via `CORS_ORIGINS` (defaults to `http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:5173`, `http://127.0.0.1:5173`).
- **Input Validation**: Pydantic v2 schemas enforce boundary conditions (e.g., `failedAttempts >= 0`, `0 <= riskScore <= 100`, `lowMax <= mediumMax`). Invalid data yields HTTP `422 Unprocessable Entity`.

### 5. Multi-Container Docker Deployment
- **Backend Container**: `backend/Dockerfile` using `python:3.12-slim`, healthcheck on `/health`, curl-enabled, non-root best practices.
- **Frontend Container**: Multi-stage `Dockerfile` with Node 20 build stage and `nginx:alpine` production server with SPA routing and asset caching.
- **Docker Compose**: `docker-compose.yml` orchestrates backend (port 8000) and frontend (port 3000), dependency order based on health checks, and a persistent named volume `sqlite_data` mapped to `/app/data`.

---

## Phase 4A: Prometheus Monitoring & Structured Logging

### 1. Prometheus Telemetry (`/metrics`)
- **Metrics Endpoint**: `GET /metrics` exports application performance and ML telemetry using `prometheus-client`.
- **Bounded Label Cardinality**: Label values are strictly bounded (e.g. `ALLOW`, `OTP`, `BLOCK` for decisions; `LOW`, `MEDIUM`, `HIGH` for risk tiers; normalized routes like `/api/v1/alerts/{id}`).
- **Privacy & Security Guarantee**: Zero personal data (no usernames, emails, IP addresses, tokens, or raw telemetry) is ever emitted into Prometheus metric labels.
- **Core Metric Families**:
  - `http_requests_total{method, endpoint, status_code}`: Request counter across normalized routes.
  - `http_request_duration_seconds{method, endpoint}`: HTTP request latency histogram.
  - `ml_risk_evaluation_duration_seconds{model_version}`: ML inference + SHAP computation latency histogram.
  - `risk_auth_decisions_total{decision, risk_level}`: Adaptive policy decision counts (`ALLOW`, `OTP`, `BLOCK`).
  - `risk_score_distribution{risk_level}`: Evaluated risk score histogram.

### 2. Structured JSON Logging & Data Redaction
- **JSON Format**: Every log entry is emitted as a structured JSON object containing:
  - `timestamp`: UTC ISO-8601 timestamp.
  - `level`: Log severity level (`INFO`, `WARNING`, `ERROR`, `DEBUG`).
  - `request_id`: Tracing identifier propagated via `X-Request-ID` or generated unique UUID.
  - `method`, `path`, `status_code`, `duration_ms`: HTTP request context.
  - `action`: Specific security event code (`AUTH_DECISION_BLOCK`, `MFA_CHALLENGE`, `ADMIN_LOGIN_SUCCESS`, etc.).
- **Automated Credential Redaction**: All logged payloads pass through recursive sanitization. Fields containing `password`, `secret`, `token`, `access_token`, `jwt`, `authorization`, `credentials`, or `api_key` are automatically replaced with `"[REDACTED]"`. Bearer headers are masked as `"Bearer [REDACTED]"`.
- **Configurable Log Levels**: Managed dynamically via `pydantic-settings` (`LOG_LEVEL=INFO`).


---

## Machine Learning & SHAP Explainability (Phase 2 & Metrics)

- **Model Architecture**: Random Forest Regressor (`n_estimators=120`, `max_depth=9`, `min_samples_split=4`, `random_state=42`).
- **Explainability**: Bundled `shap.TreeExplainer` computing instance-level Shapley contributions for all 6 input signals (`failed_attempts`, `device`, `location`, `vpn`, `login_time`, `behaviour`).
- **Test Metrics**:
  - **Regression**: $R^2 = 0.9923$, $\text{MAE} = 1.75$ points.
  - **Binary High-Risk Discrimination**: $\text{ROC-AUC} = 0.9998$, $\text{PR-AUC} = 0.9990$.
  - **Support Consistency**: Aligned rounding rules ensure both binary high-risk classification and multi-tier operational policy evaluate exactly **155 BLOCK events** on the test set.
- **Model Backup**: Original baseline artifact safely preserved at `backend/model/risk_model_v1_backup.joblib`.

---

## Environment Variables Configuration

Copy `.env.example` to `.env` or set the following in your environment:

```env
# Application Settings
APP_NAME="RiskAuthAI API Backend"
APP_VERSION="2.1.0"
ENVIRONMENT="development"
DEBUG=False

# JWT Security
SECRET_KEY="riskauthai_super_secret_jwt_key_2026_change_in_production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=120

# Administrative Credentials
ADMIN_USERNAME="admin@riskauth.ai"
ADMIN_PASSWORD="RiskAuthAdmin2026!"

# Database Storage
DATABASE_URL="sqlite:///data/riskauth.db"

# Rate Limiting (SlowAPI)
RATE_LIMIT_EVALUATE="60/minute"
RATE_LIMIT_AUTH="10/minute"
RATE_LIMIT_DEFAULT="120/minute"

# Restricted CORS Whitelist (JSON Array)
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://localhost:5173","http://127.0.0.1:5173"]
```

---

## Local Development Setup

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend service
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API and Swagger UI will be accessible at:
- **API Health**: `http://127.0.0.1:8000/health`
- **Interactive Documentation**: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup (React + Vite)

```bash
# In the project root directory
npm install
npm run dev
```
The React frontend dashboard will be available at `http://localhost:3000`.

---

## Running Automated Tests

Run the full backend test suite covering core risk evaluation, SHAP explainability, rate limiting, and JWT authentication:

```bash
cd backend
python -m unittest test_main.py -v
```

**Test Coverage Summary (28 Tests Passing):**
1. `test_01_health_endpoint`: Verifies `/health` model status and metadata.
2. `test_02_camelcase_fields_mapping`: Verifies frontend camelCase aliases (`failedAttempts`, etc.).
3. `test_03_snakecase_fields_mapping`: Verifies backward compatibility with snake_case.
4. `test_04_low_risk_scenario`: Verifies low baseline scoring and `ALLOW` decision.
5. `test_05_medium_risk_scenario`: Verifies medium threat elevation and `OTP` decision.
6. `test_06_high_risk_scenario`: Verifies severe threat convergence and `BLOCK` decision.
7. `test_07_frontend_response_schema_contract`: Validates schema conformance against `src/services/types.ts`.
8. `test_08_validation_errors`: Validates schema boundary conditions and error handling.
9. `test_09_missing_model_fallback`: Tests automatic graceful fallback to rule-based engine.
10. `test_10_cors_headers`: Tests restricted CORS configuration.
11. `test_11_login_events_crud`: Tests login event persistence and querying.
12. `test_12_high_risk_event_creates_alert_without_duplicates`: Tests alert creation and deduplication.
13. `test_13_security_alerts_patch_status`: Tests JWT authorization on alert status updates.
14. `test_14_user_directory_endpoint`: Tests user directory querying.
15. `test_15_dashboard_metrics_endpoint`: Tests aggregated dashboard metrics calculation.
16. `test_16_threshold_settings_get_and_put`: Tests JWT authentication on threshold mutations.
17. `test_17_evaluate_risk_applies_dynamic_thresholds`: Tests dynamic policy enforcement from SQLite.
18. `test_18_shap_tree_explainer_contributions`: Tests SHAP feature attribution accuracy.
19. `test_19_policy_vs_model_explanation_distinction`: Tests policy override separation.
20. `test_20_auth_login_endpoints`: Tests admin login, invalid passwords, and bad payloads.
21. `test_21_jwt_auth_and_token_validation`: Tests `/auth/me` and malformed token rejection.
22. `test_22_rate_limiting_enforcement`: Tests SlowAPI throttling with HTTP `429 Too Many Requests`.
23. `test_23_input_validation_and_bounds`: Tests boundary limits on failed attempts and thresholds.
24. `test_24_metrics_endpoint_availability`: Tests `/metrics` endpoint and Prometheus format export.
25. `test_25_metrics_request_counting_and_decisions`: Verifies decision metrics and zero PII/telemetry in labels.
26. `test_26_structured_json_logging`: Verifies JSON log schema with timestamp, level, request ID, duration.
27. `test_27_sensitive_data_redaction`: Verifies automated redaction of passwords, tokens, JWTs, and headers.
28. `test_28_log_level_and_metrics_configuration`: Verifies dynamic log level and telemetry toggle settings.

To validate the frontend TypeScript build:
```bash
npm run build
```

---

## Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Validate Compose configuration
docker compose config

# Build images and start containers in the background
docker compose up -d --build
```

### 2. Verify Container Health

```bash
docker compose ps
```
All four services report `healthy` status once their respective HTTP healthchecks pass:
- `riskauth-backend` (port 8000)
- `riskauth-frontend` (port 3000)
- `riskauth-prometheus` (port 9090)
- `riskauth-grafana` (port 3001)

### 3. Persistent Data Storage
- SQLite database records and generated alerts are stored in the Docker volume `sqlite_data` mounted at `/app/data`.
- Prometheus time-series metrics are persisted in the Docker volume `prometheus_data` mounted at `/prometheus`.
- Grafana user preferences, alerts, and dashboards are persisted in the Docker volume `grafana_data` mounted at `/var/lib/grafana`.
- Data persists across container restarts, image updates, and rebuilds.

### 4. Phase 4B: Prometheus Scraping & Grafana Dashboards

The monitoring stack includes automated provisioning:
- **Prometheus** (`http://localhost:9090`): Automatically scrapes `backend:8000/metrics` every 5 seconds.
- **Grafana** (`http://localhost:3001`): Provisioned with Prometheus datasource and the pre-configured **RiskAuthAI - Service & Security Monitoring** dashboard (`monitoring/grafana/dashboards/riskauth_overview.json`).
  - **Credentials**: Configured via `GRAFANA_ADMIN_USER` and `GRAFANA_ADMIN_PASSWORD` (defaults in `.env.example`).
  - **Panels**:
    1. **Total HTTP Requests** (`sum(http_requests_total)`)
    2. **5xx Server Errors** (`sum(http_requests_total{status_code=~"5.."})`)
    3. **Rate Limit Blocks (429)** (`sum(http_requests_total{status_code="429"})`)
    4. **Average Response Latency (ms)** (`http_request_duration_seconds`)
    5. **HTTP Request Throughput by Endpoint** (`rate(http_requests_total[1m])`)
    6. **Response Latency & ML Evaluation Duration (p95)** (`ml_risk_evaluation_duration_seconds_bucket`)
    7. **Decisions Breakdown** (Donut chart for `ALLOW`, `OTP`, `BLOCK`)
    8. **Evaluated Risk Tier Distribution** (Bar chart for `LOW`, `MEDIUM`, `HIGH`)
    9. **HTTP Status Codes Breakdown** (Pie chart for 200, 401, 422, 429, 500)

### 5. Phase 4C: Windows PowerShell Verification & Command Guide

#### 5.1 Docker Compose Lifecycle (PowerShell)
```powershell
# Validate docker-compose configuration
docker compose config

# Build and start all 4 services in detached mode
docker compose up -d --build

# View container status and healthchecks
docker compose ps

# Check aggregated container logs
docker compose logs --tail=50

# Check individual container logs
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
docker compose logs prometheus --tail=50
docker compose logs grafana --tail=50
```

#### 5.2 Testing the Backend & Machine Learning Engine
```powershell
# 1. Healthcheck & Model Status
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get | ConvertTo-Json

# 2. Low-Risk Evaluation (ALLOW decision)
$lowPayload = @{
    device = "trusted"
    ipAddress = "192.168.1.10"
    location = "normal"
    vpn = "no"
    failedAttempts = 0
    loginTime = "normal"
    behaviour = "normal"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/evaluate-risk" -Method Post -Body $lowPayload -ContentType "application/json" | ConvertTo-Json -Depth 5

# 3. High-Risk Evaluation (BLOCK decision with SHAP explainability)
$highPayload = @{
    device = "unknown"
    location = "unusual"
    locationName = "Kyiv, Ukraine"
    vpn = "yes"
    failedAttempts = 5
    loginTime = "unusual"
    behaviour = "suspicious"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/evaluate-risk" -Method Post -Body $highPayload -ContentType "application/json" | ConvertTo-Json -Depth 5

# 4. Administrative Login & JWT Bearer Token Retrieval
$loginBody = @{
    username = "admin@riskauth.ai"
    password = "RiskAuthAdmin2026!"
} | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $auth.access_token

# Verify claims via protected /auth/me endpoint
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me" -Headers @{ Authorization = "Bearer $token" } -Method Get
```

#### 5.3 Verifying Frontend & Nginx Reverse Proxy
```powershell
# Verify Nginx serves React production bundle (port 3000)
curl.exe -s -o NUL -w "Frontend HTTP Code: %{http_code}`n" http://localhost:3000/

# Verify Nginx reverse-proxies API calls directly to backend
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/dashboard/metrics" -Method Get | ConvertTo-Json
```

#### 5.4 Verifying Prometheus & Grafana Telemetry
```powershell
# 1. Verify Prometheus Target Status (must show state "up")
$targets = Invoke-RestMethod -Uri "http://localhost:9090/api/v1/targets" -Method Get
$targets.data.activeTargets | Select-Object job, scrapeUrl, health, lastScrapeDuration

# 2. Query Prometheus Decisions Metric
Invoke-RestMethod -Uri "http://localhost:9090/api/v1/query?query=risk_auth_decisions_total" -Method Get | ConvertTo-Json -Depth 4

# 3. Verify Grafana Datasource (UID: Prometheus)
$grafanaAuth = @{ Authorization = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:RiskAuthGrafana2026!")) }
Invoke-RestMethod -Uri "http://localhost:3001/api/datasources/uid/Prometheus" -Headers $grafanaAuth -Method Get | Select-Object id, uid, name, url, isDefault

# 4. Verify Provisioned RiskAuthAI Dashboard
Invoke-RestMethod -Uri "http://localhost:3001/api/search" -Headers $grafanaAuth -Method Get | Select-Object title, uid, url
```

#### 5.5 Stopping and Restarting Safely
```powershell
# Safely stop containers without destroying SQLite and monitoring data:
docker compose stop

# Restart a specific service (e.g. backend or grafana)
docker compose restart backend
docker compose restart grafana

# Tear down containers and network (preserves volumes sqlite_data, prometheus_data, grafana_data)
docker compose down

# IMPORTANT SAFETY WARNING:
# NEVER execute 'docker compose down -v' unless you explicitly want to wipe
# the persistent database records and historical Prometheus metrics!
```

#### 5.6 Windows PowerShell Troubleshooting Tips
- **Hanging `Invoke-WebRequest`**: In PowerShell 5.1, `Invoke-WebRequest` uses the legacy Internet Explorer DOM parser. If it hangs, use `curl.exe` or `Invoke-RestMethod` instead.
- **PowerShell JSON Quotes with `curl.exe`**: In PowerShell, raw double quotes in single-quoted strings are stripped by PowerShell when calling external executables. Always escape internal double quotes (e.g. `"{\`"username\`":\`"admin@riskauth.ai\`"}"`) or use `Invoke-RestMethod -Body $hashTable -ContentType "application/json"`.
- **Port Conflicts**: Ensure ports 3000, 3001, 8000, and 9090 are not occupied by local dev servers before running `docker compose up -d`. If port 3001 is busy, set `GRAFANA_PORT=3002` in `.env`.
- **Grafana Startup Delay**: Grafana may take 20–30 seconds on initial startup while checking plugins. The healthcheck includes `start_period: 60s` to prevent premature restarts.

---

## Phase 5: CI/CD Automation (GitHub Actions)

RiskAuthAI features automated CI/CD pipeline automation configured in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that executes on every push and pull request targeting `main` or `master`, as well as on manual `workflow_dispatch`.

```
           +--------------------------------------------------------+
           |           GitHub Actions Workflow Trigger              |
           |      (Push / Pull Request to main, master)             |
           +---------------------------+----------------------------+
                                       |
          +----------------------------+----------------------------+
          |                            |                            |
          v                            v                            v
+--------------------+       +--------------------+       +--------------------+
|   backend-tests    |       |   frontend-build   |       | docker-validation  |
| - Python 3.12      |       | - Node.js 20       |       | - Docker Buildx    |
| - Pip cache        |       | - Npm ci           |       | - Compose syntax   |
| - Model validation |       | - TypeScript lint  |       | - Backend image    |
| - 28 Unit tests    |       | - Vite bundle      |       | - Frontend image   |
+--------------------+       +--------------------+       +--------------------+
                                       |
                                       v
                             +--------------------+
                             |   security-audit   |
                             | - Gitleaks scan    |
                             | - Pip-audit scan   |
                             | - Npm audit scan   |
                             +--------------------+
```

### 1. Workflow Architecture & Jobs

The CI pipeline runs 4 parallel, isolated jobs on `ubuntu-latest`:

1. **`backend-tests`**:
   - Sets up Python 3.12 with pip dependency caching.
   - Verifies the presence and integrity of the ML model artifact (`backend/model/risk_model.joblib`).
   - Executes the complete backend test suite (`python -m unittest test_main.py -v`).
2. **`frontend-build`**:
   - Sets up Node.js 20 with npm caching.
   - Installs frozen dependencies with `npm ci` using `package-lock.json`.
   - Executes TypeScript typechecking and linting (`npm run lint` / `tsc --noEmit`).
   - Compiles production distribution bundle (`npm run build`) and verifies `dist/index.html`.
3. **`docker-validation`**:
   - Sets up Docker Buildx with GitHub Actions cache backend.
   - Validates multi-container orchestration syntax (`docker compose config`).
   - Builds production container images for `riskauth-backend` and `riskauth-frontend`.
4. **`security-audit`**:
   - Runs **Gitleaks** with full commit history to scan for accidentally exposed credentials, private keys, or high-entropy tokens. Configured via [`.gitleaks.toml`](.gitleaks.toml) with strict allowlists for example env templates.
   - Audits Python dependencies against the OSV vulnerability database using `pip-audit`.
   - Audits npm packages for critical vulnerabilities using `npm audit --audit-level=critical`.

### 2. Viewing Workflow Results on GitHub

1. Navigate to the GitHub repository: `https://github.com/Bairavi-Sampath/RiskAuthAI`.
2. Click on the **Actions** tab at the top of the repository.
3. Select the latest workflow run under **RiskAuthAI CI/CD Automation**.
4. Click on any job card (`Backend Unit Tests`, `Frontend Typecheck & Production Build`, `Docker Compose & Container Image Validation`, `Security & Secret Audit`) to view granular step logs, test reports, and timings.

### 3. Reproducing CI Checks Locally on Windows PowerShell

Every check performed in GitHub Actions can be reproduced locally on Windows:

```powershell
# 1. Backend Tests & Model Validation
cd backend
python -m unittest test_main.py -v
cd ..

# 2. Frontend Lint & Production Build
npm run lint
npm run build

# 3. Docker Compose & Container Image Build Validation
docker compose config
docker build -t riskauth-backend:local ./backend
docker build -t riskauth-frontend:local .

# 4. Dependency Security Audits
python -m pip_audit -r backend/requirements.txt
npm audit --audit-level=critical
```

### 4. Common CI Failure Troubleshooting

- **TypeScript Typecheck Error (`npm run lint`)**:
  - *Cause*: A component, interface, or property in `src/` does not match TypeScript strict mode contracts.
  - *Fix*: Run `npm run lint` locally, inspect the reported file and line number, and resolve the type mismatch before committing.
- **Model Artifact Missing in Backend CI**:
  - *Cause*: Git LFS or `.gitignore` accidentally excluded `backend/model/risk_model.joblib`.
  - *Fix*: Ensure `backend/model/risk_model.joblib` is tracked in git (`git add -f backend/model/risk_model.joblib`).
- **Gitleaks Secret Scan Triggered**:
  - *Cause*: A commit contains unredacted API keys, raw JWT signing secrets, or private keys.
  - *Fix*: Never commit `.env` files. Ensure development placeholders match allowlist patterns in `.gitleaks.toml`.
- **Docker Buildx Cache Miss / Timeout**:
  - *Cause*: Transient GitHub network latency while downloading base images (`python:3.12-slim` or `node:20-alpine`).
  - *Fix*: Workflows include a 15-minute timeout and automatic GitHub Actions caching (`cache-from: type=gha`). Re-run failed jobs from the GitHub Actions UI.

---

---

## Phase 6: SQLite Database Reliability, Integrity & Backup Architecture

Phase 6 implements high-reliability SQLite operational guarantees, non-blocking concurrency, live integrity diagnostics, and zero-downtime hot backups using Python's SQLite Online Backup API.

### 1. Active Database Location & Engine Configuration
* **Primary Database File**: `backend/data/riskauth.db` (in container: mounted at `/app/data/riskauth.db`).
* **Concurrency Architecture (WAL Mode)**:
  * Persistent `PRAGMA journal_mode=WAL;` is enabled once during database startup/initialization (`init_db.py`) under the SQLite dialect guard.
  * Allows non-blocking concurrent reads while background writes are in progress.
  * `PRAGMA synchronous=NORMAL;` guarantees crash-safety with optimal disk I/O.
* **Lock Contention Mitigation & Connection PRAGMAs**:
  * Connection hook in `backend/db/database.py` applies connection-scoped PRAGMAs only to SQLite connections:
    * `PRAGMA busy_timeout=5000;` ensures that under high concurrent load, transactions wait up to 5000ms for lock acquisition rather than raising `OperationalError: database is locked`.
    * `PRAGMA foreign_keys=ON;` enforces referential integrity.

### 2. Database Integrity Diagnostics
* **Live Diagnostic Endpoint**:
  ```http
  GET /api/v1/health/database
  ```
  Returns:
  ```json
  {
    "engine": "SQLite",
    "status": "healthy",
    "integrity": "ok",
    "journal_mode": "wal",
    "foreign_keys": true,
    "busy_timeout_ms": 5000
  }
  ```
* **Integrated Healthcheck**: `GET /health` includes `"database": "healthy"` without breaking backward-compatible contracts, returning `"database": "unhealthy"` and `"status": "degraded"` if diagnostics or initialization fail.

### 3. Safe Online Hot Backups
Hot backups are generated using SQLite’s native non-blocking Online Backup API (`sqlite3.Connection.backup`) via `backend/db/backup.py`. Backups capture a consistent snapshot of `riskauth.db` without pausing FastAPI or active write transactions.

#### Creating an Immediate Backup
```bash
cd backend
python -m db.backup --create
```
* Generates an atomically committed snapshot: `backend/data/backups/riskauth_backup_YYYYMMDD_HHMMSS.db`.
* Staged in a temporary file to ensure no partial backups exist on failure.
* Generates companion SHA-256 (`.sha256`) and metadata manifest (`.manifest.json`) files.
* Automatically verifies table existence and schema columns across all four application tables.

#### Verifying Backup Snapshot Integrity
```bash
python -m db.backup --verify data/backups/riskauth_backup_20261027_161500.db
```

### 4. Cautious Restoration Procedure
To prevent accidental data loss or corruption of production data:
1. **Safety Safeguards**:
   * Restoring directly over the active production database (`riskauth.db`) is blocked via `PermissionError`.
   * Restoring over an existing target without explicit `overwrite=True` is refused via `FileExistsError`.
   * The restore procedure **always defaults to dry-run mode** (`dry_run=True`), performing validation without modifying the target.
   * Backups failing `PRAGMA integrity_check`, missing required tables, or having checksum mismatches are automatically rejected.
2. **Testing Restore Safely (into a temporary target)**:
   ```python
   from db.backup import restore_backup
   # Dry-run inspection:
   restore_backup("data/backups/riskauth_backup_XYZ.db", "data/restored_test.db", dry_run=True)
   # Safe execution into an alternate file:
   restore_backup("data/backups/riskauth_backup_XYZ.db", "data/restored_test.db", dry_run=False)
   ```

### 5. Running Phase 6 Database Verification Tests (34 Tests)
Run the expanded test suite covering concurrent threads, WAL mode, integrity checks, failure modes, and hot backups:
```powershell
cd backend
python -m unittest test_main.py -v
```

---

## Security Notes & Production Readiness Caveats

While Phase 3, 4, 5 & 6 add defense-in-depth protections (JWT auth, SlowAPI throttling, restricted CORS, Prometheus metrics, structured logging, CI/CD automation, and SQLite WAL reliability):
- **Secret Rotation**: Change `SECRET_KEY`, `ADMIN_PASSWORD`, and `GRAFANA_ADMIN_PASSWORD` before internet deployment.
- **SQLite Single-Node Operational Scope**: SQLite with WAL mode and hot backup automation provides resilient persistence for single-node deployments and enterprise edge appliances.
- **Enterprise Identity**: For corporate deployment, replace local admin username/password with enterprise IdP SSO (SAML 2.0 / OIDC).
- **Metric Cardinality & Privacy**: Never add user emails, passwords, tokens, or IP addresses to Prometheus metric labels; keep labels bounded to enum sets (`decision`, `risk_level`, `status_code`, normalized `endpoint`).
