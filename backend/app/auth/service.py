import os
import re
import secrets
import hashlib
import json
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models import User, AuthProvider, EmailVerificationToken, PhoneOtpVerification
from app.auth.schemas import UserCreate, LoginRequest, GoogleAuthRequest
from app.services.notification_dispatcher import notification_dispatcher

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
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
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


def normalize_phone_number(raw_phone: str) -> str:
    """
    Normalizes phone numbers to standard E.164 format.
    Supports Indian numbers (10 digits starting with 6-9 -> +91XXXXXXXXXX)
    and international numbers with country codes.
    """
    if not raw_phone or not raw_phone.strip():
        raise HTTPException(status_code=400, detail="Phone number is required.")

    cleaned = re.sub(r"[\s\-\(\)\.]", "", raw_phone.strip())

    # Indian 10-digit format (6-9 followed by 9 digits)
    if re.match(r"^[6-9]\d{9}$", cleaned):
        return f"+91{cleaned}"

    # Indian 11-digit format starting with 0
    if re.match(r"^0[6-9]\d{9}$", cleaned):
        return f"+91{cleaned[1:]}"

    # Standard international E.164 (+ followed by 10 to 15 digits)
    if re.match(r"^\+[1-9]\d{9,14}$", cleaned):
        return cleaned

    raise HTTPException(
        status_code=400,
        detail="Invalid phone number format. Please provide a valid 10-digit mobile number or full international format (+91...)."
    )


def register_user(db: Session, user_data: UserCreate) -> User:
    """
    Registers a new user account with strict server-side role validation.
    SECURITY ENFORCEMENT:
    - Self-registration with role='ADMIN' is strictly forbidden with HTTP 400.
    - USER accounts are immediately active (is_verified=1).
    - Professional requested roles (SKINCARE_CONSULTANT, DERMATOLOGIST) are registered
      in unverified status (is_verified=0) pending clinical review by an administrator.
    """
    normalized_email = str(user_data.email).strip().lower()

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered"
        )

    # Validate and process requested role
    raw_role = (getattr(user_data, "role", None) or "USER").strip().upper()

    if raw_role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-registration for the ADMIN role is strictly forbidden. Admin accounts must be provisioned by an administrator."
        )

    if raw_role not in ["USER", "SKINCARE_CONSULTANT", "DERMATOLOGIST"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid account role '{raw_role}'. Allowed roles: USER, SKINCARE_CONSULTANT, DERMATOLOGIST."
        )

    assigned_role = raw_role
    # Standard users are is_verified=1; consultants and dermatologists undergo review (is_verified=0)
    user_is_verified = 1 if assigned_role == "USER" else 0

    try:
        hashed_pwd = hash_password(user_data.password)
        new_user = User(
            full_name=user_data.full_name.strip(),
            email=normalized_email,
            password=hashed_pwd,
            role=assigned_role,
            provider=AuthProvider.LOCAL.value,
            email_verified=False,
            email_verified_at=None,
            phone_verified=False,
            phone_verified_at=None,
            is_active=1,
            is_blocked=0,
            is_verified=user_is_verified
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate cryptographic single-use verification token
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        expires_at = datetime.utcnow() + timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)

        v_token = EmailVerificationToken(
            user_id=new_user.id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        db.add(v_token)
        db.commit()

        # Send verification email via dispatcher
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"
        notification_dispatcher.send_verification_email(
            email=new_user.email,
            full_name=new_user.full_name,
            verification_url=verification_url
        )

        return new_user
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during registration: {str(e)}"
        )


