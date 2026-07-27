from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from pymongo import MongoClient

from app.core.config import settings

# --- PostgreSQL (relational) ---
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- MongoDB (documents: lifestyle logs, articles, notes) ---
mongo_client = MongoClient(settings.MONGO_URL)
mongo_db = mongo_client[settings.MONGO_DB]


def get_mongo():
    return mongo_db
