import os
import secrets
import hashlib
import requests
import json
import base64
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models import User, AuthProvider
from app.auth.schemas import UserCreate, LoginRequest, GoogleAuthRequest

SECRET_KEY = settings.JWT_SECRET_KEY
REFRESH_SECRET_KEY = settings.JWT_REFRESH_SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

ALLOWED_ROLES = {"USER", "SKINCARE_CONSULTANT", "DERMATOLOGIST", "ADMIN"}

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or "$" not in hashed_password:
        return False
    try:
        salt, stored_hash = hashed_password.split("$", 1)
        key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(key.hex(), stored_hash)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

def decode_refresh_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

def register_user(db: Session, user_data: UserCreate) -> User:
    role = (user_data.role or "USER").upper()
    if role not in ALLOWED_ROLES:
        role = "USER"

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered"
        )

    try:
        hashed_pwd = hash_password(user_data.password)
        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password=hashed_pwd,
            role=role,
            provider=AuthProvider.LOCAL.value
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during registration: {str(e)}"
        )

def login_user(db: Session, credentials: LoginRequest) -> User:
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not user.password or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return user

def google_auth_user(db: Session, payload: GoogleAuthRequest) -> User:
    credential = payload.credential
    email = None
    full_name = None

    if not credential:
        raise HTTPException(status_code=400, detail="Google credential token is required")

    # Secure verification using official google.oauth2 id_token library
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        # Audience validation against settings.GOOGLE_CLIENT_ID
        target_audience = (
            settings.GOOGLE_CLIENT_ID
            if settings.GOOGLE_CLIENT_ID and not settings.GOOGLE_CLIENT_ID.startswith("YOUR_")
            else None
        )

        id_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            audience=target_audience,
            clock_skew_in_seconds=10
        )
        email = id_info.get("email")
        full_name = id_info.get("name") or id_info.get("given_name") or (email.split("@")[0] if email else "Google User")
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google OAuth verification failed: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google OAuth credential: {str(e)}"
        )

    if not email:
        raise HTTPException(status_code=400, detail="Google token did not contain a valid email address")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        try:
            user = User(
                full_name=full_name or "Google User",
                email=email,
                password=None,
                role="USER",
                provider=AuthProvider.GOOGLE.value
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error saving Google user: {str(e)}")

    return user
