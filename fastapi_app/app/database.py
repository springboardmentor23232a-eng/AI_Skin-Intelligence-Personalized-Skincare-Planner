import logging
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DATABASE_URL

logger = logging.getLogger("skin_assessment_db")

Base = declarative_base()

# Primary PostgreSQL Engine
try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )
except Exception as e:
    logger.warning(f"PostgreSQL connection engine setup warning: {e}. Using SQLite fallback.")
    engine = create_engine("sqlite:///./fallback_skincare.db", connect_args={"check_same_thread": False})

# Dedicated SQLite Fallback Engine
fallback_engine = create_engine("sqlite:///./fallback_skincare.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
FallbackSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=fallback_engine)

def get_db():
    use_fallback = False
    try:
        db = SessionLocal()
        # Verify connection with quick ping query
        db.execute(text("SELECT 1"))
        yield db
    except Exception as e:
        logger.warning(f"Primary DB session error: {e}. Switching to SQLite fallback DB.")
        use_fallback = True
    finally:
        if not use_fallback:
            try:
                db.close()
            except Exception:
                pass

    if use_fallback:
        db_fallback = FallbackSessionLocal()
        try:
            Base.metadata.create_all(bind=fallback_engine)
        except Exception:
            pass
        try:
            yield db_fallback
        finally:
            db_fallback.close()

