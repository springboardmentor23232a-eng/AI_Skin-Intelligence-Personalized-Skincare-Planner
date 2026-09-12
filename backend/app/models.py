from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Date, Boolean, Time
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default="USER", nullable=False)
    provider = Column(String, default="local", nullable=False) # 'local' or 'google'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)

    # Link assessment to the authenticated user
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Questionnaire inputs
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=True)
    hydration_level = Column(String, nullable=True)
    oil_level = Column(String, nullable=True)
    sensitivity = Column(String, nullable=True)
    humidity = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)

    # Lifestyle & personalization inputs
    sleep_hours = Column(Float, nullable=True)
    sleep_quality = Column(String, nullable=True)
    water_glasses = Column(Float, nullable=True)
    lifestyle_habits = Column(JSONB, nullable=True)
    allergies = Column(JSONB, nullable=True)

    # Questionnaire assessment result
    predicted_skin_type = Column(String, nullable=False)
    health_score = Column(Integer, nullable=False)
    overall_condition = Column(String, nullable=False)

    # Vision AI result
    vision_predicted_concern = Column(String, nullable=True)
    vision_confidence = Column(String, nullable=True)

    # Complex assessment results
    concerns = Column(JSONB, nullable=True)
    priority_order = Column(JSONB, nullable=True)
    risk_factors = Column(JSONB, nullable=True)
    recommendations = Column(JSONB, nullable=True)

    # Scan image URL
    image_url = Column(String, nullable=True)

    # Assessment history timestamp
    assessment_time = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    assessment_id = Column(
        Integer,
        ForeignKey("assessments.id"),
        nullable=False,
        index=True
    )

    # Stores the complete generated/customized routine
    routine_data = Column(JSONB, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

class RoutineLog(Base):
    __tablename__ = "routine_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    log_date = Column(Date, nullable=False, index=True)
    completed_count = Column(Integer, nullable=False, default=0)
    total_count = Column(Integer, nullable=False, default=0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    type = Column(String, nullable=False)  # routine_reminder, product_replenishment, hydration, sleep, progress_alert, platform
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    action_url = Column(String, nullable=True)
    
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    is_dismissed = Column(Boolean, default=False, nullable=False, index=True)
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    notification_metadata = Column("metadata", JSONB, nullable=True)


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Routine reminders
    routine_reminders = Column(Boolean, default=True, nullable=False)
    routine_reminder_time = Column(Time, nullable=True)
    
    # Product reminders
    product_reminders = Column(Boolean, default=True, nullable=False)
    product_reminder_days_before = Column(Integer, default=7, nullable=False)
    
    # Hydration reminders
    hydration_reminders = Column(Boolean, default=True, nullable=False)
    hydration_goal_glasses = Column(Integer, default=8, nullable=False)
    hydration_reminder_interval_hours = Column(Integer, default=2, nullable=False)
    
    # Sleep reminders
    sleep_reminders = Column(Boolean, default=True, nullable=False)
    sleep_goal_hours = Column(Float, default=8.0, nullable=False)
    sleep_reminder_time = Column(Time, nullable=True)
    
    # Progress alerts
    progress_alerts = Column(Boolean, default=True, nullable=False)
    progress_alert_frequency = Column(String, default="weekly", nullable=False)  # daily, weekly, monthly
    
    # Platform notifications
    platform_notifications = Column(Boolean, default=True, nullable=False)
    
    # Delivery channels
    email_notifications = Column(Boolean, default=False, nullable=False)
    push_notifications = Column(Boolean, default=False, nullable=False)
    in_app_notifications = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )



class HydrationLog(Base):
    __tablename__ = "hydration_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    log_date = Column(Date, nullable=False, index=True)
    quantity_glasses = Column(Float, nullable=False)
    quantity_ml = Column(Integer, nullable=True)
    log_time = Column(Time, nullable=True)
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    log_date = Column(Date, nullable=False, index=True)
    sleep_hours = Column(Float, nullable=False)
    sleep_quality = Column(String, nullable=True)  # Good, Medium, Poor
    bedtime = Column(Time, nullable=True)
    wake_time = Column(Time, nullable=True)
    notes = Column(String, nullable=True)
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


class ProductPurchase(Base):
    __tablename__ = "product_purchases"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    product_id = Column(String, nullable=False)
    product_name = Column(String, nullable=False)
    purchase_date = Column(Date, nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    estimated_replenishment_date = Column(Date, nullable=True)
    actual_replenishment_date = Column(Date, nullable=True)
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


class ReminderSchedule(Base):
    __tablename__ = "reminder_schedules"

    id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    notification_type = Column(String, nullable=False)  # routine_reminder, product_replenishment, hydration, sleep, progress_alert
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    frequency = Column(String, default="daily", nullable=False)  # daily, weekly, monthly
    is_active = Column(Boolean, default=True, nullable=False)
    last_sent_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
