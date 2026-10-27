"""
RiskAuthAI Synthetic Authentication Dataset Generator (Phase 2)
===============================================================

Simulates realistic, multi-signal authentication telemetry with correlated threat
scenarios, including:
  1. Routine Benign Logins (known hardware, normal hours, residential ISP)
  2. Legitimate Travelers / Remote Workers (unusual location, trusted device, occasional VPN)
  3. Legitimate Users with Password Mistakes (known hardware, 2-4 failed attempts)
  4. Credential Stuffing Attacks (unrecognized device, VPN/proxy, bot biometrics)
  5. Distributed Brute Force Attacks (sprayed attempts from proxies, unfamiliar hardware)

IMPORTANT METHODOLOGICAL NOTES:
- Synthetic Data Disclaimer: This dataset represents a calibrated synthetic distribution
  designed to model non-linear threat correlations. It is not real production telemetry.
- Target Leakage Prevention: Features are generated independently of downstream policy
  decisions. Target risk scores are derived strictly from input signals and threat models.
"""

import os
import numpy as np
import pandas as pd

def generate_dataset(num_samples=4000, seed=42):
    """
    Generates synthetic authentication logs based on conditional threat archetypes.
    """
    np.random.seed(seed)

    # Threat Archetype Distribution:
    # 65% Routine Normal, 10% Traveling/Remote, 7% User Errors, 10% Credential Stuffing, 8% Brute Force
    archetypes = np.random.choice(
        ['normal_routine', 'traveler_remote', 'user_password_struggle', 'credential_stuffing', 'distributed_brute_force'],
        size=num_samples,
        p=[0.65, 0.10, 0.07, 0.10, 0.08]
    )

    records = []
    for arch in archetypes:
        if arch == 'normal_routine':
            # Benign user on regular workstation
            dev = 'unknown' if np.random.rand() < 0.04 else 'trusted'
            loc = 'unusual' if np.random.rand() < 0.03 else 'normal'
            vpn = 'yes' if np.random.rand() < 0.05 else 'no'
            time_val = 'unusual' if np.random.rand() < 0.07 else 'normal'
            beh_val = 'suspicious' if np.random.rand() < 0.01 else 'normal'
            fails = int(np.random.choice([0, 1], p=[0.94, 0.06]))
            base_risk = 5.0

        elif arch == 'traveler_remote':
            # Legitimate user traveling or connecting from foreign hotel/branch
            dev = 'unknown' if np.random.rand() < 0.15 else 'trusted'
            loc = 'unusual' # traveling outside home region
            vpn = 'yes' if np.random.rand() < 0.50 else 'no'
            time_val = 'unusual' if np.random.rand() < 0.40 else 'normal'
            beh_val = 'normal' # genuine human interaction
            fails = int(np.random.choice([0, 1, 2], p=[0.85, 0.12, 0.03]))
            base_risk = 22.0

        elif arch == 'user_password_struggle':
            # Legitimate user forgot password but on known device/location
            dev = 'trusted'
            loc = 'normal'
            vpn = 'no'
            time_val = 'normal'
            beh_val = 'normal' # human cadence
            fails = int(np.random.choice([2, 3, 4], p=[0.35, 0.50, 0.15]))
            base_risk = 18.0

        elif arch == 'credential_stuffing':
            # Automated bot testing stolen credentials from proxy
            dev = 'unknown'
            loc = 'unusual' if np.random.rand() < 0.85 else 'normal'
            vpn = 'yes' if np.random.rand() < 0.90 else 'no'
            time_val = 'unusual' if np.random.rand() < 0.60 else 'normal'
            beh_val = 'suspicious' if np.random.rand() < 0.88 else 'normal' # automated injection
            fails = int(np.random.choice([0, 1, 2, 3], p=[0.30, 0.40, 0.20, 0.10]))
            base_risk = 32.0

        else: # distributed_brute_force
            # High-frequency password spray against enterprise endpoints
            dev = 'unknown' if np.random.rand() < 0.90 else 'trusted'
            loc = 'unusual' if np.random.rand() < 0.80 else 'normal'
            vpn = 'yes' if np.random.rand() < 0.75 else 'no'
            time_val = 'unusual' if np.random.rand() < 0.50 else 'normal'
            beh_val = 'suspicious' if np.random.rand() < 0.85 else 'normal'
            fails = int(np.random.choice([4, 5, 6, 7], p=[0.25, 0.40, 0.25, 0.10]))
            base_risk = 30.0

        # Signal risk contributions
        score = base_risk
        if dev == 'unknown':
            score += 16.0
        if loc == 'unusual':
            score += 14.0
        if vpn == 'yes':
            score += 15.0
        if time_val == 'unusual':
            score += 7.0
        if beh_val == 'suspicious':
            score += 15.0

        # Failed attempt penalty curve
        if fails >= 5:
            score += 16.0
        elif fails >= 3:
            score += 11.0
        else:
            score += fails * 2.5

        # Compound penalty for threat synergy (unknown hardware + VPN + automated telemetry)
        if dev == 'unknown' and vpn == 'yes' and beh_val == 'suspicious':
            score += 10.0

        # Add Gaussian noise for realistic continuous variance
        noise = float(np.random.normal(0, 1.8))
        final_score = float(np.clip(score + noise, 0, 100).round(1))

        records.append({
            'failed_attempts': fails,
            'device': dev,
            'location': loc,
            'vpn': vpn,
            'login_time': time_val,
            'behaviour': beh_val,
            'risk_score': final_score
        })

    df = pd.DataFrame(records)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(script_dir, 'dataset.csv')
    df.to_csv(dataset_path, index=False)
    print(f"[SUCCESS] Correlated threat dataset generated at: {dataset_path} ({len(df)} samples)")
    return dataset_path

if __name__ == '__main__':
    generate_dataset()
