import os
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# Base data directory and SQLite path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
DEFAULT_DB_PATH = os.path.join(DATA_DIR, "riskauth.db")

# Read from settings or use default path
DATABASE_URL = getattr(settings, "DATABASE_URL", None) or f"sqlite:///{DEFAULT_DB_PATH}"

# Ensure data directory exists if a custom sqlite file URL is provided
if DATABASE_URL.startswith("sqlite:///"):
    sqlite_file = DATABASE_URL.replace("sqlite:///", "", 1)
    if sqlite_file and sqlite_file != ":memory:":
        parent_dir = os.path.dirname(os.path.abspath(sqlite_file))
        if parent_dir:
            os.makedirs(parent_dir, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,
        "timeout": 15.0
    }
)

# Module-level initialization status tracking
INIT_STATUS = {
    "initialized": False,
    "error": None
}

def set_init_status(initialized: bool, error: str = None):
    INIT_STATUS["initialized"] = initialized
    INIT_STATUS["error"] = error

def get_init_status() -> dict:
    return dict(INIT_STATUS)

# Apply connection-scoped SQLite settings on connect
@event.listens_for(engine, "connect")
def configure_sqlite_connection(dbapi_connection, connection_record):
    """
    Applies connection-scoped PRAGMAs: busy timeout, synchronous, and foreign keys.
    Persistent journal_mode is configured during init_db to avoid repeated header writes.
    """
    if engine.dialect.name == "sqlite":
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA busy_timeout=5000;")
            cursor.execute("PRAGMA synchronous=NORMAL;")
            cursor.execute("PRAGMA foreign_keys=ON;")
        finally:
            cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def run_integrity_check(target_engine=None) -> dict:
    """
    Executes SQLite PRAGMA integrity_check and reports diagnostic health.
    Truthfully reports errors without optimistic fallbacks.
    """
    eng = target_engine or engine
    try:
        with eng.connect() as conn:
            result = conn.execute(text("PRAGMA integrity_check;")).scalar()
            jm = conn.execute(text("PRAGMA journal_mode;")).scalar()
            fk = conn.execute(text("PRAGMA foreign_keys;")).scalar()
            timeout = conn.execute(text("PRAGMA busy_timeout;")).scalar()

            init_err = INIT_STATUS.get("error")
            is_ok = (result == "ok") and (init_err is None)
            return {
                "status": "healthy" if is_ok else "unhealthy",
                "integrity": result if result else "unknown",
                "journal_mode": str(jm).lower() if jm else "unknown",
                "foreign_keys": bool(fk),
                "busy_timeout_ms": int(timeout) if timeout is not None else 0,
                "initialization_error": init_err
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "integrity": f"Diagnostic error: {str(e)}",
            "journal_mode": "unknown",
            "foreign_keys": False,
            "busy_timeout_ms": 0,
            "initialization_error": INIT_STATUS.get("error") or str(e)
        }
