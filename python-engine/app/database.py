from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Database connection - use a stable SQLite path for development
DB_PATH = Path(__file__).resolve().parent.parent / "skin_assessment.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH.as_posix()}")

# Force SQLite usage by removing any PostgreSQL environment variable
if DATABASE_URL.startswith("postgresql"):
    print("PostgreSQL URL detected, switching to SQLite for development")
    DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"

try:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    # Test connection
    with engine.connect() as conn:
        pass
    print(f"Connected to SQLite database")
except Exception as e:
    print(f"Could not connect to SQLite: {e}")
    raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency for getting database sessions.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initialize database tables.
    """
    try:
        from app.models import Base
        # Import all models to ensure they're registered with Base
        from app.models import (
            SkinAssessment, SkinConcern, RiskFactor, SkincareRoutine, RoutineStep,
            Ingredient, Product, ProductRecommendation,
            UserProgress, ProgressMilestone,
            SkinAnalytics, UserDashboard,
            SkinHealthScore
        )
        Base.metadata.create_all(bind=engine)
        print("Database initialized successfully")
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")
        print("API will run but database operations will fail until DB is configured")