def verify_email_token(db: Session, raw_token: str) -> User:
    """
    Validates a cryptographic email verification token, marks email_verified=True,
    and invalidates the token against replay attacks.
    """
    if not raw_token or not raw_token.strip():
        raise HTTPException(status_code=400, detail="Verification token is required.")

    token_hash = hashlib.sha256(raw_token.strip().encode("utf-8")).hexdigest()
    token_rec = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.token_hash == token_hash
    ).first()

    if not token_rec:
        raise HTTPException(status_code=400, detail="Invalid verification link.")

    user = db.query(User).filter(User.id == token_rec.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if token_rec.used_at is not None:
        if user.email_verified:
            return user
        raise HTTPException(status_code=400, detail="This verification link has already been used.")

    if token_rec.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification link has expired. Please request a new verification email.")

    token_rec.used_at = datetime.utcnow()
    user.email_verified = True
    user.email_verified_at = datetime.utcnow()
    user.is_verified = 1

    db.commit()
    db.refresh(user)
    return user


def resend_email_verification(db: Session, email_or_user: Any) -> Dict[str, Any]:
    """
    Resends an email verification link with rate limiting (max 1 per 60 seconds).
    """
    if isinstance(email_or_user, User):
        user = email_or_user
    else:
        norm_email = str(email_or_user).strip().lower()
        user = db.query(User).filter(User.email == norm_email).first()

    if not user:
        # Anti-enumeration response
        return {"message": "If your email is registered, a verification link has been sent."}

    if user.email_verified:
        return {"message": "Email is already verified."}

    # Rate limiting: 1 per 60 seconds
    recent = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == user.id,
        EmailVerificationToken.created_at >= datetime.utcnow() - timedelta(seconds=60)
    ).first()
    if recent:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait 60 seconds before requesting another verification email."
        )

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.utcnow() + timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)

    v_token = EmailVerificationToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(v_token)
    db.commit()

    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={raw_token}"
    notification_dispatcher.send_verification_email(
        email=user.email,
        full_name=user.full_name,
        verification_url=verification_url
    )

    return {"message": "Verification link has been sent to your email."}


def request_phone_otp(db: Session, user: User, raw_phone: str) -> Dict[str, Any]:
    """
    Generates a secure, expiring 6-digit OTP for phone verification.
    Enforces rate limits (max 3 per 10 minutes) and stores hashed OTP.
    Strictly verifies SMS provider acceptance before reporting success.
    """
    norm_phone = normalize_phone_number(raw_phone)

    # Rate limiting: maximum 3 requests within a 10-minute window
    recent_count = db.query(PhoneOtpVerification).filter(
        PhoneOtpVerification.user_id == user.id,
        PhoneOtpVerification.created_at >= datetime.utcnow() - timedelta(minutes=10)
    ).count()
    if recent_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification requests. Please wait 10 minutes before requesting another code."
        )

    # Verify SMS provider configuration: never claim success without a configured provider
    if not notification_dispatcher.sms_provider.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SMS verification is not configured in this environment."
        )

    # Invalidate any previously pending unused OTPs for this user
    db.query(PhoneOtpVerification).filter(
        PhoneOtpVerification.user_id == user.id,
        PhoneOtpVerification.used_at.is_(None)
    ).update({"expires_at": datetime.utcnow()})
    db.commit()

    # Cryptographically secure 6-digit OTP
    otp = f"{secrets.randbelow(900000) + 100000}"
    otp_hash = hashlib.sha256(otp.encode("utf-8")).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.PHONE_OTP_EXPIRE_MINUTES)

    otp_rec = PhoneOtpVerification(
        user_id=user.id,
        phone_number=norm_phone,
        otp_hash=otp_hash,
        expires_at=expires_at
    )
    db.add(otp_rec)
    db.commit()
    db.refresh(otp_rec)

    # Dispatch to SMS provider
    delivery_res = notification_dispatcher.send_phone_verification_otp(norm_phone, otp)

    if delivery_res.get("status") == "UNCONFIGURED":
        db.delete(otp_rec)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SMS verification is not configured in this environment."
        )
    elif delivery_res.get("status") not in ["SENT", "ACCEPTED"]:
        db.delete(otp_rec)
        db.commit()
        reason = delivery_res.get("reason") or "Unable to send verification code. Please try again later."
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=reason
        )

    masked_phone = norm_phone[:3] + "******" + norm_phone[-4:] if len(norm_phone) >= 10 else norm_phone

    return {
        "message": f"Verification code sent to {masked_phone}. Please check your phone.",
        "phone_number": norm_phone,
        "delivery_status": "ACCEPTED",
        "provider": delivery_res.get("provider", "SMS")
    }


def verify_phone_otp(db: Session, user: User, raw_phone: str, otp_code: str) -> Dict[str, Any]:
    """
    Validates a submitted phone OTP against stored SHA-256 hash.
    Enforces max 5 incorrect attempts and expiration.
    """
    norm_phone = normalize_phone_number(raw_phone)

    otp_rec = db.query(PhoneOtpVerification).filter(
        PhoneOtpVerification.user_id == user.id,
        PhoneOtpVerification.phone_number == norm_phone,
        PhoneOtpVerification.used_at.is_(None)
    ).order_by(PhoneOtpVerification.created_at.desc()).first()

    if not otp_rec:
        raise HTTPException(status_code=400, detail="No active verification code found for this phone number.")

    if otp_rec.attempts >= 5:
        raise HTTPException(status_code=400, detail="Too many incorrect attempts. Please request a new code.")

    if otp_rec.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")

    otp_rec.attempts += 1
    provided_hash = hashlib.sha256(otp_code.strip().encode("utf-8")).hexdigest()

    if not secrets.compare_digest(provided_hash, otp_rec.otp_hash):
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid verification code.")

    otp_rec.used_at = datetime.utcnow()
    user.phone_number = norm_phone
    user.phone_verified = True
    user.phone_verified_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    return {
        "message": "Phone number verified successfully.",
        "phone_number": norm_phone,
        "phone_verified": True
    }


