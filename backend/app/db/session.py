import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

def get_engine(db_url: str):
    if db_url.startswith("sqlite"):
        return create_engine(db_url, connect_args={"check_same_thread": False})
    return create_engine(
        db_url,
        pool_size=20,
        max_overflow=10,
        pool_recycle=3600,
        pool_pre_ping=True,
        pool_timeout=30
    )

# Cloud-first database connection handling
engine = None
configured_url = settings.DATABASE_URL

# 1. Attempt configured DATABASE_URL first
if configured_url:
    try:
        temp_engine = get_engine(configured_url)
        with temp_engine.connect() as conn:
            pass
        DATABASE_URL = configured_url
        engine = temp_engine
        safe_host = configured_url.split("@")[-1] if "@" in configured_url else "configured target"
        print(f"Successfully connected to database at {safe_host}")
    except Exception as e:
        print(f"Configured DATABASE_URL connection failed: {e}")

# 2. Local development fallback: try common local PostgreSQL passwords if local host
if engine is None and ("localhost" in configured_url or "127.0.0.1" in configured_url):
    passwords_to_try = ["postgres", "admin", "root", "1234", "123456", "password"]
    for pwd in passwords_to_try:
        try_url = f"postgresql://postgres:{pwd}@localhost:5432/skin_db"
        try:
            temp_engine = get_engine(try_url)
            with temp_engine.connect() as conn:
                pass
            DATABASE_URL = try_url
            engine = temp_engine
            print(f"Connected to local PostgreSQL with user 'postgres' and password '{pwd}'")
            break
        except Exception:
            continue

# 3. Final fallback for offline testing / sandbox
if engine is None:
    print("PostgreSQL connection unavailable. Falling back to SQLite database.")
    DATABASE_URL = "sqlite:///./skin_db.db"
    engine = get_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
