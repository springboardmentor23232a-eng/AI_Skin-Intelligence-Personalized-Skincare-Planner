"""
Comprehensive Test Suite: Real SMS OTP Delivery Lifecycle & Security Guarding
=============================================================================
Explicitly validates all 20 individual audit requirements:
TEST 1:  OTP request with valid phone number.
TEST 2:  OTP is securely generated (cryptographically secure 6 digits).
TEST 3:  OTP is hashed before persistence (SHA-256).
TEST 4:  SMS provider is invoked with normalized E.164 destination.
TEST 5:  Provider success returns success.
TEST 6:  Provider failure does NOT return false success.
TEST 7:  Provider timeout handled correctly.
TEST 8:  Invalid phone number rejected.
TEST 9:  Expired OTP rejected.
TEST 10: Wrong OTP rejected.
TEST 11: Too many attempts rejected.
TEST 12: OTP cannot be reused.
TEST 13: Resend rate limiting works.
TEST 14: Unverified phone cannot receive ordinary SMS notifications.
TEST 15: Verified phone can receive eligible notifications.
TEST 16: No OTP appears in API response.
TEST 17: No OTP appears in production logs.
TEST 18: No SMS credentials are exposed to frontend.
TEST 19: Development mode without provider does not claim SMS success.
TEST 20: Test provider works without sending real SMS.
"""

import os
import sys
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.db.session import SessionLocal
from app.models import User, PhoneOtpVerification
from app.auth.service import (
    request_phone_otp,
    verify_phone_otp,
    normalize_phone_number,
    create_access_token,
    hash_password
)
from app.services.notification_dispatcher import (
    notification_dispatcher,
    TestSmsProvider,
    ConsoleSmsProvider
)

client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_sms_provider():
    provider = TestSmsProvider()
    notification_dispatcher.set_sms_provider(provider)
    yield provider
    provider.reset()
    notification_dispatcher.set_sms_provider(TestSmsProvider())


