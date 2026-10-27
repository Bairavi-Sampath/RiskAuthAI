"""
RiskAuthAI SQLite Online Backup & Recovery Tool

Uses Python's sqlite3 Connection.backup API to perform non-blocking,
online hot backups of the active database while FastAPI is running.
Includes atomic staging, schema validation, SHA-256 companion manifests,
and a cautious, validated restore procedure.
"""

import os
import sys
import json
import sqlite3
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

# Add backend directory to sys.path if run directly
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from db.database import DEFAULT_DB_PATH, DATA_DIR

DEFAULT_BACKUP_DIR = os.path.join(DATA_DIR, "backups")

# Required tables for a valid RiskAuthAI database backup
REQUIRED_TABLES = [
    "login_events",
    "security_alerts",
    "user_accounts",
    "risk_threshold_settings"
]

# Required schema columns for critical models
REQUIRED_SCHEMA_COLUMNS = {
    "login_events": ["id", "user_email", "timestamp", "risk_score", "decision"],
    "security_alerts": ["id", "title", "severity", "user_email", "risk_score", "status"],
    "user_accounts": ["id", "name", "email", "role"],
    "risk_threshold_settings": ["id", "low_max", "medium_max", "high_min"]
}


def _compute_sha256(file_path: str) -> str:
    """Computes SHA-256 checksum of a file."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def create_backup(
    source_db_path: Optional[str] = None,
    backup_dir: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates an atomic online hot backup using SQLite Online Backup API.
    Does not block concurrent FastAPI reads or writes.
    Staged in a temporary file to guarantee no partial backups exist on failure.
    Validates integrity, required tables, and schema before finalizing.
    Generates companion SHA-256 and manifest files.
    """
    source_path = os.path.abspath(source_db_path or DEFAULT_DB_PATH)
    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source database not found at {source_path}")

    target_dir = os.path.abspath(backup_dir or DEFAULT_BACKUP_DIR)
    os.makedirs(target_dir, exist_ok=True)

    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_filename = f"riskauth_backup_{timestamp_str}.db"
    final_backup_path = os.path.join(target_dir, backup_filename)
    temp_backup_path = final_backup_path + ".tmp"
    manifest_path = os.path.join(target_dir, f"{backup_filename}.manifest.json")
    sha256_path = os.path.join(target_dir, f"{backup_filename}.sha256")

    try:
        # 1. Perform online backup into temporary staging file
        source_conn = sqlite3.connect(source_path, timeout=15.0)
        temp_conn = sqlite3.connect(temp_backup_path, timeout=15.0)

        try:
            source_conn.backup(temp_conn, pages=100)
        finally:
            temp_conn.close()
            source_conn.close()

        # 2. Validate the staged backup (integrity + required schema)
        verification = verify_backup(temp_backup_path)
        if verification.get("status") != "valid":
            raise RuntimeError(
                f"Backup validation failed on staged copy: "
                f"{verification.get('error') or verification.get('integrity')}"
            )

        # 3. Compute checksum and write companion manifest
        file_size = os.path.getsize(temp_backup_path)
        sha256_checksum = _compute_sha256(temp_backup_path)

        manifest = {
            "backup_filename": backup_filename,
            "created_at_utc": timestamp_str,
            "size_bytes": file_size,
            "sha256": sha256_checksum,
            "source_file": source_path,
            "tables": verification.get("tables", {}),
            "schema_verified": True
        }

        # 4. Atomically commit the backup by renaming .tmp to .db
        os.replace(temp_backup_path, final_backup_path)

        with open(manifest_path, "w", encoding="utf-8") as mf:
            json.dump(manifest, mf, indent=2)

        with open(sha256_path, "w", encoding="utf-8") as sf:
            sf.write(f"{sha256_checksum}  {backup_filename}\n")

        return {
            "status": "success",
            "timestamp": timestamp_str,
            "backup_file": final_backup_path,
            "backup_filename": backup_filename,
            "manifest_file": manifest_path,
            "sha256_file": sha256_path,
            "size_bytes": file_size,
            "sha256": sha256_checksum,
            "integrity": "ok",
            "tables": verification.get("tables", {})
        }

    except Exception as e:
        # Guarantee no partial or corrupt files exist on failure
        for p in [temp_backup_path, final_backup_path, manifest_path, sha256_path]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass
        raise e


