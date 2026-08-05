from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.exceptions import InvalidTokenException, UserNotFoundException
from app.services.auth_service import decode_access_token
from app.services.user_service import get_user_by_email

# OAuth2 scheme config extraction (uses Authorization Bearer token header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Dependency validator resolving token keys to Postgres User models."""
    payload = decode_access_token(token)
    email = payload.get("sub")
    if not email:
        raise InvalidTokenException("Invalid token session claims")
        
    user = get_user_by_email(db, email)
    if not user:
        raise UserNotFoundException("User account not found")
        
    return user
