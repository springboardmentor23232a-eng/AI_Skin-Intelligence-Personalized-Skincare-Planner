from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
import os


# =========================================================
# EMAIL CONFIGURATION
# =========================================================

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)


# =========================================================
# SEND EMAIL
# =========================================================

async def send_notification_email(
    recipient: EmailStr,
    subject: str,
    message: str
):

    email = MessageSchema(
        subject=subject,
        recipients=[recipient],
        body=message,
        subtype="plain"
    )

    fast_mail = FastMail(conf)

    await fast_mail.send_message(email)

    return True