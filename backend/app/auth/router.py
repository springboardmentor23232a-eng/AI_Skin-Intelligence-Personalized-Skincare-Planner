from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User
from app.auth.schemas import (
    RegisterRequest,
    UserCreate,
    UserResponse,
    LoginRequest,
    Token,
    RefreshTokenRequest,
    GoogleAuthRequest,
    GenericMessage
)
from app.auth.service import (
    register_user,
    login_user,
    google_auth_user,
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=3600
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=7 * 86400
    )

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, response: Response, db: Session = Depends(get_db)):
    new_user = register_user(db, user_data)
    access_token = create_access_token({"sub": new_user.email, "role": new_user.role})
    refresh_token = create_refresh_token({"sub": new_user.email})

    set_auth_cookies(response, access_token, refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = login_user(db, credentials)
    access_token = create_access_token({"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.email})

    set_auth_cookies(response, access_token, refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout", response_model=GenericMessage)
def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return {"message": "Successfully logged out"}

@router.post("/refresh", response_model=Token)
def refresh_token_endpoint(request: Request, response: Response, body: Optional[RefreshTokenRequest] = None, db: Session = Depends(get_db)):
    token_str = None
    if body and body.refresh_token:
        token_str = body.refresh_token
    else:
        token_str = request.cookies.get("refresh_token")

    if not token_str:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    payload = decode_refresh_token(token_str)
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token({"sub": user.email, "role": user.role})
    new_refresh_token = create_refresh_token({"sub": user.email})

    set_auth_cookies(response, new_access_token, new_refresh_token)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/google", response_model=Token)
def google_auth(payload: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    user = google_auth_user(db, payload)
    access_token = create_access_token({"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.email})

    set_auth_cookies(response, access_token, refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }
