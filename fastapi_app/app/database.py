import logging
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("skin_assessment_db")

Base = declarative_base()

def initialize_engine():
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url or any(h in db_url for h in ["localhost", "127.0.0.1", "7410"]):
        logger.info("Using production SQLite database engine.")
        return create_engine("sqlite:///./skincare_production.db", connect_args={"check_same_thread": False})
    
    try:
        eng = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to external PostgreSQL database.")
        return eng
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Defaulting to production SQLite engine.")
        return create_engine("sqlite:///./skincare_production.db", connect_args={"check_same_thread": False})

engine = initialize_engine()
fallback_engine = create_engine("sqlite:///./skincare_production.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
FallbackSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=fallback_engine)

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
