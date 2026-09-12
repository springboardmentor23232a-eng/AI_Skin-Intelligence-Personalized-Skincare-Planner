import os
import sys
import pytest
import secrets
import hashlib
from datetime import datetime, timedelta
from fastapi import HTTPException

# Ensure backend path is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.session import SessionLocal, engine, Base
from app.models import User, EmailVerificationToken, PhoneOtpVerification, AuthProvider
from app.auth.schemas import UserCreate, GoogleAuthRequest
from app.auth.service import (
    register_user,
    verify_email_token,
    resend_email_verification,
    normalize_phone_number,
    request_phone_otp,
    verify_phone_otp,
    google_auth_user
)
from app.services.notification_dispatcher import (
    notification_dispatcher,
    ConsoleEmailProvider,
    ConsoleSmsProvider
)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_registration_role_escalation_protection(db):
    """Test that self-registration strictly forces role='USER' and ignores attempted escalation."""
    test_email = f"test_reg_{secrets.token_hex(4)}@example.com"
    user_data = UserCreate(
        email=test_email,
        password="SecurePassword123!",
        full_name="Privilege Escalation Tester",
        role="ADMIN"  # Attempt to self-assign ADMIN
    )

    registered = register_user(db, user_data)
    try:
        assert registered.email == test_email.lower()
        assert registered.role == "USER", "Role must be strictly forced to USER on self-registration"
        assert registered.email_verified is False, "New registration must be unverified"
        assert registered.email_verified_at is None
        assert registered.phone_verified is False

        # Verify token record was created
        token_rec = db.query(EmailVerificationToken).filter(
            EmailVerificationToken.user_id == registered.id
        ).first()
        assert token_rec is not None, "Email verification token must be created"
        assert token_rec.used_at is None
        assert token_rec.expires_at > datetime.utcnow()
    finally:
        # Cleanup
        db.query(EmailVerificationToken).filter(EmailVerificationToken.user_id == registered.id).delete()
        db.query(User).filter(User.id == registered.id).delete()
        db.commit()


def test_email_verification_lifecycle(db):
    """Test token verification, idempotency, and anti-replay protection."""
    test_email = f"test_verify_{secrets.token_hex(4)}@example.com"
    user_data = UserCreate(
        email=test_email,
        password="Password1234!",
        full_name="Email Verification Tester"
    )
    user = register_user(db, user_data)
    token_rec = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == user.id
    ).first()

    # We need the raw token to verify. Let's create a known raw token
    raw_token = "valid_test_token_" + secrets.token_urlsafe(16)
    token_rec.token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    token_rec.expires_at = datetime.utcnow() + timedelta(hours=24)
    token_rec.used_at = None
    db.commit()

    try:
        # 1. Verify with valid token
        verified_user = verify_email_token(db, raw_token)
        assert verified_user.email_verified is True
        assert verified_user.email_verified_at is not None

        db.refresh(token_rec)
        assert token_rec.used_at is not None

        # 2. Verify idempotency: re-calling with same used token returns verified user safely
        re_verified = verify_email_token(db, raw_token)
        assert re_verified.id == verified_user.id
        assert re_verified.email_verified is True

        # 3. Test invalid token
        with pytest.raises(HTTPException) as exc_invalid:
            verify_email_token(db, "non_existent_token_12345")
        assert exc_invalid.value.status_code == 400
        assert "invalid" in exc_invalid.value.detail.lower()

        # 4. Test expired token
        expired_token = "expired_token_" + secrets.token_urlsafe(16)
        exp_rec = EmailVerificationToken(
            user_id=user.id,
            token_hash=hashlib.sha256(expired_token.encode("utf-8")).hexdigest(),
            created_at=datetime.utcnow() - timedelta(hours=48),
            expires_at=datetime.utcnow() - timedelta(hours=24),
            used_at=None
        )
        db.add(exp_rec)
        db.commit()

        with pytest.raises(HTTPException) as exc_expired:
            verify_email_token(db, expired_token)
        assert exc_expired.value.status_code == 400
        assert "expired" in exc_expired.value.detail.lower()

    finally:
        db.query(EmailVerificationToken).filter(EmailVerificationToken.user_id == user.id).delete()
        db.query(User).filter(User.id == user.id).delete()
        db.commit()


