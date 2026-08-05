import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import jwt, JWTError
import bcrypt
from app.config import settings
from app.exceptions import InvalidTokenException
from app.logging_config import logger

def hash_password(password: str) -> str:
    """Returns the bcrypt hash of a plain text password."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pwd = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_pwd.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against its bcrypt hash."""
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a secure JWT access token signed with our JWT secret key."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Standard JWT claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes a JWT access token and verifies its signature and claims."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"JWT decode error: {str(e)}")
        raise InvalidTokenException("Invalid or expired session token")

async def verify_google_token(token: str) -> Dict[str, Any]:
    """Verifies a Google credentials ID token using Google tokeninfo REST service."""
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10.0)
            if response.status_code != 200:
                logger.warning(f"Google ID tokeninfo error: {response.text}")
                raise InvalidTokenException("Google authentication token is invalid")
            
            payload = response.json()
            
            # Check client audience match if defined in environment settings
            if settings.GOOGLE_CLIENT_ID and payload.get("aud") != settings.GOOGLE_CLIENT_ID:
                logger.warning(f"Google OAuth client audience mismatch. Expected {settings.GOOGLE_CLIENT_ID}, got {payload.get('aud')}")
                raise InvalidTokenException("Google OAuth client ID mismatch")
                
            return payload
        except Exception as e:
            if isinstance(e, InvalidTokenException):
                raise e
            logger.error(f"Error contacting Google token verification service: {str(e)}")
            raise InvalidTokenException("Google OAuth token verification failed")