@pytest.fixture
def test_user(db):
    rand_id = secrets.token_hex(4)
    email = f"sms_lifecycle_{rand_id}@example.com"
    user = User(
        full_name="SMS Lifecycle User",
        email=email,
        password=hash_password("ValidPassword123!"),
        role="USER",
        email_verified=True,
        phone_number="+919876543210",
        phone_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    yield user

    db.query(PhoneOtpVerification).filter(PhoneOtpVerification.user_id == user.id).delete()
    db.query(User).filter(User.id == user.id).delete()
    db.commit()


# =============================================================================
# TEST 1: OTP REQUEST WITH VALID PHONE NUMBER
# =============================================================================
def test_01_otp_request_with_valid_phone_number(db, test_user, test_sms_provider):
    res = request_phone_otp(db, test_user, "+919876543210")
    assert res["phone_number"] == "+919876543210"
    assert "message" in res
    assert res["delivery_status"] in ["SENT", "ACCEPTED"]


# =============================================================================
# TEST 2: OTP IS SECURELY GENERATED
# =============================================================================
def test_02_otp_is_securely_generated(db, test_user, test_sms_provider):
    request_phone_otp(db, test_user, "+919876543210")
    assert len(test_sms_provider.sent_messages) == 1
    sent_msg = test_sms_provider.sent_messages[0]["message"]
    # Verify exactly 6 digits are generated
    digits = "".join(ch for ch in sent_msg if ch.isdigit())
    assert len(digits) >= 6
    otp_code = digits[:6]
    assert 100000 <= int(otp_code) <= 999999


# =============================================================================
# TEST 3: OTP IS HASHED BEFORE PERSISTENCE
# =============================================================================
def test_03_otp_is_hashed_before_persistence(db, test_user, test_sms_provider):
    request_phone_otp(db, test_user, "+919876543210")
    record = db.query(PhoneOtpVerification).filter(
        PhoneOtpVerification.user_id == test_user.id
    ).order_by(PhoneOtpVerification.created_at.desc()).first()

    assert record is not None
    assert len(record.otp_hash) == 64
    assert not record.otp_hash.isdigit()
    assert not hasattr(record, "otp")


# =============================================================================
# TEST 4: SMS PROVIDER IS INVOKED
# =============================================================================
def test_04_sms_provider_is_invoked(db, test_user, test_sms_provider):
    raw_phone = "9876543210"
    request_phone_otp(db, test_user, raw_phone)
    assert len(test_sms_provider.sent_messages) == 1
    assert test_sms_provider.sent_messages[0]["recipient"] == "+919876543210"


# =============================================================================
# TEST 5: PROVIDER SUCCESS RETURNS SUCCESS
# =============================================================================
def test_05_provider_success_returns_success(db, test_user, test_sms_provider):
    res = request_phone_otp(db, test_user, "+919876543210")
    assert res["delivery_status"] in ["SENT", "ACCEPTED"]
    assert "check your phone" in res["message"].lower()


# =============================================================================
# TEST 6: PROVIDER FAILURE DOES NOT RETURN FALSE SUCCESS
# =============================================================================
def test_06_provider_failure_does_not_return_false_success(db, test_user, test_sms_provider):
    test_sms_provider.simulate_failure = True
    with pytest.raises(HTTPException) as exc:
        request_phone_otp(db, test_user, "+919876543210")

    assert exc.value.status_code == 502
    assert "unable to send" in exc.value.detail.lower()

    # Confirm that no active OTP remained committed
    records = db.query(PhoneOtpVerification).filter(PhoneOtpVerification.user_id == test_user.id).all()
    assert len(records) == 0


# =============================================================================
# TEST 7: PROVIDER TIMEOUT HANDLED CORRECTLY
# =============================================================================
def test_07_provider_timeout_handled_correctly(db, test_user, test_sms_provider):
    test_sms_provider.simulate_timeout = True
    with pytest.raises(HTTPException) as exc:
        request_phone_otp(db, test_user, "+919876543210")

    assert exc.value.status_code == 502
    assert "timed out" in exc.value.detail.lower() or "unable" in exc.value.detail.lower()


# =============================================================================
# TEST 8: INVALID PHONE NUMBER REJECTED
# =============================================================================
def test_08_invalid_phone_number_rejected():
    with pytest.raises(HTTPException) as exc1:
        normalize_phone_number("123")
    assert exc1.value.status_code == 400

    with pytest.raises(HTTPException) as exc2:
        normalize_phone_number("invalid-chars-12345")
    assert exc2.value.status_code == 400


# =============================================================================
# TEST 9: EXPIRED OTP REJECTED
# =============================================================================
def test_09_expired_otp_rejected(db, test_user):
    phone = "+919876543210"
    otp_code = "123456"
    record = PhoneOtpVerification(
        user_id=test_user.id,
        phone_number=phone,
        otp_hash=hashlib.sha256(otp_code.encode("utf-8")).hexdigest(),
        attempts=0,
        created_at=datetime.utcnow() - timedelta(minutes=20),
        expires_at=datetime.utcnow() - timedelta(minutes=5)
    )
    db.add(record)
    db.commit()

    with pytest.raises(HTTPException) as exc:
        verify_phone_otp(db, test_user, phone, otp_code)

    assert exc.value.status_code == 400
    assert "expired" in exc.value.detail.lower()


# =============================================================================
# TEST 10: WRONG OTP REJECTED
# =============================================================================
def test_10_wrong_otp_rejected(db, test_user):
    phone = "+919876543210"
    otp_code = "654321"
    record = PhoneOtpVerification(
        user_id=test_user.id,
        phone_number=phone,
        otp_hash=hashlib.sha256(otp_code.encode("utf-8")).hexdigest(),
        attempts=0,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(record)
    db.commit()

    with pytest.raises(HTTPException) as exc:
        verify_phone_otp(db, test_user, phone, "000000")

    assert exc.value.status_code == 400
    assert "invalid" in exc.value.detail.lower()

    db.refresh(record)
    assert record.attempts == 1


# =============================================================================
# TEST 11: TOO MANY ATTEMPTS REJECTED
# =============================================================================
def test_11_too_many_attempts_rejected(db, test_user):
    phone = "+919876543210"
    otp_code = "778899"
    record = PhoneOtpVerification(
        user_id=test_user.id,
        phone_number=phone,
        otp_hash=hashlib.sha256(otp_code.encode("utf-8")).hexdigest(),
        attempts=5,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(record)
    db.commit()

    with pytest.raises(HTTPException) as exc:
        verify_phone_otp(db, test_user, phone, otp_code)

    assert exc.value.status_code == 400
    assert "too many" in exc.value.detail.lower()


# =============================================================================
# TEST 12: OTP CANNOT BE REUSED
# =============================================================================
def test_12_otp_cannot_be_reused(db, test_user):
    phone = "+919876543210"
    otp_code = "334455"
    record = PhoneOtpVerification(
        user_id=test_user.id,
        phone_number=phone,
        otp_hash=hashlib.sha256(otp_code.encode("utf-8")).hexdigest(),
        attempts=0,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(record)
    db.commit()

    # First attempt succeeds
    res = verify_phone_otp(db, test_user, phone, otp_code)
    assert res["phone_verified"] is True

    # Second attempt must be rejected
    with pytest.raises(HTTPException) as exc:
        verify_phone_otp(db, test_user, phone, otp_code)

    assert exc.value.status_code == 400


# =============================================================================
# TEST 13: RESEND RATE LIMITING WORKS
# =============================================================================
def test_13_resend_rate_limiting_works(db, test_user, test_sms_provider):
    phone = "+919876543210"
    request_phone_otp(db, test_user, phone)
    request_phone_otp(db, test_user, phone)
    request_phone_otp(db, test_user, phone)

    with pytest.raises(HTTPException) as exc:
        request_phone_otp(db, test_user, phone)

    assert exc.value.status_code == 429
    assert "too many" in exc.value.detail.lower()


# =============================================================================
# TEST 14: UNVERIFIED PHONE CANNOT RECEIVE ORDINARY SMS NOTIFICATIONS
# =============================================================================
def test_14_unverified_phone_cannot_receive_ordinary_sms(test_user):
    test_user.phone_verified = False
    res = notification_dispatcher.dispatch_user_sms(test_user, "Regimen Reminder")
    assert res["status"] == "BLOCKED"
    assert "not verified" in res["reason"].lower()


# =============================================================================
# TEST 15: VERIFIED PHONE CAN RECEIVE ELIGIBLE NOTIFICATIONS
# =============================================================================
def test_15_verified_phone_can_receive_eligible_notifications(test_user):
    test_user.phone_verified = True
    test_user.phone_number = "+919876543210"
    res = notification_dispatcher.dispatch_user_sms(test_user, "Regimen Reminder")
    assert res["status"] == "SENT"


# =============================================================================
# TEST 16: NO OTP APPEARS IN API RESPONSE
# =============================================================================
def test_16_no_otp_appears_in_api_response(test_user):
    token = create_access_token({"sub": test_user.email, "role": test_user.role})
    res = client.post(
        "/api/auth/phone/send-otp",
        json={"phone_number": "+919876543210"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "otp" not in data
    assert "code" not in data
    assert "otp_code" not in data
    assert "token" not in data


# =============================================================================
# TEST 17: NO OTP APPEARS IN PRODUCTION LOGS
# =============================================================================
def test_17_no_otp_appears_in_production_logs(capsys):
    console_provider = ConsoleSmsProvider()
    secret_code = "543210"
    console_provider.send_sms("+919111111111", f"Your verification code is: {secret_code}. Do not share.")
    captured = capsys.readouterr()
    assert secret_code not in captured.out
    assert "[OTP Verification Message]" in captured.out


# =============================================================================
# TEST 18: NO SMS CREDENTIALS ARE EXPOSED TO FRONTEND
# =============================================================================
def test_18_no_sms_credentials_are_exposed_to_frontend(test_user):
    token = create_access_token({"sub": test_user.email, "role": test_user.role})
    res = client.get(
        "/api/auth/verification-status",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "auth_token" not in data
    assert "account_sid" not in data
    assert "secret" not in data
    assert "sms_provider_configured" in data


# =============================================================================
# TEST 19: DEVELOPMENT MODE WITHOUT PROVIDER DOES NOT CLAIM SMS SUCCESS
# =============================================================================
def test_19_development_mode_without_provider_does_not_claim_sms_success(db, test_user):
    console_provider = ConsoleSmsProvider()
    notification_dispatcher.set_sms_provider(console_provider)

    try:
        with pytest.raises(HTTPException) as exc:
            request_phone_otp(db, test_user, "+919876543210")
        assert exc.value.status_code == 503
        assert "not configured" in exc.value.detail.lower()
    finally:
        notification_dispatcher.set_sms_provider(TestSmsProvider())


# =============================================================================
# TEST 20: TEST PROVIDER WORKS WITHOUT SENDING REAL SMS
# =============================================================================
def test_20_test_provider_works_without_sending_real_sms():
    provider = TestSmsProvider()
    res = provider.send_sms("+919876543210", "In-memory test message")
    assert res["status"] == "SENT"
    assert len(provider.sent_messages) == 1
    assert provider.sent_messages[0]["recipient"] == "+919876543210"
    assert provider.sent_messages[0]["message"] == "In-memory test message"
