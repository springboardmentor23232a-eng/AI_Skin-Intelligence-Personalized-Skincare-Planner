from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class NotificationItem(BaseModel):
    id: str = Field(..., description="Unique notification ID")
    type: str = Field(..., description="Type category: ROUTINE | REPLENISHMENT | HYDRATION | SLEEP | PROGRESS | PLATFORM")
    title: str = Field(..., description="Short headline title")
    message: str = Field(..., description="Detailed notification message text")
    timestamp: str = Field(..., description="Formatted timestamp")
    read: bool = Field(default=False, description="Read/unread status")
    priority: str = Field(default="MEDIUM", description="Priority level: LOW | MEDIUM | HIGH | URGENT")
    action_url: Optional[str] = Field(default=None, description="Optional action target URL or hash link")
    product_name: Optional[str] = Field(default=None, description="Associated product for replenishment alerts")
    days_left: Optional[int] = Field(default=None, description="Days remaining before product runs out")
    delivery_channels: List[str] = Field(default_factory=lambda: ["IN_APP"], description="Target channels: IN_APP | EMAIL | SMS")
    delivery_status_details: Optional[Dict[str, str]] = Field(default=None, description="Logs for Email & SMS dispatch status")

class ReminderPreferences(BaseModel):
    am_routine_time: str = Field(default="08:00", description="Morning routine reminder time (HH:MM)")
    am_routine_enabled: bool = Field(default=True, description="Morning routine reminder toggle")
    pm_routine_time: str = Field(default="21:00", description="Evening routine reminder time (HH:MM)")
    pm_routine_enabled: bool = Field(default=True, description="Evening routine reminder toggle")
    hydration_interval_hours: int = Field(default=2, description="Water intake reminder frequency in hours")
    hydration_enabled: bool = Field(default=True, description="Hydration reminder toggle")
    sleep_reminder_time: str = Field(default="22:30", description="Bedtime barrier recovery reminder time (HH:MM)")
    sleep_enabled: bool = Field(default=True, description="Sleep reminder toggle")
    replenishment_alerts_enabled: bool = Field(default=True, description="Product restock prediction alerts toggle")
    progress_photo_reminders_enabled: bool = Field(default=True, description="Weekly progress photo check-in toggle")
    email_notifications_enabled: bool = Field(default=True, description="Email notification delivery toggle")
    custom_email: str = Field(default="akp73733@gmail.com", description="User specified target Email ID for alerts")
    sms_notifications_enabled: bool = Field(default=True, description="SMS text message delivery toggle")
    custom_phone: str = Field(default="+91 9876543210", description="User specified target Mobile/Phone number for SMS alerts")
    preferred_channels: List[str] = Field(default_factory=lambda: ["IN_APP", "EMAIL", "SMS"], description="Active notification channels")

class ReplenishmentForecast(BaseModel):
    product_name: str
    category: str
    total_volume_ml: int
    daily_usage_ml: float
    days_remaining: int
    status: str  # OK | REPLENISH_SOON | CRITICAL
    buy_url: str

class NotificationFeedResponse(BaseModel):
    unread_count: int
    notifications: List[NotificationItem]
    replenishment_forecast: List[ReplenishmentForecast]
    preferences: ReminderPreferences

class TriggerTestInput(BaseModel):
    notification_type: str = Field(default="ROUTINE", description="Type category to simulate")
    title: str = Field(default="Test Skincare Alert", description="Title")
    message: str = Field(default="This is a test notification payload.", description="Body message")
    target_channel: str = Field(default="ALL", description="Delivery channel target: ALL | EMAIL | SMS | IN_APP")
    custom_email: Optional[str] = Field(default=None, description="Override email address for test dispatch")
    custom_phone: Optional[str] = Field(default=None, description="Override phone number for test dispatch")