def test_resend_email_verification_rate_limiting(db):
    """Test resend email rate limiting."""
    test_email = f"test_resend_{secrets.token_hex(4)}@example.com"
    user = User(
        full_name="Resend Tester",
        email=test_email,
        role="USER",
        email_verified=False,
        provider=AuthProvider.LOCAL.value
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        # First resend should succeed
        res = resend_email_verification(db, user.email)
        assert "verification link" in res["message"].lower()

        # Immediate second resend should trigger 429 Too Many Requests
        with pytest.raises(HTTPException) as exc_rate:
            resend_email_verification(db, user.email)
        assert exc_rate.value.status_code == 429
        assert "wait" in exc_rate.value.detail.lower()
    finally:
        db.query(EmailVerificationToken).filter(EmailVerificationToken.user_id == user.id).delete()
        db.query(User).filter(User.id == user.id).delete()
        db.commit()


def test_phone_number_normalization():
    """Test E.164 phone normalization across formats."""
    # Indian 10 digits
    assert normalize_phone_number("9876543210") == "+919876543210"
    assert normalize_phone_number(" 9876543210 ") == "+919876543210"
    # Indian with 0 prefix
    assert normalize_phone_number("09876543210") == "+919876543210"
    # International with +
    assert normalize_phone_number("+14155552671") == "+14155552671"
    assert normalize_phone_number("+919876543210") == "+919876543210"

    # Invalid formats
    with pytest.raises(HTTPException):
        normalize_phone_number("12345")
    with pytest.raises(HTTPException):
        normalize_phone_number("abcdefghij")


def test_phone_otp_lifecycle_and_attempts(db):
    """Test phone OTP request, attempt limits, and verification."""
    test_email = f"test_phone_{secrets.token_hex(4)}@example.com"
    user = User(
        full_name="Phone OTP Tester",
        email=test_email,
        role="USER",
        phone_verified=False,
        provider=AuthProvider.LOCAL.value
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    target_phone = "+919876543210"

    try:
        # Request OTP
        req_res = request_phone_otp(db, user, target_phone)
        assert req_res["phone_number"] == target_phone

        otp_rec = db.query(PhoneOtpVerification).filter(
            PhoneOtpVerification.user_id == user.id,
            PhoneOtpVerification.phone_number == target_phone
        ).order_by(PhoneOtpVerification.created_at.desc()).first()
        assert otp_rec is not None
        assert otp_rec.attempts == 0

        # Create known OTP
        known_otp = "789456"
        otp_rec.otp_hash = hashlib.sha256(known_otp.encode("utf-8")).hexdigest()
        db.commit()

        # Submit wrong OTP
        with pytest.raises(HTTPException) as exc_wrong:
            verify_phone_otp(db, user, target_phone, "000000")
        assert exc_wrong.value.status_code == 400

        db.refresh(otp_rec)
        assert otp_rec.attempts == 1

        # Submit correct OTP
        ver_res = verify_phone_otp(db, user, target_phone, known_otp)
        assert ver_res["phone_verified"] is True
        assert ver_res["phone_number"] == target_phone

        db.refresh(user)
        assert user.phone_verified is True
        assert user.phone_number == target_phone
        assert user.phone_verified_at is not None
    finally:
        db.query(PhoneOtpVerification).filter(PhoneOtpVerification.user_id == user.id).delete()
        db.query(User).filter(User.id == user.id).delete()
        db.commit()


def test_notification_channel_guarding(db):
    """Test that notification dispatcher strictly prevents delivery to unverified contacts."""
    # 1. Unverified user
    unverified_user = User(
        full_name="Unverified Recipient",
        email=f"unverified_{secrets.token_hex(4)}@example.com",
        role="USER",
        email_verified=False,
        phone_number="+919876543210",
        phone_verified=False
    )

    # 2. Verified user
    verified_user = User(
        full_name="Verified Recipient",
        email=f"verified_{secrets.token_hex(4)}@example.com",
        role="USER",
        email_verified=True,
        email_verified_at=datetime.utcnow(),
        phone_number="+919876543211",
        phone_verified=True,
        phone_verified_at=datetime.utcnow()
    )

    # Test email guarding
    res_unverified_email = notification_dispatcher.dispatch_user_email(
        unverified_user,
        subject="Daily Regimen Alert",
        message="Please apply sunscreen"
    )
    assert res_unverified_email["status"] == "BLOCKED"
    assert "not been verified" in res_unverified_email["reason"].lower()

    res_verified_email = notification_dispatcher.dispatch_user_email(
        verified_user,
        subject="Daily Regimen Alert",
        message="Please apply sunscreen"
    )
    assert res_verified_email["status"] == "SENT"

    # Test SMS guarding
    res_unverified_sms = notification_dispatcher.dispatch_user_sms(
        unverified_user,
        message="Your routine reminder"
    )
    assert res_unverified_sms["status"] == "BLOCKED"
    assert "not verified" in res_unverified_sms["reason"].lower()

    res_verified_sms = notification_dispatcher.dispatch_user_sms(
        verified_user,
        message="Your routine reminder"
    )
    assert res_verified_sms["status"] == "SENT"


def test_google_auth_email_verification_claim(db):
    """Test that Google authentication enforces Google's email_verified claim."""
    import base64
    import json

    # Mock Google payload with email_verified = True
    sub_id = f"g_sub_{secrets.token_hex(8)}"
    payload_verified = {
        "email": f"google_verified_{secrets.token_hex(4)}@gmail.com",
        "name": "Google Verified User",
        "sub": sub_id,
        "email_verified": True
    }
    b64_part = base64.urlsafe_b64encode(json.dumps(payload_verified).encode("utf-8")).decode("utf-8")
    mock_token_verified = f"header.{b64_part}.signature"

    req_verified = GoogleAuthRequest(credential=mock_token_verified)
    user_verified = google_auth_user(db, req_verified)

    try:
        assert user_verified.email == payload_verified["email"]
        assert user_verified.email_verified is True
        assert user_verified.google_subject_id == sub_id
        assert user_verified.role == "USER"

        # Mock Google payload with email_verified = False
        payload_unverified = {
            "email": f"google_unverified_{secrets.token_hex(4)}@gmail.com",
            "name": "Google Unverified User",
            "sub": f"g_sub_{secrets.token_hex(8)}",
            "email_verified": False
        }
        b64_part_unv = base64.urlsafe_b64encode(json.dumps(payload_unverified).encode("utf-8")).decode("utf-8")
        mock_token_unv = f"header.{b64_part_unv}.signature"
        req_unv = GoogleAuthRequest(credential=mock_token_unv)

        with pytest.raises(HTTPException) as exc_unv:
            google_auth_user(db, req_unv)
        assert exc_unv.value.status_code == 400
        assert "not verified" in exc_unv.value.detail.lower()
    finally:
        db.query(User).filter(User.id == user_verified.id).delete()
        db.commit()
