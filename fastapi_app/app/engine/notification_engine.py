from typing import List, Dict, Any
from datetime import datetime
from app.schemas.notification import NotificationItem, ReminderPreferences, ReplenishmentForecast

DEFAULT_PREFERENCES = ReminderPreferences()

MOTIVATIONAL_QUOTES: List[Dict[str, str]] = [
    {"quote": "Glowing skin is a result of proper care, not luck. Keep up your routine today!", "author": "Skincare Wisdom"},
    {"quote": "Consistency is the secret ingredient to healthy, resilient skin.", "author": "Dermatology Principle"},
    {"quote": "Invest in your skin. It is going to represent you for a very long time.", "author": "Linden Tyler"},
    {"quote": "Hydration is the ultimate fountain of youth. Drink water & nourish your barrier!", "author": "Skin Health Guide"},
    {"quote": "Self-care is how you take your power back. Take 5 minutes for your skin tonight!", "author": "Wellness Mindset"},
    {"quote": "Beautiful skin requires commitment, not a miracle. Great work on your routine streak!", "author": "Erno Laszlo"}
]

INITIAL_NOTIFICATIONS: List[NotificationItem] = [
    NotificationItem(
        id="notif-100",
        type="MOTIVATIONAL",
        title="✨ Daily Skin Positivity & Motivation",
        message="\"Glowing skin is a result of proper care, not luck. Keep up your routine today!\" — Skincare Wisdom",
        timestamp="Today, 07:00 AM",
        read=False,
        priority="HIGH",
        action_url="#reminders"
    ),
    NotificationItem(
        id="notif-101",
        type="ROUTINE",
        title="☀️ Morning Skincare Routine Reminder",
        message="It's 8:00 AM! Complete your 4-step AM routine: Gentle Cleanser, Niacinamide Serum, Hydrating Cream, and SPF 50 Sunscreen.",
        timestamp="Today, 08:00 AM",
        read=False,
        priority="HIGH",
        action_url="#checklist"
    ),
    NotificationItem(
        id="notif-102",
        type="REPLENISHMENT",
        title="⚠️ Sunscreen Restock Alert",
        message="Dot & Key Watermelon Sunscreen SPF 50 has approximately 4 days of usage remaining based on daily application rate.",
        timestamp="Today, 09:15 AM",
        read=False,
        priority="HIGH",
        action_url="#recommendations",
        product_name="Dot & Key Watermelon Sunscreen SPF 50",
        days_left=4
    ),
    NotificationItem(
        id="notif-103",
        type="HYDRATION",
        title="💧 Hydration Target Check-in",
        message="You've logged 1.5L of water today. Drink 1 more glass (500ml) to hit your 2.5L daily skin hydration target!",
        timestamp="Today, 02:30 PM",
        read=False,
        priority="MEDIUM",
        action_url="#overview"
    ),
    NotificationItem(
        id="notif-104",
        type="PROGRESS",
        title="🎉 7-Day Adherence Streak Achieved!",
        message="Awesome job! You completed all morning and night steps for 7 consecutive days. Your skin barrier score increased by +6 points.",
        timestamp="Yesterday, 09:45 PM",
        read=True,
        priority="MEDIUM",
        action_url="#progress"
    ),
    NotificationItem(
        id="notif-105",
        type="PLATFORM",
        title="👨‍⚕️ New Dermatologist Rx Update",
        message="Dr. Michael Chen updated your active prescription: Clindamycin 1% Gel (Morning) and Adaptalene 0.1% Cream (Night).",
        timestamp="2 days ago",
        read=True,
        priority="HIGH",
        action_url="#doctor-overview"
    ),
    NotificationItem(
        id="notif-106",
        type="SLEEP",
        title="🌙 Bedtime Skin Repair Warning",
        message="It's 10:30 PM. Prepare for 7-8 hours of uninterrupted sleep for optimal cellular regeneration and barrier repair.",
        timestamp="Yesterday, 10:30 PM",
        read=True,
        priority="MEDIUM",
        action_url="#routine"
    )
]

