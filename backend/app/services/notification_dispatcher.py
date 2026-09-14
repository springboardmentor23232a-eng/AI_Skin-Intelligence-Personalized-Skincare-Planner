"""
Notification Dispatcher & Communication Identity Service
========================================================
Enterprise-grade, cloud-ready dispatching abstraction for transactional emails
and SMS. Strictly prevents message delivery to unverified contact endpoints.

Architecture:
- BaseNotificationProvider
    ├── EmailProvider (Console / Sandbox / SMTP / SendGrid)
    └── SmsProvider   (Console / Sandbox / Twilio)
"""

import os
import sys
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.core.config import settings
from app.models import User


class BaseEmailProvider:
    def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> Dict[str, Any]:
        raise NotImplementedError


class ConsoleEmailProvider(BaseEmailProvider):
    """Local development and testing email provider. Logs safe operational metrics."""
    def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> Dict[str, Any]:
        # Operational logging without credentials
        print(f"[ConsoleEmailProvider] [{datetime.now(timezone.utc).isoformat()}] Sending email to: {to_email} | Subject: {subject}")
        return {
            "status": "SENT",
            "provider": "CONSOLE",
            "recipient": to_email,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


class SmtpEmailProvider(BaseEmailProvider):
    """Production SMTP Provider (AWS SES, Mailgun, Postmark, etc.)."""
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM

    def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> Dict[str, Any]:
        if not self.host or not self.user:
            return {
                "status": "FAILED",
                "provider": "SMTP",
                "reason": "SMTP provider is not configured. Missing SMTP_HOST or SMTP_USER.",
                "recipient": to_email
            }
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.from_email
            msg["To"] = to_email

            part1 = MIMEText(body, "plain", "utf-8")
            msg.attach(part1)

            if html_body:
                part2 = MIMEText(html_body, "html", "utf-8")
                msg.attach(part2)

            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                server.starttls()
                server.login(self.user, self.password)
                server.sendmail(self.from_email, [to_email], msg.as_string())

            return {
                "status": "SENT",
                "provider": "SMTP",
                "recipient": to_email,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            return {
                "status": "FAILED",
                "provider": "SMTP",
                "reason": str(e),
                "recipient": to_email
            }


class BaseSmsProvider:
    name: str = "BASE"

    def is_configured(self) -> bool:
        return False

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        raise NotImplementedError


class ConsoleSmsProvider(BaseSmsProvider):
    """
    Local development SMS provider.
    Explicitly marks SMS delivery as UNCONFIGURED to prevent false delivery claims.
    """
    name = "CONSOLE"

    def is_configured(self) -> bool:
        return False

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        # Redact message contents if it might contain OTP for security
        safe_msg = "[OTP Verification Message]" if "code" in message.lower() or "otp" in message.lower() else message[:30] + "..."
        safe_phone = phone_number[:3] + "******" + phone_number[-4:] if len(phone_number) >= 10 else phone_number
        print(f"[ConsoleSmsProvider] [{datetime.now(timezone.utc).isoformat()}] (Unconfigured) Destination: {safe_phone} | Message: {safe_msg}")
        return {
            "status": "UNCONFIGURED",
            "provider": "CONSOLE",
            "reason": "SMS verification is not configured in this environment.",
            "recipient": phone_number,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


class TwilioSmsProvider(BaseSmsProvider):
    """
    Production Twilio SMS Provider using robust HTTP REST API via httpx.
    Supports Twilio Account SID, Auth Token, and Sender Number (or Messaging Service).
    Never exposes auth credentials or raw secrets in logs or responses.
    """
    name = "TWILIO"

    def __init__(self):
        self.account_sid = (getattr(settings, "TWILIO_ACCOUNT_SID", "") or "").strip()
        self.auth_token = (getattr(settings, "TWILIO_AUTH_TOKEN", "") or "").strip()
        self.from_number = (getattr(settings, "SMS_FROM", "") or "").strip()

    def is_configured(self) -> bool:
        return bool(self.account_sid and self.auth_token and self.from_number)

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "status": "UNCONFIGURED",
                "provider": "TWILIO",
                "reason": "Twilio SMS provider is not configured. Missing account SID, auth token, or sender number.",
                "recipient": phone_number
            }

        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        data = {
            "To": phone_number,
            "From": self.from_number,
            "Body": message
        }

        try:
            import httpx
            with httpx.Client(timeout=10.0) as client:
                response = client.post(
                    url,
                    data=data,
                    auth=(self.account_sid, self.auth_token)
                )

            if 200 <= response.status_code < 300:
                resp_json = response.json()
                return {
                    "status": "SENT",
                    "provider": "TWILIO",
                    "sid": resp_json.get("sid"),
                    "recipient": phone_number,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            else:
                resp_json = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
                twilio_code = resp_json.get("code")
                twilio_msg = resp_json.get("message") or "Provider rejected message request."
                return {
                    "status": "FAILED",
                    "provider": "TWILIO",
                    "reason": "Unable to send verification code via SMS provider.",
                    "error_code": str(twilio_code) if twilio_code else None,
                    "recipient": phone_number,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
        except httpx.TimeoutException:
            return {
                "status": "FAILED",
                "provider": "TWILIO",
                "reason": "SMS gateway timed out. Please try again.",
                "recipient": phone_number,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            return {
                "status": "FAILED",
                "provider": "TWILIO",
                "reason": "SMS gateway network connection failure.",
                "recipient": phone_number,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }


class TestSmsProvider(BaseSmsProvider):
    """
    Dedicated in-memory Test SMS Provider for automated test suites.
    Simulates provider acceptance without sending real SMS or requiring credentials.
    Supports failure and timeout simulation.
    """
    __test__ = False
    name = "TEST"

    def __init__(self):
        self.sent_messages = []
        self.simulate_failure = False
        self.simulate_timeout = False
        self.simulate_unconfigured = False

    def is_configured(self) -> bool:
        return not self.simulate_unconfigured

    def reset(self):
        self.sent_messages.clear()
        self.simulate_failure = False
        self.simulate_timeout = False
        self.simulate_unconfigured = False

    def send_sms(self, phone_number: str, message: str) -> Dict[str, Any]:
        if self.simulate_unconfigured:
            return {
                "status": "UNCONFIGURED",
                "provider": "TEST",
                "reason": "SMS verification is not configured in this environment.",
                "recipient": phone_number,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        if self.simulate_timeout:
            return {
                "status": "FAILED",
                "provider": "TEST",
                "reason": "SMS gateway timed out. Please try again.",
                "recipient": phone_number,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        if self.simulate_failure:
            return {
                "status": "FAILED",
                "provider": "TEST",
                "reason": "Unable to send verification code via SMS provider.",
                "error_code": "21211",
                "recipient": phone_number,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        sid = f"SM_test_{secrets.token_hex(12)}"
        record = {
            "status": "SENT",
            "provider": "TEST",
            "sid": sid,
            "recipient": phone_number,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.sent_messages.append(record)
        return record


class NotificationDispatcher:
    """
    Central notification engine coordinating identity verification checks
    before delegating to configured email and SMS providers.
    """
    def __init__(self):
        self.init_providers()

    def init_providers(self):
        email_prov = (settings.EMAIL_PROVIDER or "CONSOLE").upper()
        if email_prov == "SMTP":
            self.email_provider: BaseEmailProvider = SmtpEmailProvider()
        else:
            self.email_provider = ConsoleEmailProvider()

        sms_prov = (settings.SMS_PROVIDER or "CONSOLE").upper()
        if sms_prov == "TWILIO":
            self.sms_provider: BaseSmsProvider = TwilioSmsProvider()
        elif sms_prov == "TEST":
            self.sms_provider = TestSmsProvider()
        else:
            # If running inside pytest or test environment, default to TestSmsProvider
            if "pytest" in sys.modules or os.environ.get("PYTEST_CURRENT_TEST"):
                self.sms_provider = TestSmsProvider()
            else:
                self.sms_provider = ConsoleSmsProvider()

    def set_sms_provider(self, provider: BaseSmsProvider):
        self.sms_provider = provider

    def send_verification_email(self, email: str, full_name: str, verification_url: str) -> Dict[str, Any]:
        """
        Dispatches account ownership verification link. Allowed to send to
        the target address to complete registration verification.
        """
        subject = "Verify your email - AI Skin Intelligence"
        body = (
            f"Hello {full_name},\n\n"
            f"Thank you for registering on the AI Skin Intelligence & Personalized Skincare Planner.\n"
            f"Please verify your email address to activate your account and enable clinical notifications:\n\n"
            f"{verification_url}\n\n"
            f"This link will expire in {settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS} hours.\n"
            f"If you did not create this account, you can safely disregard this message."
        )
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e293b;">AI Skin Intelligence Platform</h2>
            <p>Hello <strong>{full_name}</strong>,</p>
            <p>Please click the button below to verify your email address and activate your account:</p>
            <div style="margin: 24px 0;">
                <a href="{verification_url}" style="background-color: #2d5a4c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #64748b; font-size: 0.875rem;">This verification link will expire in {settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS} hours.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 0.75rem;">If you did not request this email, please ignore it.</p>
        </div>
        """
        return self.email_provider.send_email(email, subject, body, html_body)

    def send_phone_verification_otp(self, phone_number: str, otp_code: str) -> Dict[str, Any]:
        """
        Dispatches SMS OTP for phone verification.
        """
        message = f"Your AI Skin Intelligence verification code is: {otp_code}. Valid for {settings.PHONE_OTP_EXPIRE_MINUTES} minutes. Do not share this code."
        return self.sms_provider.send_sms(phone_number, message)

    def dispatch_user_email(self, user: User, subject: str, message: str, html_body: Optional[str] = None) -> Dict[str, Any]:
        """
        SECURITY GUARD: External notification emails are strictly blocked
        if the recipient's email address is not verified in the database.
        """
        if not getattr(user, "email_verified", False):
            return {
                "status": "BLOCKED",
                "channel": "EMAIL",
                "recipient": user.email,
                "reason": "Email notification suppressed: User email address has not been verified."
            }

        return self.email_provider.send_email(user.email, subject, message, html_body)

    def dispatch_user_sms(self, user: User, message: str) -> Dict[str, Any]:
        """
        SECURITY GUARD: External notification SMS are strictly blocked
        if the recipient's phone number is missing or unverified.
        """
        if not getattr(user, "phone_verified", False) or not getattr(user, "phone_number", None):
            return {
                "status": "BLOCKED",
                "channel": "SMS",
                "recipient": getattr(user, "phone_number", None) or "None",
                "reason": "SMS notification suppressed: User phone number is not verified or not configured."
            }

        return self.sms_provider.send_sms(user.phone_number, message)


# Global singleton instance
notification_dispatcher = NotificationDispatcher()
