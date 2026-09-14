import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from datetime import datetime

from app.config import settings
from app.logging_config import logger


def build_html_email_template(
    recipient_name: str,
    title: str,
    message: str,
    notification_type: str,
    action_url: Optional[str] = None
) -> str:
    """Generates a professional, responsive HTML email template."""
    current_year = datetime.now().year
    type_badge_color = "#4f46e5"
    if notification_type == "ROUTINE":
        type_badge_color = "#059669"
    elif notification_type == "REPLENISHMENT":
        type_badge_color = "#d97706"
    elif notification_type == "HYDRATION":
        type_badge_color = "#0891b2"
    elif notification_type == "SLEEP":
        type_badge_color = "#6366f1"
    elif notification_type == "PROGRESS":
        type_badge_color = "#8b5cf6"
    elif notification_type == "DOCTOR":
        type_badge_color = "#e11d48"
    elif notification_type == "CONSULTANT":
        type_badge_color = "#2563eb"
    elif notification_type == "ADMIN":
        type_badge_color = "#d97706"

    button_html = ""
    if action_url:
        full_url = f"http://localhost:5173{action_url}" if action_url.startswith("/") else action_url
        button_html = f"""
        <div style="margin-top: 28px; text-align: center;">
            <a href="{full_url}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                Open in Dashboard &rarr;
            </a>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #0f172a; padding: 24px 32px; text-align: left;">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <span style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                                        AI Skin Intelligence
                                    </span>
                                </div>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 32px;">
                                <div style="display: inline-block; background-color: {type_badge_color}15; color: {type_badge_color}; border: 1px solid {type_badge_color}30; border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
                                    {notification_type}
                                </div>
                                <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; line-height: 1.3;">
                                    {title}
                                </h1>
                                <p style="font-size: 14px; color: #64748b; margin: 0 0 20px 0;">
                                    Hello {recipient_name},
                                </p>
                                <div style="background-color: #f1f5f9; border-left: 4px solid {type_badge_color}; padding: 16px; border-radius: 6px; font-size: 14px; color: #334155; line-height: 1.6;">
                                    {message}
                                </div>
                                {button_html}
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                <p style="margin: 0 0 6px 0;">
                                    You received this message because email notifications are enabled in your account preferences.
                                </p>
                                <p style="margin: 0;">
                                    &copy; {current_year} AI Skin Intelligence & Personalized Skincare Planner. All rights reserved.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def send_notification_email(
    to_email: str,
    recipient_name: str,
    subject: str,
    title: str,
    message: str,
    notification_type: str = "PLATFORM",
    action_url: Optional[str] = None
) -> bool:
    """
    Delivers a notification email via configured SMTP provider.
    If SMTP is not configured or disabled in development, logs the notification and returns True.
    Safely captures and logs all transport errors without raising exceptions.
    """
    if not to_email:
        logger.warning("Email Service: Cannot send email without recipient address.")
        return False

    # Check if SMTP is enabled in config
    if not settings.EMAIL_ENABLED or not settings.SMTP_USERNAME:
        logger.info(
            f"Email Service (Dev/Simulation): Dispatched [{notification_type}] email to {to_email} "
            f"| Subject: '{subject}' | Title: '{title}'"
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        msg["To"] = to_email

        plain_text = f"Hello {recipient_name},\n\n{title}\n\n{message}\n\nAI Skin Intelligence"
        html_text = build_html_email_template(
            recipient_name=recipient_name,
            title=title,
            message=message,
            notification_type=notification_type,
            action_url=action_url
        )

        msg.attach(MIMEText(plain_text, "plain"))
        msg.attach(MIMEText(html_text, "html"))

        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            if settings.SMTP_USE_TLS:
                server.starttls()

        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
        server.quit()

        logger.info(f"Email Service: Successfully delivered email to {to_email} | Subject: '{subject}'")
        return True

    except Exception as e:
        logger.error(f"Email Service: Failed to send email to {to_email}: {str(e)}")
        return False
