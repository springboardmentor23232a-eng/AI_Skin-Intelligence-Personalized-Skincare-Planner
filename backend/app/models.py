from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base

class UserRole(str, enum.Enum):
    USER = "USER"
    SKINCARE_CONSULTANT = "SKINCARE_CONSULTANT"
    DERMATOLOGIST = "DERMATOLOGIST"
    ADMIN = "ADMIN"


class AuthProvider(str, enum.Enum):
    LOCAL = "LOCAL"
    GOOGLE = "GOOGLE"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=True)  # Nullable for OAuth users
    role = Column(String(50), nullable=False, default="USER")
    provider = Column(String(50), nullable=False, default="LOCAL")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    profile = relationship("SkinProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessments = relationship("SkinAssessment", back_populates="user", cascade="all, delete-orphan")
    routines = relationship("SkincareRoutine", back_populates="user", cascade="all, delete-orphan")
    compatibility_checks = relationship("IngredientCompatibilityCheck", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("ProductRecommendation", back_populates="user", cascade="all, delete-orphan")
    skincare_logs = relationship("SkincareLog", back_populates="user", cascade="all, delete-orphan")
    progress_photos = relationship("SkinProgressPhoto", back_populates="user", cascade="all, delete-orphan")
    patient_consultations = relationship("Consultation", foreign_keys="[Consultation.patient_id]", back_populates="patient", cascade="all, delete-orphan")
    consultant_consultations = relationship("Consultation", foreign_keys="[Consultation.consultant_id]", back_populates="consultant", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reminder_settings = relationship("ReminderSetting", back_populates="user", cascade="all, delete-orphan")
    image_analyses = relationship("ImageAnalysis", back_populates="user", cascade="all, delete-orphan")





class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(50), nullable=False)
    skin_type = Column(String(50), nullable=False)
    skin_tone = Column(String(50), nullable=False)
    concerns = Column(JSON, nullable=False, default=[])
    allergies = Column(Text, nullable=True)
    sensitivities = Column(Text, nullable=True)
    lifestyle = Column(String(100), nullable=True)
    sleep_quality = Column(String(50), nullable=True)
    water_intake = Column(Float, nullable=False, default=2.0)
    stress_level = Column(String(50), nullable=True)
    environmental_exposure = Column(String(100), nullable=True)
    climate = Column(String(50), nullable=True)
    uv_exposure = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="profile")

class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    acne = Column(Integer, nullable=False, default=20)
    hyperpigmentation = Column(Integer, nullable=False, default=15)
    dryness = Column(Integer, nullable=False, default=30)
    oiliness = Column(Integer, nullable=False, default=25)
    redness = Column(Integer, nullable=False, default=10)
    sensitivity = Column(Integer, nullable=False, default=15)
    wrinkles = Column(Integer, nullable=False, default=10)
    fine_lines = Column(Integer, nullable=False, default=15)
    dark_spots = Column(Integer, nullable=False, default=20)
    uneven_tone = Column(Integer, nullable=False, default=20)
    overall_score = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False)
    concern_priority = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="assessments")

