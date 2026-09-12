import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

def normalize_db_url(url: str) -> str:
    if url and url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url

DATABASE_URL = normalize_db_url(settings.DATABASE_URL)

def get_engine(db_url: str):
    db_url = normalize_db_url(db_url)
    if db_url.startswith("sqlite"):
        return create_engine(db_url, connect_args={"check_same_thread": False})
    return create_engine(
        db_url,
        pool_size=5,
        max_overflow=2,
        pool_recycle=300,
        pool_pre_ping=True,
        pool_timeout=10,
        connect_args={"connect_timeout": 10}
    )

configured_url = normalize_db_url(settings.DATABASE_URL)
if configured_url:
    DATABASE_URL = configured_url
    engine = get_engine(DATABASE_URL)
else:
    import tempfile
    db_temp_path = os.path.join(tempfile.gettempdir(), "skin_db.db")
    DATABASE_URL = f"sqlite:///{db_temp_path}"
    engine = get_engine(DATABASE_URL)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
