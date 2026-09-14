from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, func, JSON, Boolean, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    
    # Python attribute is hashed_password, but it maps directly to column 'password' in PostgreSQL
    hashed_password = Column("password", String, nullable=True)
    
    # Roles: USER, CONSULTANT, DOCTOR, ADMIN
    role = Column(String, default="USER", nullable=False)
    
    # Providers: LOCAL, GOOGLE
    provider = Column(String, default="LOCAL", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    assessments = relationship("SkinAssessment", back_populates="user", cascade="all, delete-orphan")
    routine_profile = relationship("RoutineProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    routines = relationship("Routine", back_populates="user", cascade="all, delete-orphan")
    health_scores = relationship("SkinHealthScoreRecord", back_populates="user", cascade="all, delete-orphan")
    checklist_logs = relationship("DailyChecklistLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    notification_preferences = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    product_trackers = relationship("UserProductTracker", back_populates="user", cascade="all, delete-orphan")


class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assessment_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    skin_health_score = Column(Integer, nullable=False)
    overall_condition = Column(String(100), nullable=False)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="assessments")
    concerns = relationship("SkinConcern", back_populates="assessment", cascade="all, delete-orphan")
    risks = relationship("RiskFactor", back_populates="assessment", cascade="all, delete-orphan")


class SkinConcern(Base):
    __tablename__ = "skin_concerns"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=False)
    concern_name = Column(String(100), nullable=False)
    severity = Column(Float, nullable=False)
    priority = Column(String(50), nullable=False)

    # Relationships
    assessment = relationship("SkinAssessment", back_populates="concerns")


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=False)
    risk_name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    risk_level = Column(String(50), nullable=False)

    # Relationships
    assessment = relationship("SkinAssessment", back_populates="risks")


# --- Module 4: Personalized Skincare Routine Models ---

class RoutineProfile(Base):
    __tablename__ = "routine_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Q1-Q3: Skin Profile
    age_group = Column(String(50), nullable=False)
    skin_type = Column(String(50), nullable=False)
    sensitivity = Column(String(50), nullable=False)
    
    # Q4-Q8: Skin Concerns
    concerns = Column(JSON, nullable=False) # List of concerns
    acne_severity = Column(String(50), nullable=False)
    oiliness = Column(String(50), nullable=False)
    dryness = Column(String(50), nullable=False)
    redness_frequency = Column(String(50), nullable=False)
    
    # Q9-Q13: Current Skincare
    has_routine = Column(String(50), nullable=False)
    current_products = Column(JSON, nullable=False) # List of products
    routine_frequency = Column(String(50), nullable=False)
    skincare_irritation = Column(String(50), nullable=False)
    active_ingredients = Column(JSON, nullable=False) # List of actives
    
    # Q14-Q18: Lifestyle
    sleep_hours = Column(String(50), nullable=False)
    water_intake = Column(String(50), nullable=False)
    stress_level = Column(String(50), nullable=False)
    exercise_frequency = Column(String(50), nullable=False)
    outdoor_hours = Column(String(50), nullable=False)
    
    # Q19-Q21: Environment
    climate = Column(String(50), nullable=False)
    pollution_exposure = Column(String(50), nullable=False)
    sunlight_exposure = Column(String(50), nullable=False)
    
    # Q22-Q24: Allergies & Safety
    has_allergies = Column(String(50), nullable=False)
    avoid_ingredients = Column(String(500), nullable=True) # Free-text allergy avoided list
    has_allergic_reaction = Column(String(50), nullable=False)
    
    # Q25-Q28: Routine Preferences
    skincare_time = Column(String(50), nullable=False)
    routine_preference = Column(String(50), nullable=False)
    budget = Column(String(50), nullable=False)
    skincare_goal = Column(String(100), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="routine_profile")


class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(Integer, ForeignKey("routine_profiles.id", ondelete="SET NULL"), nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    is_user_modified = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="routines")
    profile = relationship("RoutineProfile")
    items = relationship("RoutineItem", back_populates="routine", cascade="all, delete-orphan")


