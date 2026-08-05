from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Create SQLAlchemy database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

# Create session pool maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base model class
Base = declarative_base()

# Request-scoped database session generator dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