def verify_backup(
    backup_file_path: str,
    expected_checksum: Optional[str] = None,
    require_checksum: bool = False
) -> Dict[str, Any]:
    """
    Inspects a backup snapshot for SQLite integrity, required tables,
    schema column contracts, and SHA-256 checksum matching against a manifest or expected hash.
    """
    path = os.path.abspath(backup_file_path)
    if not os.path.exists(path):
        return {"status": "error", "error": f"File not found: {path}", "integrity": "missing_file"}

    # 1. Checksum validation (if expected hash provided or companion manifest exists)
    actual_checksum = _compute_sha256(path)
    target_checksum = expected_checksum

    if not target_checksum:
        # Check for companion .manifest.json
        manifest_file = path + ".manifest.json"
        if not os.path.exists(manifest_file):
            manifest_file = os.path.splitext(path)[0] + ".manifest.json"

        if os.path.exists(manifest_file):
            try:
                with open(manifest_file, "r", encoding="utf-8") as mf:
                    target_checksum = json.load(mf).get("sha256")
            except Exception:
                pass

        # Check for companion .sha256
        if not target_checksum:
            sha_file = path + ".sha256"
            if not os.path.exists(sha_file):
                sha_file = os.path.splitext(path)[0] + ".sha256"
            if os.path.exists(sha_file):
                try:
                    with open(sha_file, "r", encoding="utf-8") as sf:
                        target_checksum = sf.read().split()[0].strip()
                except Exception:
                    pass

    if require_checksum and not target_checksum:
        return {
            "status": "error",
            "file": path,
            "error": "No trusted manifest or expected checksum found to verify against",
            "integrity": "missing_checksum"
        }

    if target_checksum and actual_checksum.lower() != target_checksum.lower():
        return {
            "status": "corrupt",
            "file": path,
            "error": f"Checksum mismatch: expected {target_checksum}, got {actual_checksum}",
            "integrity": "checksum_mismatch",
            "actual_sha256": actual_checksum,
            "expected_sha256": target_checksum
        }

    # 2. PRAGMA integrity_check
    conn = None
    try:
        conn = sqlite3.connect(path, timeout=10.0)
        cursor = conn.cursor()
        cursor.execute("PRAGMA integrity_check;")
        res = cursor.fetchone()
        integrity_status = res[0] if res else "empty"
        if integrity_status != "ok":
            return {
                "status": "corrupt",
                "file": path,
                "error": f"SQLite PRAGMA integrity_check failed: {integrity_status}",
                "integrity": integrity_status
            }

        # 3. Check for existence of all required tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        existing_tables = {row[0] for row in cursor.fetchall()}

        missing_tables = [t for t in REQUIRED_TABLES if t not in existing_tables]
        if missing_tables:
            return {
                "status": "corrupt",
                "file": path,
                "error": f"Missing required table(s): {', '.join(missing_tables)}",
                "integrity": "missing_required_tables",
                "missing_tables": missing_tables
            }

        # 4. Check column presence for required tables
        table_counts = {}
        for table, expected_cols in REQUIRED_SCHEMA_COLUMNS.items():
            cursor.execute(f"PRAGMA table_info({table});")
            col_names = {row[1] for row in cursor.fetchall()}
            missing_cols = [c for c in expected_cols if c not in col_names]
            if missing_cols:
                return {
                    "status": "corrupt",
                    "file": path,
                    "error": f"Table '{table}' missing required column(s): {', '.join(missing_cols)}",
                    "integrity": "invalid_schema"
                }

            cursor.execute(f"SELECT count(*) FROM {table};")
            table_counts[table] = cursor.fetchone()[0]

        cursor.close()

        return {
            "status": "valid",
            "file": path,
            "integrity": "ok",
            "sha256": actual_checksum,
            "checksum_verified": bool(target_checksum),
            "tables": table_counts
        }

    except Exception as e:
        return {
            "status": "error",
            "file": path,
            "error": str(e),
            "integrity": "error"
        }
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def restore_backup(
    backup_file_path: str,
    target_db_path: str,
    dry_run: bool = True,
    overwrite: bool = False
) -> Dict[str, Any]:
    """
    Cautiously restores a verified backup into a target database location.

    Safety Rules:
    - Never restores directly over the active project database (DEFAULT_DB_PATH).
    - Never executes if backup integrity or schema verification fails.
    - Defaults to dry_run=True to prevent accidental modifications.
    - If target_db_path already exists and overwrite=False, raises FileExistsError.
    - Writes to an isolated temporary file before atomically replacing target.
    """
    backup_path = os.path.abspath(backup_file_path)
    target_path = os.path.abspath(target_db_path)

    # 1. Active database protection guard
    if target_path == os.path.abspath(DEFAULT_DB_PATH):
        raise PermissionError(
            f"Refusing to restore over the active database path '{DEFAULT_DB_PATH}'. "
            "Direct overwrite of the active database is prohibited."
        )

    # 2. Target existence guard
    if os.path.exists(target_path) and not overwrite:
        raise FileExistsError(
            f"Target database already exists at '{target_path}'. "
            "Refusing to restore without explicit overwrite=True."
        )

    # 3. Verify source backup before proceeding
    verification = verify_backup(backup_path)
    if verification.get("status") != "valid":
        raise ValueError(
            f"Cannot restore: Backup failed validation: {verification.get('error') or verification.get('integrity')}"
        )

    if dry_run:
        return {
            "status": "dry_run",
            "message": "Dry run complete. No modifications made.",
            "source_backup": backup_path,
            "target_destination": target_path,
            "tables_to_restore": verification.get("tables", {})
        }

    # 4. Perform online restore into temporary staging file
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    temp_target_path = target_path + ".tmp"

    try:
        backup_conn = sqlite3.connect(backup_path, timeout=15.0)
        target_conn = sqlite3.connect(temp_target_path, timeout=15.0)

        try:
            backup_conn.backup(target_conn, pages=100)
        finally:
            target_conn.close()
            backup_conn.close()

        # 5. Verify post-restore integrity on temp target
        post_verification = verify_backup(temp_target_path)
        if post_verification.get("status") != "valid":
            raise RuntimeError(f"Target database integrity failed after restore: {post_verification}")

        # 6. Atomically replace target database
        os.replace(temp_target_path, target_path)

        return {
            "status": "success",
            "source_backup": backup_path,
            "target_restored": target_path,
            "integrity": "ok",
            "tables_restored": post_verification.get("tables", {})
        }

    except Exception as e:
        if os.path.exists(temp_target_path):
            try:
                os.remove(temp_target_path)
            except Exception:
                pass
        raise e


if __name__ == "__main__":
    if "--create" in sys.argv:
        res = create_backup()
        print(f"[SUCCESS] Created backup: {res['backup_filename']} (Size: {res['size_bytes']} bytes, SHA256: {res['sha256'][:16]}...)")
    elif "--verify" in sys.argv:
        idx = sys.argv.index("--verify")
        if len(sys.argv) > idx + 1:
            file_to_check = sys.argv[idx + 1]
            res = verify_backup(file_to_check)
            print(f"Verification: {res}")
        else:
            print("Usage: python backup.py --verify <path_to_backup_file>")
    else:
        print("RiskAuthAI SQLite Online Backup Tool")
        print("Commands:")
        print("  python -m db.backup --create")
        print("  python -m db.backup --verify <backup_file>")
