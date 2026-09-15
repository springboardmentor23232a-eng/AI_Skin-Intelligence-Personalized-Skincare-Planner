from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pathlib import Path
import os
from dotenv import load_dotenv


load_dotenv()


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# EMAIL CONFIGURATION
# =========================================================

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "demo@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "demo"),
    MAIL_FROM=os.getenv("MAIL_FROM", "demo@gmail.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() == "true",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() == "true",
    USE_CREDENTIALS=True
)


# =========================================================
# NOTIFICATION REQUEST
# =========================================================

class NotificationRequest(BaseModel):

    user_id: int

    notification_type: str

    title: str

    message: str

    delivery_method: Optional[str] = "email"

    recipient_email: str


# =========================================================
# GET NOTIFICATIONS
# =========================================================

@router.get("/")
def get_notifications():

    return [

        {
            "id": 1,
            "type": "routine",
            "title": "Morning Skincare Reminder",
            "message": "Time to complete your morning skincare routine.",
            "channel": "Platform Notification"
        },

        {
            "id": 2,
            "type": "hydration",
            "title": "Hydration Reminder",
            "message": "Remember to drink water and keep your skin hydrated.",
            "channel": "Platform Notification"
        },

        {
            "id": 3,
            "type": "sleep",
            "title": "Sleep Reminder",
            "message": "Maintain your sleep routine for healthy-looking skin.",
            "channel": "Platform Notification"
        },

        {
            "id": 4,
            "type": "replenishment",
            "title": "Product Replenishment",
            "message": "One of your skincare products may need replenishment soon.",
            "channel": "Platform Notification"
        },

        {
            "id": 5,
            "type": "progress",
            "title": "Skin Progress Alert",
            "message": "Your latest skin progress information is ready to review.",
            "channel": "Platform Notification"
        }

    ]


# =========================================================
# SEND NOTIFICATION
# =========================================================

@router.post("/send")
async def send_notification(
    notification: NotificationRequest
):

    if notification.delivery_method.lower() != "email":

        return {

            "success": True,

            "message": "Platform notification created successfully",

            "notification": {

                "user_id": notification.user_id,

                "type": notification.notification_type,

                "title": notification.title,

                "message": notification.message,

                "delivery_method":
                    notification.delivery_method,

                "status": "CREATED"

            }

        }


    try:

        message = MessageSchema(
            subject=notification.title,

            recipients=[
                notification.recipient_email
            ],

            body=f"""
Skin AI Notification

{notification.message}

Notification Type:
{notification.notification_type}

This is an automated notification from Skin AI.
""",

            subtype="plain"
        )


        fast_mail = FastMail(conf)

        await fast_mail.send_message(message)


        return {

            "success": True,

            "message": "Email notification sent successfully",

            "notification": {

                "user_id": notification.user_id,

                "type": notification.notification_type,

                "title": notification.title,

                "message": notification.message,

                "delivery_method": "email",

                "recipient": notification.recipient_email,

                "status": "SENT"

            }

        }


    except Exception as error:

        print(
            "EMAIL ERROR:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail="Unable to send email notification"

        )


# =========================================================
# NOTIFICATION TYPES
# =========================================================

@router.get("/types")
def notification_types():

    return {

        "notification_types": [

            "Routine Reminder",

            "Product Replenishment Reminder",

            "Hydration Reminder",

            "Sleep Reminder",

            "Progress Alert",

            "Platform Notification"

        ]

    }
# =========================================================
# SEND ROUTINE REMINDER EMAIL
# =========================================================

class RoutineReminderRequest(BaseModel):

    user_id: int

    recipient_email: str

    routine_type: str = "Morning"

    routine_steps: str = (
        "Cleanser → Treatment → Moisturizer → Sunscreen"
    )


@router.post("/send-routine-reminder")
async def send_routine_reminder(
    reminder: RoutineReminderRequest
):

    try:

        subject = (
            f"🌿 Skin AI - "
            f"{reminder.routine_type} Routine Reminder"
        )

        body = f"""
Hello,

This is your personalized skincare reminder from Skin AI.

It is time to complete your {reminder.routine_type.lower()} skincare routine.

Your recommended routine:

{reminder.routine_steps}

Please complete your routine to maintain consistency
with your personalized skincare plan.

This is an automated reminder from Skin AI.
"""

        message = MessageSchema(

            subject=subject,

            recipients=[
                reminder.recipient_email
            ],

            body=body,

            subtype="plain"
        )

        fast_mail = FastMail(conf)

        await fast_mail.send_message(message)

        return {

            "success": True,

            "message":
                "Routine reminder email sent successfully",

            "notification": {

                "user_id":
                    reminder.user_id,

                "notification_type":
                    "routine",

                "routine_type":
                    reminder.routine_type,

                "recipient":
                    reminder.recipient_email,

                "status":
                    "SENT"

            }

        }

    except Exception as error:

        print(
            "ROUTINE EMAIL ERROR:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=
                "Unable to send routine reminder email"

        )