import os
from typing import Generator, Optional
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

def _clean(val: Optional[str], default: str = "") -> str:
    if val is None:
        return default
    return val.strip("'\" \t\r\n")

user = _clean(os.getenv("DB_USER"), "postgres")
raw_password = _clean(os.getenv("DB_PASSWORD"), "postgres")
encoded_password = quote_plus(raw_password) if raw_password else ""

host = _clean(os.getenv("DB_HOST"), "localhost")
port = _clean(os.getenv("DB_PORT"), "5432")
dbname = _clean(os.getenv("DB_NAME"), "skin")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = f"postgresql://{user}:{encoded_password}@{host}:{port}/{dbname}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
