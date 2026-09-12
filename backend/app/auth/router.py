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
from jose import jwt
from app.auth.service import (
    register_user,
    login_user,
    google_auth_user,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    SECRET_KEY,
    ALGORITHM
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

    if getattr(user, "is_blocked", 0):
        reason_msg = f": {user.blocked_reason}" if getattr(user, "blocked_reason", None) else "."
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Account has been suspended{reason_msg}"
        )

    if not getattr(user, "is_active", 1):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Account has been deactivated."
        )

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


# =========================================================
# EMAIL & PHONE IDENTITY VERIFICATION ENDPOINTS
# =========================================================

from app.auth.schemas import (
    VerifyEmailRequest,
    ResendVerificationRequest,
    SendPhoneOtpRequest,
    VerifyPhoneOtpRequest,
    VerificationStatusResponse
)
from app.auth.service import (
    verify_email_token,
    resend_email_verification,
    request_phone_otp,
    verify_phone_otp
)


@router.post("/verify-email")
def verify_email_endpoint(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = verify_email_token(db, payload.token)
    return {
        "message": "Email address has been successfully verified.",
        "email": user.email,
        "email_verified": bool(user.email_verified)
    }


@router.post("/resend-verification")
def resend_verification_endpoint(
    request: Request,
    payload: Optional[ResendVerificationRequest] = None,
    db: Session = Depends(get_db)
):
    target_email = None
    if payload and payload.email:
        target_email = payload.email
    else:
        # Check if user is authenticated via cookie or header
        try:
            from app.auth import get_current_user
            token = request.cookies.get("access_token")
            if token and token.startswith("Bearer "):
                token = token[7:]
            if not token:
                auth_header = request.headers.get("Authorization")
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header[7:]
            if token:
                payload_data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                target_email = payload_data.get("sub")
        except Exception:
            pass

    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required to resend verification link."
        )

    res = resend_email_verification(db, target_email)
    return res


@router.post("/phone/send-otp")
def send_phone_otp_endpoint(
    payload: SendPhoneOtpRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return request_phone_otp(db, current_user, payload.phone_number)


@router.post("/phone/verify-otp")
def verify_phone_otp_endpoint(
    payload: VerifyPhoneOtpRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return verify_phone_otp(db, current_user, payload.phone_number, payload.otp)


from app.services.notification_dispatcher import notification_dispatcher


@router.get("/verification-status", response_model=VerificationStatusResponse)
def get_verification_status(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "email_verified": bool(current_user.email_verified),
        "email_verified_at": current_user.email_verified_at,
        "phone_number": current_user.phone_number,
        "phone_verified": bool(current_user.phone_verified),
        "phone_verified_at": current_user.phone_verified_at,
        "sms_provider_configured": notification_dispatcher.sms_provider.is_configured(),
        "sms_provider_name": getattr(notification_dispatcher.sms_provider, "name", "CONSOLE")
    }