PRODUCT_CATALOG_REPLENISHMENT: List[Dict[str, Any]] = [
    {
        "product_name": "Dot & Key Watermelon Sunscreen SPF 50",
        "category": "Sunscreen",
        "total_volume_ml": 50,
        "daily_usage_ml": 2.0,
        "days_remaining": 4,
        "status": "CRITICAL",
        "buy_url": "https://www.nykaa.com/dot-key-watermelon-cooling-sunscreen-spf-50-pa/p/5012543"
    },
    {
        "product_name": "Minimalist Niacinamide 10% Serum",
        "category": "Serum",
        "total_volume_ml": 30,
        "daily_usage_ml": 0.8,
        "days_remaining": 12,
        "status": "REPLENISH_SOON",
        "buy_url": "https://www.nykaa.com/minimalist-10percent-niacinamide-face-serum/p/1026026"
    },
    {
        "product_name": "La Roche-Posay Effaclar Gel Cleanser",
        "category": "Face Wash",
        "total_volume_ml": 200,
        "daily_usage_ml": 3.0,
        "days_remaining": 42,
        "status": "OK",
        "buy_url": "https://www.nykaa.com/search/result/?q=La%20Roche%20Posay%20Effaclar"
    },
    {
        "product_name": "CeraVe Moisturizing Cream",
        "category": "Moisturizer",
        "total_volume_ml": 177,
        "daily_usage_ml": 3.5,
        "days_remaining": 28,
        "status": "OK",
        "buy_url": "https://www.nykaa.com/cerave-moisturizing-cream/p/9274531"
    }
]

class NotificationEngine:
    """
    Core engine handling notification generation, replenishment prediction, and preference management.
    """

    @staticmethod
    def get_user_notifications(preferences: ReminderPreferences = DEFAULT_PREFERENCES) -> List[NotificationItem]:
        """
        Filters and returns active user notifications based on user preferences.
        """
        filtered = []
        for n in INITIAL_NOTIFICATIONS:
            if n.type == "ROUTINE" and not (preferences.am_routine_enabled or preferences.pm_routine_enabled):
                continue
            if n.type == "HYDRATION" and not preferences.hydration_enabled:
                continue
            if n.type == "SLEEP" and not preferences.sleep_enabled:
                continue
            if n.type == "REPLENISHMENT" and not preferences.replenishment_alerts_enabled:
                continue
            if n.type == "PROGRESS" and not preferences.progress_photo_reminders_enabled:
                continue
            filtered.append(n)
        return filtered

    @staticmethod
    def get_replenishment_forecast() -> List[ReplenishmentForecast]:
        """
        Calculates and returns replenishment forecasts for active user products.
        """
        forecasts = []
        for p in PRODUCT_CATALOG_REPLENISHMENT:
            forecasts.append(
                ReplenishmentForecast(
                    product_name=p["product_name"],
                    category=p["category"],
                    total_volume_ml=p["total_volume_ml"],
                    daily_usage_ml=p["daily_usage_ml"],
                    days_remaining=p["days_remaining"],
                    status=p["status"],
                    buy_url=p["buy_url"]
                )
            )
        return forecasts

    @staticmethod
    def get_random_motivational_quote() -> Dict[str, str]:
        """
        Returns a random skincare & self-care motivational quote.
        """
        import random
        return random.choice(MOTIVATIONAL_QUOTES)

    @staticmethod
    def create_test_notification(
        notification_type: str,
        title: str,
        message: str,
        target_channel: str = "ALL",
        custom_email: str = "akp73733@gmail.com",
        custom_phone: str = "+91 9876543210"
    ) -> NotificationItem:
        """
        Creates a custom test notification object for real-time trigger simulation with multi-channel delivery details (Email & SMS).
        """
        now_str = datetime.now().strftime("%I:%M %p")
        channels = []
        details = {}

        if target_channel in ["ALL", "IN_APP"]:
            channels.append("IN_APP")
            details["IN_APP"] = "Delivered to In-App Notification Feed"

        if target_channel in ["ALL", "EMAIL"]:
            channels.append("EMAIL")
            target_addr = custom_email or "akp73733@gmail.com"
            details["EMAIL"] = f"Sent via SMTP Gateway to {target_addr}"

        if target_channel in ["ALL", "SMS"]:
            channels.append("SMS")
            target_mob = custom_phone or "+91 9876543210"
            details["SMS"] = f"Sent via Twilio SMS Gateway to {target_mob}"

        return NotificationItem(
            id=f"notif-test-{int(datetime.now().timestamp())}",
            type=notification_type.upper(),
            title=title,
            message=message,
            timestamp=f"Just now ({now_str})",
            read=False,
            priority="HIGH",
            action_url="#checklist",
            delivery_channels=channels,
            delivery_status_details=details
        )

