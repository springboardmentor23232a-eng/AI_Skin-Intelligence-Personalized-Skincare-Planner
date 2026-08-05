from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserRegister, UserLogin, UserResponse, TokenResponse, GoogleAuthRequest
from app.exceptions import InvalidCredentialsException
from app.services import user_service, auth_service
from app.logging_config import logger

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Registers a new user account with email, name, password, and role."""
    logger.info(f"API Register trigger: {payload.email}")
    db_user = user_service.create_local_user(db, payload)
    return db_user

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticates email and password credentials, returning a JWT token."""
    logger.info(f"API Login trigger: {payload.email}")
    db_user = user_service.get_user_by_email(db, payload.email)
    if not db_user or db_user.provider != "LOCAL":
        raise InvalidCredentialsException()
    
    # Verify credentials
    if not auth_service.verify_password(payload.password, db_user.hashed_password):
        raise InvalidCredentialsException()
    
    # Generate JWT access token containing subject email and authorization role
    token_payload = {"sub": db_user.email, "role": db_user.role}
    access_token = auth_service.create_access_token(data=token_payload)
    
    return TokenResponse(
        access_token=access_token,
        role=db_user.role
    )

@router.post("/google", response_model=TokenResponse)
async def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Verifies Google Client tokens, registers or fetches the user, and signs a JWT."""
    logger.info("API Google Login callback trigger")
    google_payload = await auth_service.verify_google_token(payload.token)
    
    # Match or register Google login account
    db_user = user_service.get_or_create_google_user(db, google_payload)
    
    # Sign JWT token
    token_payload = {"sub": db_user.email, "role": db_user.role}
    access_token = auth_service.create_access_token(data=token_payload)
    
    return TokenResponse(
        access_token=access_token,
        role=db_user.role
    )