class RoutineItem(Base):
    __tablename__ = "routine_items"

    id = Column(Integer, primary_key=True, index=True)
    routine_id = Column(Integer, ForeignKey("routines.id", ondelete="CASCADE"), nullable=False)
    routine_type = Column(String(50), nullable=False) # MORNING, EVENING, WEEKLY, SEASONAL
    category = Column(String(50), nullable=False) # CLEANSING, EXFOLIATION, TREATMENT, MOISTURIZING, SUN_PROTECTION, NIGHT_CARE
    step_order = Column(Integer, nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(String(500), nullable=False)
    frequency = Column(String(100), nullable=False)
    notes = Column(String(500), nullable=True)
    is_enabled = Column(Boolean, default=True, nullable=False)

    # Relationships
    routine = relationship("Routine", back_populates="items")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False)
    short_description = Column(String(500), nullable=False)
    benefits = Column(JSON, nullable=False) # List of benefits
    suitable_skin_types = Column(JSON, nullable=False) # List of skin types
    common_concerns = Column(JSON, nullable=False) # List of concerns
    usage_guidance = Column(String(500), nullable=False)
    precautions = Column(String(500), nullable=False)
    typical_frequency = Column(String(100), nullable=False)
    irritation_level = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    brand = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) # Face Wash, Moisturizer, Sunscreen, Serum, Toner, Treatment Products, Face Masks
    description = Column(String(500), nullable=False)
    price = Column(Integer, nullable=False) # In INR
    ingredients = Column(JSON, nullable=False) # List of ingredient names (strings)
    suitable_skin_types = Column(JSON, nullable=False) # List of skin types
    suitable_concerns = Column(JSON, nullable=False) # List of concerns
    benefits = Column(JSON, nullable=False) # List of benefits
    usage_guidance = Column(String(500), nullable=False)
    precautions = Column(String(500), nullable=False)
    irritation_level = Column(String(50), nullable=False) # Low, Medium, High
    rating = Column(Float, default=4.5, nullable=False)
    image_url = Column(String(500), nullable=True) # Real product image URL / CDN asset
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# --- Module 7: Skin Health Scoring Engine Models ---

class SkinHealthScoreRecord(Base):
    __tablename__ = "skin_health_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # 0 - 100 Overall Score
    overall_score = Column(Integer, nullable=False)
    
    # Normalized Sub-Scores (0 - 100)
    condition_score = Column(Float, nullable=False)   # 35% weight
    lifestyle_score = Column(Float, nullable=False)   # 20% weight
    sleep_score = Column(Float, nullable=False)       # 15% weight
    routine_score = Column(Float, nullable=False)     # 20% weight
    hydration_score = Column(Float, nullable=False)   # 10% weight
    
    # References
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="SET NULL"), nullable=True)
    routine_profile_id = Column(Integer, ForeignKey("routine_profiles.id", ondelete="SET NULL"), nullable=True)
    
    # Structured breakdown, insights, tips
    breakdown = Column(JSON, nullable=True)
    
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="health_scores")
    assessment = relationship("SkinAssessment")
    profile = relationship("RoutineProfile")


class DailyChecklistLog(Base):
    __tablename__ = "daily_checklist_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    completed_count = Column(Integer, nullable=False)
    total_count = Column(Integer, nullable=False)
    completion_rate = Column(Float, nullable=False) # 0.0 - 1.0
    logged_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="checklist_logs")


