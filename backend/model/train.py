"""
RiskAuthAI ML Model Training & Evaluation Pipeline (Phase 2)
============================================================

Trains Random Forest Regressor on correlated authentication telemetry.
Compares performance against Mean Dummy and Ordinary Least Squares Baselines.
Integrates SHAP TreeExplainer for true instance-level explainable AI (XAI).
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    average_precision_score,
)
import shap

def preprocess_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Stateless encoding of categorical login signals into numerical vectors.
    """
    X = pd.DataFrame()
    X['failed_attempts'] = df['failed_attempts'].astype(float)
    X['device'] = (df['device'].astype(str).str.lower() == 'unknown').astype(int)
    X['location'] = (df['location'].astype(str).str.lower() == 'unusual').astype(int)
    X['vpn'] = (df['vpn'].astype(str).str.lower() == 'yes').astype(int)
    X['login_time'] = (df['login_time'].astype(str).str.lower() == 'unusual').astype(int)
    X['behaviour'] = (df['behaviour'].astype(str).str.lower() == 'suspicious').astype(int)
    return X

def train_and_evaluate():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, '..', 'data', 'dataset.csv')

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Run generate_dataset.py first.")

    df = pd.read_csv(dataset_path)
    X = preprocess_features(df)
    y = df['risk_score']

    # 80/20 Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 1. Baseline 1: Dummy Regressor (Mean predictor)
    dummy = DummyRegressor(strategy='mean')
    dummy.fit(X_train, y_train)
    dummy_pred = dummy.predict(X_test)

    # 2. Baseline 2: Linear Regression
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    lr_pred = lr.predict(X_test)

    # 3. Random Forest Regressor (Ensemble Model)
    rf = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)

    # Regression Metrics
    results = {}
    for name, pred in [("Dummy Baseline", dummy_pred), ("Linear Regression", lr_pred), ("Random Forest", rf_pred)]:
        results[name] = {
            "MAE": mean_absolute_error(y_test, pred),
            "RMSE": np.sqrt(mean_squared_error(y_test, pred)),
            "R2": r2_score(y_test, pred),
        }

    print("\n" + "=" * 65)
    print("      MODEL REGRESSION EVALUATION METRICS (TEST SET, N=800)")
    print("=" * 65)
    for name, m in results.items():
        print(f"{name:20}: MAE = {m['MAE']:.2f} | RMSE = {m['RMSE']:.2f} | R² = {m['R2']:.4f}")

    # Downstream Classification Metrics (High Risk >= 70 threshold with integer-rounded alignment)
    y_test_rounded = np.round(np.clip(y_test, 0, 100)).astype(int)
    rf_pred_rounded = np.round(np.clip(rf_pred, 0, 100)).astype(int)

    y_test_high_binary = (y_test_rounded >= 70).astype(int)
    rf_high_prob = np.clip(rf_pred / 100.0, 0, 1)
    rf_high_binary = (rf_pred_rounded >= 70).astype(int)

    roc_auc = roc_auc_score(y_test_high_binary, rf_high_prob)
    pr_auc = average_precision_score(y_test_high_binary, rf_high_prob)
    cm = confusion_matrix(y_test_high_binary, rf_high_binary)

    print("\n" + "=" * 65)
    print("      HIGH-RISK DETECTION PERFORMANCE (SCORE >= 70)")
    print("=" * 65)
    print(f"ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test_high_binary, rf_high_binary, target_names=["Normal / OTP", "High Risk (BLOCK)"]))
    print("Confusion Matrix [ [TN, FP], [FN, TP] ]:")
    print(cm)

    # Multi-tier Policy Decision Metrics (ALLOW / OTP / BLOCK with aligned rounding)
    def to_decision(scores):
        decisions = []
        for s in scores:
            score_int = int(round(np.clip(s, 0, 100)))
            if score_int <= 39:
                decisions.append("ALLOW")
            elif score_int <= 69:
                decisions.append("OTP")
            else:
                decisions.append("BLOCK")
        return decisions

    y_true_dec = to_decision(y_test)
    y_pred_dec = to_decision(rf_pred)

    print("\n" + "=" * 65)
    print("      POLICY DECISION REPORT (ALLOW / OTP / BLOCK)")
    print("=" * 65)
    print(classification_report(y_true_dec, y_pred_dec, labels=["ALLOW", "OTP", "BLOCK"]))

    # 4. Initialize SHAP TreeExplainer
    print("\nInitializing SHAP TreeExplainer for model explainability...")
    explainer = shap.TreeExplainer(rf)
    expected_val = float(explainer.expected_value[0] if isinstance(explainer.expected_value, np.ndarray) else explainer.expected_value)
    print(f"SHAP TreeExplainer Ready. Global Base Value (Expected Score): {expected_val:.2f}")

    # 5. Check against previous model backup if present
    model_path = os.path.join(script_dir, 'risk_model.joblib')
    backup_path = os.path.join(script_dir, 'risk_model_v1_backup.joblib')

    # Safety: ensure backup exists
    if os.path.exists(model_path) and not os.path.exists(backup_path):
        joblib.dump(joblib.load(model_path), backup_path)
        print(f"Preserved pre-Phase-2 model backup at: {backup_path}")

    # Save new artifact with TreeExplainer bundled
    model_artifact = {
        'model': rf,
        'explainer': explainer,
        'expected_value': expected_val,
        'feature_names': list(X.columns),
        'model_name': 'RandomForestRegressor',
        'version': '2.0.0'
    }

    joblib.dump(model_artifact, model_path)
    print(f"[SUCCESS] Trained Phase 2 model artifact with SHAP saved to: {model_path}")
    return model_path

if __name__ == '__main__':
    train_and_evaluate()
