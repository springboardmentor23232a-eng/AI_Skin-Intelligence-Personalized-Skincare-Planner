import logging
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DATABASE_URL

logger = logging.getLogger("skin_assessment_db")

Base = declarative_base()

def initialize_engine():
    db_url = DATABASE_URL
    # Fallback to SQLite if DATABASE_URL is unconfigured or pointing to non-existent localhost PG
    if not db_url or "localhost" in db_url or "127.0.0.1" in db_url:
        logger.info("Localhost or unconfigured PostgreSQL detected. Using production SQLite database engine.")
        return create_engine("sqlite:///./skincare_production.db", connect_args={"check_same_thread": False})

    try:
        eng = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20
        )
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        return eng
    except Exception as e:
        logger.warning(f"PostgreSQL connection warning ({e}). Using SQLite database fallback.")
        return create_engine("sqlite:///./skincare_production.db", connect_args={"check_same_thread": False})

engine = initialize_engine()
fallback_engine = engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
FallbackSessionLocal = SessionLocal

def get_db():
    db = None
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        yield db
    except Exception as e:
        logger.warning(f"Primary DB session error ({e}). Falling back to SQLite Session.")
        if db:
            try:
                db.close()
            except:
                pass
        db = FallbackSessionLocal()
        yield db
    finally:
        if db:
            try:
                db.close()
            except:
                pass


