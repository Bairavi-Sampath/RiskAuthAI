import unittest
import warnings
warnings.filterwarnings("ignore")
from fastapi.testclient import TestClient
import main
from db.init_db import init_db

class TestRiskAuthAIBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(main.app)
        # Authenticate admin to obtain JWT token for protected endpoints
        login_res = cls.client.post("/api/v1/auth/login", json={
            "username": "admin@riskauth.ai",
            "password": "RiskAuthAdmin2026!"
        })
        cls.admin_token = login_res.json()["access_token"]
        cls.auth_headers = {"Authorization": f"Bearer {cls.admin_token}"}

    def setUp(self):
        # Reset limiter before each test to prevent cross-test rate limit interference
        main.limiter.reset()

    # -------------------------------------------------------------
    # Core Health & Risk Evaluation Tests
    # -------------------------------------------------------------

    def test_01_health_endpoint(self):
        """Test GET /health returns expected fields and status 200."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "RiskAuthAI Backend")
        self.assertIn("model_loaded", data)
        self.assertIn("model_type", data)
        self.assertTrue(data["model_loaded"])
        self.assertEqual(data["model_type"], "Random Forest Regressor")

    def test_02_camelcase_fields_mapping(self):
        """Test that camelCase fields like failedAttempts, loginTime, behaviour are NOT defaulted."""
        payload = {
            "device": "unknown",
            "ipAddress": "198.51.100.22",
            "location": "unusual",
            "locationName": "Kyiv, Ukraine",
            "vpn": "yes",
            "failedAttempts": 4,
            "loginTime": "unusual",
            "behaviour": "suspicious",
            "browser": "Firefox 125",
            "os": "Linux"
        }
        response = self.client.post("/api/v1/evaluate-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        factor_titles = [f["title"] for f in data["detailed_factors"]]
        self.assertIn("Failed Attempts", factor_titles)
        failed_factor = next(f for f in data["detailed_factors"] if f["title"] == "Failed Attempts")
        self.assertIn(failed_factor["status"], ["warning", "critical"])
        self.assertGreater(failed_factor["weight"], 0)
        self.assertTrue(any("failed authentication attempt" in f.lower() or "failed" in f.lower() for f in data["risk_factors"]))

        self.assertGreaterEqual(data["risk_score"], 70)
        self.assertEqual(data["risk_level"], "HIGH")
        self.assertEqual(data["decision"], "BLOCK")
        self.assertFalse(data["requires_otp"])

    def test_03_snakecase_fields_mapping(self):
        """Test backward compatibility with snake_case fields."""
        payload = {
            "device": "unknown",
            "ip_address": "198.51.100.22",
            "location": "unusual",
            "location_name": "Kyiv, Ukraine",
            "vpn": True,
            "failed_attempts": 4,
            "login_time": "unusual",
            "user_behaviour": "suspicious"
        }
        response = self.client.post("/api/v1/evaluate-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(any("failed" in f.lower() for f in data["risk_factors"]))
        failed_factor = next(f for f in data["detailed_factors"] if f["title"] == "Failed Attempts")
        self.assertGreater(failed_factor["weight"], 0)
        self.assertGreaterEqual(data["risk_score"], 70)

    def test_04_low_risk_scenario(self):
        """Test Low-Risk scenario: verified baseline -> ALLOW without OTP."""
        payload = {
            "device": "trusted",
            "ipAddress": "192.168.1.10",
            "location": "normal",
            "vpn": "no",
            "failedAttempts": 0,
            "loginTime": "normal",
            "behaviour": "normal"
        }
        response = self.client.post("/api/v1/evaluate-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertLessEqual(data["risk_score"], 39)
        self.assertEqual(data["risk_level"], "LOW")
        self.assertEqual(data["decision"], "ALLOW")
        self.assertFalse(data["requires_otp"])
        self.assertEqual(len(data["risk_factors"]), 0)

    def test_05_medium_risk_scenario(self):
        """Test Medium-Risk scenario: moderate anomalies -> OTP challenge."""
        payload = {
            "device": "unknown",
            "location": "unusual",
            "vpn": "no",
            "failedAttempts": 3,
            "loginTime": "normal",
            "behaviour": "normal"
        }
        response = self.client.post("/api/v1/evaluate-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertGreaterEqual(data["risk_score"], 40)
        self.assertLessEqual(data["risk_score"], 69)
        self.assertEqual(data["risk_level"], "MEDIUM")
        self.assertEqual(data["decision"], "OTP")
        self.assertTrue(data["requires_otp"])

    def test_06_high_risk_scenario(self):
        """Test High-Risk scenario: multiple severe threats -> BLOCK."""
        payload = {
            "device": "unknown",
            "location": "unusual",
            "vpn": "yes",
            "failedAttempts": 5,
            "loginTime": "unusual",
            "behaviour": "suspicious"
        }
        response = self.client.post("/api/v1/evaluate-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertGreaterEqual(data["risk_score"], 70)
        self.assertEqual(data["risk_level"], "HIGH")
        self.assertEqual(data["decision"], "BLOCK")
        self.assertFalse(data["requires_otp"])

    def test_07_frontend_response_schema_contract(self):
        """Test that evaluate-risk response strictly conforms to frontend types.ts contract."""
        payload = {"device": "trusted", "failedAttempts": 1}
        response = self.client.post("/api/v1/evaluate-risk", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        required_fields = [
            "risk_score", "risk_level", "decision", "requires_otp",
            "risk_factors", "detailed_factors", "explanation",
            "evaluated_at", "session_id", "model_version"
        ]
        for field in required_fields:
            self.assertIn(field, data)

        for factor in data["detailed_factors"]:
            self.assertIn("title", factor)
            self.assertIn("status", factor)
            self.assertIn("weight", factor)
            self.assertIn("description", factor)

    def test_08_validation_errors(self):
        """Test that invalid types or negative numbers produce HTTP 422."""
        res_bad_type = self.client.post("/api/v1/evaluate-risk", json={"failedAttempts": "invalid_abc"})
        self.assertEqual(res_bad_type.status_code, 422)

        res_neg = self.client.post("/api/v1/evaluate-risk", json={"failedAttempts": -3})
        self.assertEqual(res_neg.status_code, 422)

    def test_09_missing_model_fallback(self):
        """Test graceful degradation to rule-based engine when model artifact is unavailable."""
        saved_model = main.model_artifact
        try:
            main.model_artifact = None

            health_res = self.client.get("/health")
            self.assertEqual(health_res.status_code, 200)
            self.assertFalse(health_res.json()["model_loaded"])

            eval_res = self.client.post("/api/v1/evaluate-risk", json={
                "device": "unknown",
                "location": "unusual",
                "vpn": "yes",
                "failedAttempts": 5,
                "behaviour": "suspicious"
            })
            self.assertEqual(eval_res.status_code, 200)
            eval_data = eval_res.json()
            self.assertEqual(eval_data["risk_level"], "HIGH")
            self.assertEqual(eval_data["model_version"], "RuleEngine-Fallback")
        finally:
            main.model_artifact = saved_model

    def test_10_cors_headers(self):
        """Test restricted CORS configuration for authorized and unauthorized origins."""
        # Authorized origin
        res = self.client.options(
            "/api/v1/evaluate-risk",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            }
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), "http://localhost:3000")

        # Unauthorized external origin
        res_unauthorized = self.client.options(
            "/api/v1/evaluate-risk",
            headers={
                "Origin": "http://malicious-external-origin.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            }
        )
        self.assertNotEqual(res_unauthorized.headers.get("access-control-allow-origin"), "http://malicious-external-origin.com")

    # -------------------------------------------------------------
    # Phase 1: Database & New Endpoints Tests
    # -------------------------------------------------------------

    def test_11_login_events_crud(self):
        """Test GET and POST /api/v1/login-events."""
        # 1. GET events
        res = self.client.get("/api/v1/login-events")
        self.assertEqual(res.status_code, 200)
        events = res.json()
        self.assertIsInstance(events, list)
        self.assertGreaterEqual(len(events), 1)

        # Verify contract
        event = events[0]
        self.assertIn("id", event)
        self.assertIn("userEmail", event)
        self.assertIn("ipAddress", event)
        self.assertIn("riskScore", event)
        self.assertIn("decision", event)

        # 2. POST new event (Low risk)
        new_event = {
            "userEmail": "test.engineer@enterprise.corp",
            "userName": "Test Engineer",
            "ipAddress": "192.168.1.55",
            "device": "MacBook Pro M3",
            "deviceStatus": "trusted",
            "location": "Austin, TX",
            "locationStatus": "normal",
            "vpn": False,
            "riskScore": 10,
            "riskLevel": "LOW",
            "decision": "ALLOW",
            "failedAttempts": 0,
            "behaviour": "normal",
            "loginTimeStatus": "normal",
            "riskFactors": []
        }
        post_res = self.client.post("/api/v1/login-events", json=new_event)
        self.assertEqual(post_res.status_code, 200)
        created = post_res.json()
        self.assertEqual(created["userEmail"], "test.engineer@enterprise.corp")
        self.assertIsNotNone(created["id"])

    def test_12_high_risk_event_creates_alert_without_duplicates(self):
        """Test that recording a HIGH risk event generates an alert without duplicates."""
        import uuid
        initial_alerts_count = len(self.client.get("/api/v1/alerts").json())

        event_id = "test_high_risk_evt_" + str(uuid.uuid4())[:8]
        user_email = f"compromised.{str(uuid.uuid4())[:6]}@enterprise.corp"
        high_risk_event = {
            "id": event_id,
            "userEmail": user_email,
            "userName": "Compromised User",
            "ipAddress": "185.220.101.99",
            "device": "Tor Browser",
            "deviceStatus": "unknown",
            "location": "Unknown Proxy Node",
            "locationStatus": "unusual",
            "vpn": True,
            "riskScore": 88,
            "riskLevel": "HIGH",
            "decision": "BLOCK",
            "failedAttempts": 5,
            "behaviour": "suspicious",
            "loginTimeStatus": "unusual",
            "riskFactors": ["Tor exit node detected", "5 failed attempts"]
        }

        # First submission -> alert should be created
        res1 = self.client.post("/api/v1/login-events", json=high_risk_event)
        self.assertEqual(res1.status_code, 200)

        alerts_after_1 = self.client.get("/api/v1/alerts").json()
        self.assertEqual(len(alerts_after_1), initial_alerts_count + 1)
        created_alert = next(a for a in alerts_after_1 if a["userEmail"] == user_email)
        self.assertEqual(created_alert["userEmail"], user_email)
        self.assertEqual(created_alert["severity"], "critical")

        # Second submission with same event ID -> duplicate alert must NOT be created
        res2 = self.client.post("/api/v1/login-events", json=high_risk_event)
        self.assertEqual(res2.status_code, 200)

        alerts_after_2 = self.client.get("/api/v1/alerts").json()
        self.assertEqual(len(alerts_after_2), initial_alerts_count + 1)

    def test_13_security_alerts_patch_status(self):
        """Test GET and PATCH /api/v1/alerts/{id} including JWT administrative protection."""
        alerts = self.client.get("/api/v1/alerts").json()
        self.assertGreaterEqual(len(alerts), 1)
        alert_id = alerts[0]["id"]

        # 1. Unauthenticated PATCH -> 401
        unauth_res = self.client.patch(f"/api/v1/alerts/{alert_id}", json={"status": "investigating"})
        self.assertEqual(unauth_res.status_code, 401)

        # 2. Invalid Bearer token -> 401
        invalid_res = self.client.patch(
            f"/api/v1/alerts/{alert_id}",
            json={"status": "investigating"},
            headers={"Authorization": "Bearer invalid_malformed_token"}
        )
        self.assertEqual(invalid_res.status_code, 401)

        # 3. Authenticated valid update to 'investigating' -> 200
        patch_res = self.client.patch(
            f"/api/v1/alerts/{alert_id}",
            json={"status": "investigating"},
            headers=self.auth_headers
        )
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["status"], "investigating")

        # 4. Authenticated valid update to 'resolved' -> 200
        patch_res2 = self.client.patch(
            f"/api/v1/alerts/{alert_id}",
            json={"status": "resolved"},
            headers=self.auth_headers
        )
        self.assertEqual(patch_res2.status_code, 200)
        self.assertEqual(patch_res2.json()["status"], "resolved")

        # 5. Invalid status value -> 422
        bad_status_res = self.client.patch(
            f"/api/v1/alerts/{alert_id}",
            json={"status": "invalid_status"},
            headers=self.auth_headers
        )
        self.assertEqual(bad_status_res.status_code, 422)

        # 6. Non-existent alert -> 404
        not_found_res = self.client.patch(
            "/api/v1/alerts/non_existent_id",
            json={"status": "active"},
            headers=self.auth_headers
        )
        self.assertEqual(not_found_res.status_code, 404)

    def test_14_user_directory_endpoint(self):
        """Test GET /api/v1/users."""
        res = self.client.get("/api/v1/users")
        self.assertEqual(res.status_code, 200)
        users = res.json()
        self.assertIsInstance(users, list)
        self.assertGreaterEqual(len(users), 6)

        user = users[0]
        self.assertIn("id", user)
        self.assertIn("name", user)
        self.assertIn("email", user)
        self.assertIn("role", user)
        self.assertIn("status", user)
        self.assertIn("riskLevel", user)
        self.assertIn("avgRiskScore", user)

    def test_15_dashboard_metrics_endpoint(self):
        """Test GET /api/v1/dashboard/metrics."""
        res = self.client.get("/api/v1/dashboard/metrics")
        self.assertEqual(res.status_code, 200)
        metrics = res.json()

        self.assertIn("totalAttempts", metrics)
        self.assertIn("lowRiskCount", metrics)
        self.assertIn("mediumRiskCount", metrics)
        self.assertIn("highRiskCount", metrics)
        self.assertIn("blockedCount", metrics)
        self.assertIn("otpChallengedCount", metrics)
        self.assertIn("activeAlertsCount", metrics)
        self.assertIn("activityTimeline", metrics)
        self.assertIn("riskDistribution", metrics)
        self.assertIn("anomalyBreakdown", metrics)

        self.assertIsInstance(metrics["activityTimeline"], list)
        self.assertIsInstance(metrics["riskDistribution"], list)
        self.assertIsInstance(metrics["anomalyBreakdown"], list)

    def test_16_threshold_settings_get_and_put(self):
        """Test GET and PUT /api/v1/settings/thresholds including JWT protection."""
        # 1. GET thresholds (public view)
        res = self.client.get("/api/v1/settings/thresholds")
        self.assertEqual(res.status_code, 200)
        settings = res.json()
        self.assertIn("lowMax", settings)
        self.assertIn("mediumMax", settings)
        self.assertIn("highMin", settings)

        # 2. Unauthenticated PUT -> 401
        unauth_put = self.client.put("/api/v1/settings/thresholds", json={"lowMax": 35})
        self.assertEqual(unauth_put.status_code, 401)

        # 3. Invalid token PUT -> 401
        invalid_put = self.client.put(
            "/api/v1/settings/thresholds",
            json={"lowMax": 35},
            headers={"Authorization": "Bearer bad_signature_token"}
        )
        self.assertEqual(invalid_put.status_code, 401)

        # 4. Authenticated PUT valid thresholds
        update_payload = {
            "lowMax": 35,
            "mediumMax": 65,
            "highMin": 66,
            "strictVpnPolicy": True
        }
        put_res = self.client.put(
            "/api/v1/settings/thresholds",
            json=update_payload,
            headers=self.auth_headers
        )
        self.assertEqual(put_res.status_code, 200)
        updated = put_res.json()
        self.assertEqual(updated["lowMax"], 35)
        self.assertEqual(updated["mediumMax"], 65)
        self.assertEqual(updated["highMin"], 66)
        self.assertTrue(updated["strictVpnPolicy"])

        # 5. Authenticated PUT invalid thresholds (lowMax > mediumMax) -> 422
        bad_put = self.client.put(
            "/api/v1/settings/thresholds",
            json={"lowMax": 80, "mediumMax": 40},
            headers=self.auth_headers
        )
        self.assertEqual(bad_put.status_code, 422)

        # Restore baseline thresholds
        self.client.put(
            "/api/v1/settings/thresholds",
            json={
                "lowMax": 39,
                "mediumMax": 69,
                "highMin": 70,
                "strictVpnPolicy": False
            },
            headers=self.auth_headers
        )

    def test_17_evaluate_risk_applies_dynamic_thresholds(self):
        """Test that evaluate-risk dynamically respects configured database thresholds."""
        # Lower high threshold to 50 using admin credentials
        self.client.put(
            "/api/v1/settings/thresholds",
            json={
                "lowMax": 20,
                "mediumMax": 49,
                "highMin": 50
            },
            headers=self.auth_headers
        )

        # Evaluate a scenario that scores ~62 (normally MEDIUM/OTP, but now above highMin 50)
        payload = {
            "device": "unknown",
            "location": "unusual",
            "vpn": "no",
            "failedAttempts": 3
        }
        eval_res = self.client.post("/api/v1/evaluate-risk", json=payload)
        self.assertEqual(eval_res.status_code, 200)
        data = eval_res.json()

        # Score is ~62, which exceeds 50 -> should be HIGH and BLOCK!
        self.assertEqual(data["risk_level"], "HIGH")
        self.assertEqual(data["decision"], "BLOCK")

        # Restore defaults
        self.client.put(
            "/api/v1/settings/thresholds",
            json={
                "lowMax": 39,
                "mediumMax": 69,
                "highMin": 70
            },
            headers=self.auth_headers
        )

    def test_18_shap_tree_explainer_contributions(self):
        """Test Phase 2 SHAP TreeExplainer per-instance feature contributions."""
        payload = {
            "device": "unknown",
            "location": "unusual",
            "vpn": "yes",
            "failedAttempts": 4,
            "loginTime": "unusual",
            "behaviour": "suspicious"
        }
        res = self.client.post("/api/v1/evaluate-risk", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Detailed factors must be populated with SHAP attribution descriptions
        detailed = data["detailed_factors"]
        self.assertEqual(len(detailed), 6)
        for factor in detailed:
            self.assertIn("SHAP attribution", factor["description"])
            self.assertGreaterEqual(factor["weight"], 0)
            self.assertIn(factor["status"], ["positive", "warning", "critical"])

        # High risk factors list must contain attribution magnitudes
        self.assertGreaterEqual(len(data["risk_factors"]), 3)
        for rf in data["risk_factors"]:
            self.assertIn("pts", rf)

    def test_19_policy_vs_model_explanation_distinction(self):
        """Test that explanation string clearly distinguishes ML score from policy decision."""
        # 1. Normal ALLOW case
        res_allow = self.client.post("/api/v1/evaluate-risk", json={"device": "trusted", "failedAttempts": 0})
        self.assertEqual(res_allow.status_code, 200)
        exp_allow = res_allow.json()["explanation"]
        self.assertIn("predicted low baseline risk", exp_allow)
        self.assertIn("Policy decision: ALLOW", exp_allow)

        # 2. Policy override case: strict VPN enabled
        self.client.put(
            "/api/v1/settings/thresholds",
            json={"strictVpnPolicy": True},
            headers=self.auth_headers
        )
        try:
            res_vpn = self.client.post("/api/v1/evaluate-risk", json={"device": "trusted", "vpn": "yes", "failedAttempts": 0})
            self.assertEqual(res_vpn.status_code, 200)
            exp_vpn = res_vpn.json()["explanation"]
            self.assertIn("Policy Override: Strict VPN policy", exp_vpn)
            self.assertEqual(res_vpn.json()["decision"], "OTP")
        finally:
            self.client.put(
                "/api/v1/settings/thresholds",
                json={"strictVpnPolicy": False},
                headers=self.auth_headers
            )

    # -------------------------------------------------------------
    # Phase 3: Security Hardening & Rate Limiting Tests
    # -------------------------------------------------------------

    def test_20_auth_login_endpoints(self):
        """Test POST /api/v1/auth/login for valid credentials, invalid password, and missing fields."""
        # 1. Valid credentials
        success_res = self.client.post("/api/v1/auth/login", json={
            "username": "admin@riskauth.ai",
            "password": "RiskAuthAdmin2026!"
        })
        self.assertEqual(success_res.status_code, 200)
        auth_data = success_res.json()
        self.assertIn("access_token", auth_data)
        self.assertEqual(auth_data["token_type"], "bearer")
        self.assertEqual(auth_data["role"], "admin")
        self.assertEqual(auth_data["username"], "admin@riskauth.ai")

        # 2. Invalid password -> 401
        invalid_res = self.client.post("/api/v1/auth/login", json={
            "username": "admin@riskauth.ai",
            "password": "WrongPassword123!"
        })
        self.assertEqual(invalid_res.status_code, 401)
        self.assertIn("Invalid", invalid_res.json()["detail"])

        # 3. Missing username or password -> 400
        missing_res = self.client.post("/api/v1/auth/login", json={"username": "admin@riskauth.ai"})
        self.assertEqual(missing_res.status_code, 400)

    def test_21_jwt_auth_and_token_validation(self):
        """Test GET /api/v1/auth/me token verification and rejection of malformed tokens."""
        # 1. Authenticated session check
        res = self.client.get("/api/v1/auth/me", headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        profile = res.json()
        self.assertEqual(profile["username"], "admin@riskauth.ai")
        self.assertEqual(profile["role"], "admin")
        self.assertTrue(profile["authenticated"])

        # 2. Missing token -> 401
        unauth_res = self.client.get("/api/v1/auth/me")
        self.assertEqual(unauth_res.status_code, 401)

        # 3. Tampered token signature -> 401
        tampered_res = self.client.get("/api/v1/auth/me", headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.tampered.token"})
        self.assertEqual(tampered_res.status_code, 401)

    def test_22_rate_limiting_enforcement(self):
        """Test that SlowAPI rate limiting enforces limits and returns HTTP 429 when threshold exceeded."""
        main.limiter.reset()

        # The auth endpoint limit is configured to 10/minute
        status_codes = []
        for _ in range(12):
            res = self.client.post("/api/v1/auth/login", json={
                "username": "admin@riskauth.ai",
                "password": "RiskAuthAdmin2026!"
            })
            status_codes.append(res.status_code)

        # Confirm that at least one request was throttled with HTTP 429
        self.assertIn(429, status_codes)

        # Reset limiter for subsequent operations
        main.limiter.reset()

    def test_23_input_validation_and_bounds(self):
        """Test strict input validation and boundary checks on endpoints."""
        # 1. Negative failedAttempts -> 422
        bad_payload = {
            "device": "trusted",
            "failedAttempts": -5
        }
        res = self.client.post("/api/v1/evaluate-risk", json=bad_payload)
        self.assertEqual(res.status_code, 422)

        # 2. Invalid threshold range (lowMax > mediumMax) -> 422
        invalid_thresh = self.client.put(
            "/api/v1/settings/thresholds",
            json={"lowMax": 75, "mediumMax": 50},
            headers=self.auth_headers
        )
        self.assertEqual(invalid_thresh.status_code, 422)

    # -------------------------------------------------------------
    # Phase 4A: Prometheus Monitoring & Structured Logging Tests
    # -------------------------------------------------------------

    def test_24_metrics_endpoint_availability(self):
        """Test GET /metrics returns HTTP 200 with Prometheus text formatting and core metric families."""
        res = self.client.get("/metrics")
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/plain", res.headers.get("content-type", ""))
        body = res.text

        # Core Prometheus metric families must be present
        self.assertIn("http_requests_total", body)
        self.assertIn("http_request_duration_seconds", body)
        self.assertIn("ml_risk_evaluation_duration_seconds", body)
        self.assertIn("risk_auth_decisions_total", body)
        self.assertIn("risk_score_distribution", body)

    def test_25_metrics_request_counting_and_decisions(self):
        """Test that risk evaluation updates decision metrics with bounded labels and zero PII."""
        # Execute an evaluate-risk request with low risk signals
        payload = {
            "device": "trusted",
            "ipAddress": "192.168.1.100",
            "location": "normal",
            "failedAttempts": 0,
            "userEmail": "private.employee@company.com"
        }
        res = self.client.post("/api/v1/evaluate-risk", json=payload)
        self.assertEqual(res.status_code, 200)

        # Scrape metrics
        metrics_res = self.client.get("/metrics")
        self.assertEqual(metrics_res.status_code, 200)
        metrics_text = metrics_res.text

        # Bounded labels must exist (e.g. decision="ALLOW", risk_level="LOW")
        self.assertIn("risk_auth_decisions_total", metrics_text)
        self.assertIn('decision="ALLOW"', metrics_text)
        self.assertIn('risk_level="LOW"', metrics_text)

        # Guarantee zero personal or telemetry data in metrics labels
        self.assertNotIn("private.employee@company.com", metrics_text)
        self.assertNotIn("192.168.1.100", metrics_text)

    def test_26_structured_json_logging(self):
        """Test that JSONLogFormatter outputs valid JSON with timestamp, level, request_id, and duration."""
        import logging
        from logger import JSONLogFormatter

        formatter = JSONLogFormatter()
        record = logging.LogRecord(
            name="test_logger",
            level=logging.INFO,
            pathname=__file__,
            lineno=10,
            msg="User authentication evaluated",
            args=(),
            exc_info=None,
        )
        record.request_id = "req_test_12345"
        record.method = "POST"
        record.path = "/api/v1/evaluate-risk"
        record.status_code = 200
        record.duration_ms = 12.34
        record.action = "AUTH_DECISION_ALLOW"

        formatted = formatter.format(record)
        import json
        log_json = json.loads(formatted)

        self.assertIn("timestamp", log_json)
        self.assertEqual(log_json["level"], "INFO")
        self.assertEqual(log_json["message"], "User authentication evaluated")
        self.assertEqual(log_json["request_id"], "req_test_12345")
        self.assertEqual(log_json["method"], "POST")
        self.assertEqual(log_json["path"], "/api/v1/evaluate-risk")
        self.assertEqual(log_json["status_code"], 200)
        self.assertEqual(log_json["duration_ms"], 12.34)
        self.assertEqual(log_json["action"], "AUTH_DECISION_ALLOW")

    def test_27_sensitive_data_redaction(self):
        """Test that logger.sanitize_data redacts passwords, tokens, JWTs, and authorization credentials."""
        from logger import sanitize_data

        sensitive_payload = {
            "username": "admin@riskauth.ai",
            "password": "SuperSecretPassword123!",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sensitive_payload",
            "access_token": "secret_access_token_xyz",
            "client_secret": "my_client_secret_987",
            "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.token",
            "nested": {
                "admin_password": "nested_secret_pass",
                "api_key": "api_key_abc_123",
                "risk_score": 85,
                "status": "active"
            }
        }

        sanitized = sanitize_data(sensitive_payload)

        # Credentials must be redacted
        self.assertEqual(sanitized["password"], "[REDACTED]")
        self.assertEqual(sanitized["token"], "[REDACTED]")
        self.assertEqual(sanitized["access_token"], "[REDACTED]")
        self.assertEqual(sanitized["client_secret"], "[REDACTED]")
        self.assertEqual(sanitized["authorization"], "[REDACTED]")
        self.assertEqual(sanitized["nested"]["admin_password"], "[REDACTED]")
        self.assertEqual(sanitized["nested"]["api_key"], "[REDACTED]")

        # Non-sensitive operational metadata must be preserved
        self.assertEqual(sanitized["username"], "admin@riskauth.ai")
        self.assertEqual(sanitized["nested"]["risk_score"], 85)
        self.assertEqual(sanitized["nested"]["status"], "active")

    def test_28_log_level_and_metrics_configuration(self):
        """Test that log level and metrics toggling are configurable via settings."""
        from config import settings

        self.assertIn(settings.LOG_LEVEL.upper(), ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"])
        self.assertIsInstance(settings.PROMETHEUS_METRICS_ENABLED, bool)
        self.assertTrue(settings.PROMETHEUS_METRICS_ENABLED)


if __name__ == "__main__":
    unittest.main()
