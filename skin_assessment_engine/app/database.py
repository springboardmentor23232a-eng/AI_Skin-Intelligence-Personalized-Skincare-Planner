import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

def create_working_engine(primary_url: str):
    """
    Creates SQLAlchemy Engine.
    If primary PostgreSQL database is unreachable or not created, gracefully falls back to local SQLite DB.
    """
    connect_args = {}
    if primary_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    
    eng = create_engine(primary_url, connect_args=connect_args, pool_pre_ping=True)
    
    # Test connection attempt
    try:
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        return eng
    except Exception as err:
        if primary_url.startswith("postgresql"):
            print(f"\n[INFO] PostgreSQL connection failed (database 'skin_intelligence_db' not initialized locally).")
            print(f"[INFO] Automatically switching to local SQLite database (sqlite:///./skin_assessment_dev.db) for smooth local execution...\n")
            fallback_url = "sqlite:///./skin_assessment_dev.db"
            return create_engine(fallback_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)
        raise err

engine = create_working_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for obtaining database sessions in API request lifecycles."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