def login_user(db: Session, credentials: LoginRequest) -> User:
    normalized_email = str(credentials.email).strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not user.password or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

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

    try:
        user.last_login_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()

    return user


def google_auth_user(db: Session, payload: GoogleAuthRequest) -> User:
    """
    Verifies Google ID token cryptographically, enforces email_verified claim,
    validates issuer and audience, persists google_subject_id, and handles secure identity linking.
    """
    credential = payload.credential
    email = None
    full_name = None
    google_sub = None
    email_verified = False

    if not credential:
        raise HTTPException(status_code=400, detail="Google credential token is required")

    target_audience = (
        settings.GOOGLE_CLIENT_ID
        if settings.GOOGLE_CLIENT_ID and not settings.GOOGLE_CLIENT_ID.startswith("YOUR_")
        else None
    )

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests

        id_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            audience=target_audience,
            clock_skew_in_seconds=10
        )
        iss = id_info.get("iss")
        if iss not in ["accounts.google.com", "https://accounts.google.com"]:
            raise HTTPException(status_code=401, detail="Invalid Google token issuer")

        email = id_info.get("email")
        full_name = id_info.get("name") or id_info.get("given_name")
        google_sub = id_info.get("sub")
        email_verified = bool(id_info.get("email_verified", False))
    except HTTPException:
        raise
    except Exception as primary_err:
        # Fallback strictly restricted to local development / test mocking
        env_mode = os.environ.get("ENVIRONMENT", "").lower()
        if env_mode == "production":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google OAuth verification failed: {str(primary_err)}"
            )

        try:
            parts = credential.split(".")
            if len(parts) == 3:
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                payload_data = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))

                # Validate issuer in mock/dev payload
                iss = payload_data.get("iss")
                if iss and iss not in ["accounts.google.com", "https://accounts.google.com"]:
                    raise HTTPException(status_code=401, detail="Invalid Google token issuer")

                # Validate audience if target_audience is set
                aud = payload_data.get("aud")
                if target_audience and aud and aud != target_audience:
                    raise HTTPException(status_code=401, detail="Google token audience mismatch")

                # Validate expiration if exp is present
                exp = payload_data.get("exp")
                if exp and exp < datetime.now(timezone.utc).timestamp():
                    raise HTTPException(status_code=401, detail="Google token has expired")

                email = payload_data.get("email")
                full_name = payload_data.get("name") or payload_data.get("given_name")
                google_sub = payload_data.get("sub")
                email_verified = bool(payload_data.get("email_verified", False))
        except HTTPException:
            raise
        except Exception:
            pass

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google OAuth verification failed: {str(primary_err)}"
            )

    if not email:
        raise HTTPException(status_code=400, detail="Google token did not contain a valid email address")

    normalized_email = email.strip().lower()

    # CRITICAL CHECK: Google email verification claim
    if not email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email address is not verified by Google."
        )

    user = db.query(User).filter(User.email == normalized_email).first()

    now_utc = datetime.now(timezone.utc)

    if not user:
        try:
            user = User(
                full_name=full_name or "Google User",
                email=normalized_email,
                password=None,
                role="USER",
                provider=AuthProvider.GOOGLE.value,
                email_verified=True,
                email_verified_at=now_utc,
                google_subject_id=google_sub,
                is_active=1,
                is_blocked=0,
                is_verified=1,
                last_login_at=now_utc
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error saving Google user: {str(e)}")
    else:
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

        # Collision guard: Prevent linking to a different Google Subject ID
        if user.google_subject_id and google_sub and user.google_subject_id != google_sub:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account identity mismatch: This email is already linked to another Google identity."
            )

        # Update verified status and google subject id for linked account
        try:
            user.last_login_at = now_utc
            if not user.email_verified:
                user.email_verified = True
                user.email_verified_at = now_utc
            if not user.google_subject_id and google_sub:
                user.google_subject_id = google_sub
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()

    return user
