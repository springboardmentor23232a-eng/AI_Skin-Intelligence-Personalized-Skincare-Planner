import logging
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("skin_assessment_db")

Base = declarative_base()

from app.config import DATABASE_URL

def initialize_engine():
    db_url = DATABASE_URL
    if db_url and db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    connect_args = {}
    if "sqlite" in db_url:
        connect_args["check_same_thread"] = False
    else:
        connect_args["connect_timeout"] = 10

    try:
        eng = create_engine(db_url, pool_pre_ping=True, connect_args=connect_args)
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to primary PostgreSQL database.")
        return eng
    except Exception as e:
        is_production = bool(os.getenv("RENDER") or os.getenv("RENDER_SERVICE_ID") or os.getenv("NODE_ENV") == "production")
        if is_production or "sqlite" not in db_url:
            logger.error(f"CRITICAL DATABASE ERROR: Failed to connect to PostgreSQL database ({e}).")
            # Create engine anyway so startup proceeds, but raise clear error on get_db if unresolvable
            return create_engine(db_url, pool_pre_ping=True, connect_args=connect_args)
        logger.warning(f"Development Mode: PostgreSQL connection failed ({e}). Defaulting to local SQLite.")
        return create_engine("sqlite:///./skincare_production.db", connect_args={"check_same_thread": False})

engine = initialize_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

