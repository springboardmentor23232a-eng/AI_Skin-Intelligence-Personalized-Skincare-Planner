import os
import re
import json
import base64
import logging
from typing import Generator, Optional, Dict, Any
from urllib.parse import quote_plus, urlparse, parse_qs, urlencode, urlunparse
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("skincare_api")

load_dotenv()


def _clean(val: Optional[str], default: str = "") -> str:
    """Strip quotes and surrounding whitespace from env values."""
    if val is None:
        return default
    return val.strip("'\" \t\r\n")


def _extract_project_ref(url: str, key: str) -> Optional[str]:
    """Derive Supabase project reference from project URL or JWT token payload."""
    if url:
        m = re.search(r"https?://([a-zA-Z0-9_-]+)\.supabase\.co", url)
        if m:
            return m.group(1)
    if key and "." in key:
        try:
            parts = key.split(".")
            if len(parts) >= 2:
                payload = parts[1]
                padded = payload + "=" * (-len(payload) % 4)
                data = json.loads(base64.urlsafe_b64decode(padded))
                if isinstance(data, dict) and data.get("ref"):
                    return str(data["ref"])
        except Exception:
            pass
    return None


# ── 1. Supabase Credentials (Project URL & Anon Key) ──────────────────────────
# All database connections are routed exclusively to Supabase Cloud PostgreSQL.
# Local database connections (localhost, local ports) have been completely removed.
SUPABASE_URL = _clean(os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL"))
SUPABASE_KEY = _clean(
    os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

PROJECT_REF = _extract_project_ref(SUPABASE_URL, SUPABASE_KEY)
if (not SUPABASE_URL or not SUPABASE_URL.startswith("http")) and PROJECT_REF:
    SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"

# Initialize official Supabase Python Client
supabase_client = None
if SUPABASE_URL and SUPABASE_KEY and "your-project-ref" not in SUPABASE_URL:
    try:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase API client initialized successfully.")
    except Exception as err:
        logger.warning("Could not initialize Supabase API client: %s", err)


def get_supabase_client():
    """Returns the official Supabase API client (or None if unconfigured)."""
    return supabase_client


# ── 2. Supabase Cloud PostgreSQL Connection Builder ──────────────────────────
def get_database_url() -> str:
    """
    Constructs the PostgreSQL connection URL for Supabase using Project URL and Anon Key.
    
    Architecture:
      - Host: db.<project-ref>.supabase.co (derived directly from SUPABASE_URL)
      - Port: 5432 (default PostgreSQL SSL port for Supabase)
      - User: postgres
      - Database: postgres
      - Password: Anon Key / API Key (or SUPABASE_DB_PASSWORD if configured)
      - SSL Mode: require (strictly enforced for cloud Supabase)
    
    All local database fallbacks have been completely removed.
    """
    # 1. Direct DATABASE_URL override if provided in .env
    raw_url = _clean(
        os.getenv("DATABASE_URL")
        or os.getenv("SUPABASE_DATABASE_URL")
        or os.getenv("SUPABASE_DB_URL")
    )

    if raw_url:
        # Standardize postgresql protocol for SQLAlchemy >= 1.4
        if raw_url.startswith("postgres://"):
            raw_url = "postgresql://" + raw_url[len("postgres://"):]
        elif not raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+psycopg2://"):
            raw_url = f"postgresql://{raw_url}"

        # Enforce sslmode=require for Supabase cloud connections
        parsed = urlparse(raw_url)
        query_params = parse_qs(parsed.query)
        if "sslmode" not in query_params:
            query_params["sslmode"] = ["require"]
            new_query = urlencode(query_params, doseq=True)
            raw_url = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                new_query,
                parsed.fragment
            ))

        return raw_url

    # 2. Derive connection details from SUPABASE_URL and SUPABASE_ANON_KEY
    project_ref = PROJECT_REF or _extract_project_ref(SUPABASE_URL, SUPABASE_KEY)

    # Supabase IPv4 Connection Pooler avoids IPv6 socket timeouts on Windows & broadband networks
    pooler_host = os.getenv("SUPABASE_DB_HOST")
    if not pooler_host:
        if project_ref == "sstjoceikqudhcbafgta":
            pooler_host = "aws-0-ap-southeast-1.pooler.supabase.com"
        elif project_ref:
            pooler_host = f"db.{project_ref}.supabase.co"

    host = _clean(pooler_host)

    # Password resolution: uses SUPABASE_DB_PASSWORD if provided, otherwise SUPABASE_KEY (anon key)
    raw_password = _clean(os.getenv("SUPABASE_DB_PASSWORD") or SUPABASE_KEY)
    encoded_password = quote_plus(raw_password) if raw_password else ""

    # When connecting to Supabase pooler, PostgreSQL user format is postgres.<project-ref>
    default_user = f"postgres.{project_ref}" if (project_ref and "pooler.supabase.com" in host) else "postgres"
    user = _clean(os.getenv("SUPABASE_DB_USER"), default_user)
    port = _clean(os.getenv("SUPABASE_DB_PORT"), "5432")
    dbname = _clean(os.getenv("SUPABASE_DB_NAME"), "postgres")
    ssl_mode = _clean(os.getenv("SUPABASE_DB_SSLMODE", os.getenv("SSLMODE")), "require")

    if not host:
        raise ValueError(
            "Supabase database host could not be determined. "
            "Please ensure SUPABASE_URL (e.g. 'https://your-project-ref.supabase.co') "
            "and SUPABASE_ANON_KEY are provided in your .env file."
        )

    auth = f"{user}:{encoded_password}" if encoded_password else user
    return f"postgresql://{auth}@{host}:{port}/{dbname}?sslmode={ssl_mode}"


DATABASE_URL = get_database_url()

# ── 3. SQLAlchemy Engine for Supabase Cloud Database ─────────────────────────
# Connection pool settings optimized for Supabase:
# - pool_pre_ping: verifies socket liveness prior to checkout to prevent stale disconnects
# - pool_recycle: recycles connections every 300 seconds to prevent cloud firewall timeouts
# - connect_timeout: 15 seconds to gracefully handle network latency
connect_args: Dict[str, Any] = {
    "connect_timeout": 15,
}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
    """FastAPI dependency for yielding Supabase database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
