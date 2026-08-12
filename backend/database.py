import os
import hashlib
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if not db_url:
    raise ValueError("DATABASE_URL environment variable is not set")

# SQLAlchemy setup
engine = create_engine(db_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    salt = "derm_ai_secure_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def init_db():
    # We drop all tables and recreate them to ensure the schema matches our new SQLAlchemy models.
    # Note: In a real production app, you would use Alembic for migrations instead of dropping.
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    
    # Check if default seed users exist
    if db.query(User).count() == 0:
        seed_users = [
            User(name="Ayush Sharma", email="ayush@example.com", password_hash=hash_password("password123"), role="User", skin_type="Combination"),
            User(name="Dr. Sarah Jenkins", email="dr.jenkins@derm.org", password_hash=hash_password("password123"), role="Dermatologist", skin_type="Clinical Phototype II"),
            User(name="Sophia Martinez", email="sophia.m@gmail.com", password_hash=hash_password("password123"), role="User", skin_type="Oily Acne-Prone"),
            User(name="Marcus Vance", email="consultant@derm.org", password_hash=hash_password("password123"), role="Skincare Consultant", skin_type="N/A Consultant"),
            User(name="Admin Control", email="admin@derm.ai", password_hash=hash_password("password123"), role="Administrator", skin_type="System Admin"),
        ]
        db.add_all(seed_users)
        db.commit()
    
    db.close()

def get_user_by_email(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email.ilike(email)).first()
    db.close()
    if user:
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "password_hash": user.password_hash,
            "role": user.role,
            "skin_type": user.skin_type,
            "status": user.status,
            "joined_date": user.created_at.isoformat() if user.created_at else None,
            "score": 80.0
        }
    return None

def get_all_users():
    db = SessionLocal()
    users = db.query(User).all()
    db.close()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "skin_type": u.skin_type,
            "status": u.status,
            "joined_date": u.created_at.isoformat() if u.created_at else None,
            "score": 80.0
        }
        for u in users
    ]

def create_user(name: str, email: str, password: str, role: str, skin_type: str = "Combination", google_id: str = None):
    db = SessionLocal()
    pwd_hash = hash_password(password) if password else None
    new_user = User(
        name=name,
        email=email,
        password_hash=pwd_hash,
        role=role,
        skin_type=skin_type
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.close()
    return get_user_by_email(email)

def toggle_user_status(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user:
        user.status = "Suspended" if user.status == "Active" else "Active"
        db.commit()
        db.refresh(user)
        new_status = user.status
    else:
        new_status = None
    db.close()
    return new_status

def update_user_profile(user_id: int, name: str, skin_type: str):
    db = SessionLocal()
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user:
        user.name = name
        user.skin_type = skin_type
        db.commit()
    db.close()