class SkincareRoutine(Base):
    __tablename__ = "skincare_routines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    routine_type = Column(String(50), nullable=False, index=True)  # MORNING, EVENING, WEEKLY, MONTHLY, SEASONAL
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    steps = Column(JSON, nullable=False, default=[])  # List of step objects
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="routines")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    benefits = Column(JSON, nullable=False, default=[])
    side_effects = Column(JSON, nullable=False, default=[])
    suitable_skin_types = Column(JSON, nullable=False, default=[])
    suitable_skin_concerns = Column(JSON, nullable=False, default=[])
    usage_time = Column(String(50), nullable=False, default="BOTH")  # MORNING, NIGHT, BOTH
    compatible_ingredients = Column(JSON, nullable=False, default=[])
    conflicting_ingredients = Column(JSON, nullable=False, default=[])
    safety_warnings = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class IngredientCompatibilityCheck(Base):
    __tablename__ = "ingredient_compatibility_checks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_ingredients = Column(JSON, nullable=False, default=[])
    is_safe = Column(Integer, nullable=False, default=1)  # 1 for True, 0 for False
    conflicts_found = Column(JSON, nullable=False, default=[])
    recommendation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="compatibility_checks")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    brand = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # Cleanser, Serum, Moisturizer, Sunscreen, Treatment, Toner
    price = Column(Float, nullable=False, default=0.0)
    rating = Column(Float, nullable=False, default=4.5)
    active_ingredients = Column(JSON, nullable=False, default=[])
    suitable_skin_types = Column(JSON, nullable=False, default=[])
    suitable_concerns = Column(JSON, nullable=False, default=[])
    description = Column(Text, nullable=False)
    usage_instructions = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ProductRecommendation(Base):
    __tablename__ = "product_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    budget_tier = Column(String(50), nullable=False, default="ALL")  # LOW, MEDIUM, PREMIUM, ALL
    recommended_products = Column(JSON, nullable=False, default=[])  # List of product suitability payload objects
    overall_match_score = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="recommendations")


class SkincareLog(Base):
    __tablename__ = "skincare_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    routine_type = Column(String(50), nullable=False, index=True)  # MORNING, EVENING, WEEKLY
    logged_date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed = Column(Integer, nullable=False, default=1)  # 1 for True, 0 for False
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="skincare_logs")


class SkinProgressPhoto(Base):
    __tablename__ = "skin_progress_photos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    logged_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    photo_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    associated_assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="SET NULL"), nullable=True)

    user = relationship("User", back_populates="progress_photos")
    assessment = relationship("SkinAssessment")


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    consultant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    status = Column(String(50), nullable=False, default="PENDING", index=True)  # PENDING, COMPLETED, CANCELLED
    notes = Column(Text, nullable=True)
    treatment_recommendations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("User", foreign_keys=[patient_id], back_populates="patient_consultations")
    consultant = relationship("User", foreign_keys=[consultant_id], back_populates="consultant_consultations")


class ClinicalReview(Base):
    __tablename__ = "clinical_reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_id = Column(Integer, ForeignKey("product_recommendations.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), nullable=False, default="APPROVED")  # APPROVED, REJECTED, MODIFIED
    custom_routine = Column(JSON, nullable=True)
    recommended_products = Column(JSON, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("User", foreign_keys=[patient_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, default="ROUTINE", index=True)  # ROUTINE, HYDRATION, SLEEP, REFILL, APPOINTMENT, ASSESSMENT
    priority = Column(String(20), nullable=False, default="MEDIUM", index=True)  # LOW, MEDIUM, HIGH
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Integer, nullable=False, default=0, index=True)  # 0 for False, 1 for True
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="notifications")


class ReminderSetting(Base):
    __tablename__ = "reminder_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reminder_type = Column(String(50), nullable=False, index=True)  # ROUTINE_MORNING, ROUTINE_EVENING, HYDRATION, SLEEP, ASSESSMENT_CHECK
    enabled = Column(Integer, nullable=False, default=1)  # 1 for True, 0 for False
    time_of_day = Column(String(10), nullable=False, default="08:00")  # e.g., "08:00"
    recurrence = Column(String(20), nullable=False, default="DAILY")  # DAILY, WEEKLY

    user = relationship("User", back_populates="reminder_settings")


class ImageAnalysis(Base):
    __tablename__ = "image_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    upload_source = Column(String(50), nullable=False)  # "WEBCAM" or "GALLERY"
    upload_time = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    prediction = Column(JSON, nullable=True)  # Analysis predictions detail (acne, dryness, oiliness, etc.)
    confidence = Column(Float, nullable=True)
    processing_time = Column(Float, nullable=True)
    status = Column(String(50), nullable=False, default="COMPLETED")

    user = relationship("User", back_populates="image_analyses")