# --- Module 10: Notification & Reminder System Models ---

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False) # ROUTINE, REPLENISHMENT, HYDRATION, SLEEP, PROGRESS, PLATFORM, CONSULTANT, DOCTOR, ADMIN
    target_role = Column(String(50), nullable=False, default="USER") # Target user role
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), default="NORMAL", nullable=False) # LOW, NORMAL, HIGH, URGENT
    action_url = Column(String(255), nullable=True)
    related_entity_type = Column(String(50), nullable=True) # routine, product, assessment, user, system
    related_entity_id = Column(Integer, nullable=True)
    dedup_key = Column(String(255), nullable=True, index=True)
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    email_delivery_status = Column(String(50), default="NOT_REQUESTED", nullable=False)
    email_sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # USER In-App Notification Preferences
    routine_reminders_enabled = Column(Boolean, default=True, nullable=False)
    morning_reminder_time = Column(String(10), default="08:00", nullable=False)
    evening_reminder_time = Column(String(10), default="20:00", nullable=False)
    
    replenishment_reminders_enabled = Column(Boolean, default=True, nullable=False)
    
    hydration_reminders_enabled = Column(Boolean, default=True, nullable=False)
    hydration_interval_hours = Column(Integer, default=4, nullable=False)
    
    sleep_reminders_enabled = Column(Boolean, default=True, nullable=False)
    sleep_reminder_time = Column(String(10), default="22:00", nullable=False)
    
    progress_alerts_enabled = Column(Boolean, default=True, nullable=False)
    platform_announcements_enabled = Column(Boolean, default=True, nullable=False)
    
    # CONSULTANT In-App Preferences
    consultant_client_updates_enabled = Column(Boolean, default=True, nullable=False)
    consultant_progress_enabled = Column(Boolean, default=True, nullable=False)
    consultant_assessment_enabled = Column(Boolean, default=True, nullable=False)
    consultant_routine_enabled = Column(Boolean, default=True, nullable=False)
    
    # DOCTOR/DERMATOLOGIST In-App Preferences
    doctor_patient_alerts_enabled = Column(Boolean, default=True, nullable=False)
    doctor_assessment_enabled = Column(Boolean, default=True, nullable=False)
    doctor_progress_enabled = Column(Boolean, default=True, nullable=False)
    doctor_treatment_enabled = Column(Boolean, default=True, nullable=False)
    
    # ADMIN In-App Preferences
    admin_system_alerts_enabled = Column(Boolean, default=True, nullable=False)
    admin_user_alerts_enabled = Column(Boolean, default=True, nullable=False)
    admin_analytics_alerts_enabled = Column(Boolean, default=True, nullable=False)
    admin_recommendation_alerts_enabled = Column(Boolean, default=True, nullable=False)
    admin_reports_alerts_enabled = Column(Boolean, default=True, nullable=False)
    
    # Email Notification Preferences (Explicit Consent - Default OFF for privacy)
    email_notifications_enabled = Column(Boolean, default=False, nullable=False)
    email_routine_enabled = Column(Boolean, default=True, nullable=False)
    email_replenishment_enabled = Column(Boolean, default=True, nullable=False)
    email_hydration_enabled = Column(Boolean, default=True, nullable=False)
    email_sleep_enabled = Column(Boolean, default=True, nullable=False)
    email_progress_enabled = Column(Boolean, default=True, nullable=False)
    email_platform_enabled = Column(Boolean, default=True, nullable=False)
    email_consultant_enabled = Column(Boolean, default=True, nullable=False)
    email_doctor_enabled = Column(Boolean, default=True, nullable=False)
    email_admin_enabled = Column(Boolean, default=True, nullable=False)
    
    quiet_hours_enabled = Column(Boolean, default=False, nullable=False)
    quiet_hours_start = Column(String(10), default="22:30", nullable=False)
    quiet_hours_end = Column(String(10), default="07:00", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="notification_preferences")


class UserProductTracker(Base):
    __tablename__ = "user_product_trackers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    routine_item_id = Column(Integer, ForeignKey("routine_items.id", ondelete="SET NULL"), nullable=True)
    
    product_name = Column(String(150), nullable=False)
    opened_on = Column(Date, default=func.current_date(), nullable=False)
    cycle_days = Column(Integer, default=45, nullable=False) # e.g. 30, 45, 60, 90 days
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="product_trackers")
    routine_item = relationship("RoutineItem")
