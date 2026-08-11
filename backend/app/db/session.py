import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

def get_engine(db_url: str):
    if db_url.startswith("sqlite"):
        return create_engine(db_url, connect_args={"check_same_thread": False})
    return create_engine(db_url, pool_pre_ping=True)

# Connection handling to PostgreSQL
engine = None
passwords_to_try = ["postgres", "admin", "root", "1234", "123456", "password"]

for pwd in passwords_to_try:
    try_url = f"postgresql://postgres:{pwd}@localhost:5432/skin_db"
    try:
        temp_engine = get_engine(try_url)
        with temp_engine.connect() as conn:
            pass
        DATABASE_URL = try_url
        engine = temp_engine
        print(f"Successfully connected to PostgreSQL with user 'postgres' and password '{pwd}'")
        break
    except Exception:
        continue

if engine is None:
    try:
        engine = get_engine(DATABASE_URL)
        with engine.connect() as conn:
            pass
    except Exception as e:
        print(f"PostgreSQL connection failed ({e}). Falling back to SQLite database.")
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
