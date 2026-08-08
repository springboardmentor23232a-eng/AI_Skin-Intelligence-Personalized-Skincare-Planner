import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_uuid():
    return str(uuid.uuid4())


class RoleName(str, enum.Enum):
    user = "user"
    consultant = "consultant"
    dermatologist = "dermatologist"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # null for Google-only accounts
    google_id = Column(String, unique=True, nullable=True)
    role = Column(Enum(RoleName), default=RoleName.user, nullable=False)
    phone = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    skin_profile = relationship("SkinProfile", back_populates="user", uselist=False)
    assessments = relationship("SkinAssessment", back_populates="user", foreign_keys="SkinAssessment.user_id")


class Role(Base):
    """Metadata table backing the admin 'Manage Roles' screen."""
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    skin_type = Column(String, nullable=True)  # oily, dry, combination, normal, sensitive
    known_concerns = Column(Text, nullable=True)  # comma separated
    allergies = Column(Text, nullable=True)
    current_products = Column(Text, nullable=True)
    sun_exposure = Column(String, nullable=True)
    sleep_hours_avg = Column(Float, nullable=True)
    water_intake_l_avg = Column(Float, nullable=True)

    # Lifestyle
    diet = Column(String, nullable=True)  # vegetarian, non_vegetarian
    smoking = Column(Boolean, nullable=True)
    alcohol = Column(Boolean, nullable=True)
    exercise = Column(String, nullable=True)  # none, light, moderate, intense
    stress_level = Column(String, nullable=True)  # low, moderate, high
    screen_time_hours = Column(Float, nullable=True)

    # Allergies (by category)
    allergy_food = Column(Boolean, default=False)
    allergy_cosmetics = Column(Boolean, default=False)
    allergy_medicine = Column(Boolean, default=False)
    allergy_chemical = Column(Boolean, default=False)

    # Sensitivity triggers
    sensitivity_sunlight = Column(Boolean, default=False)
    sensitivity_dust = Column(Boolean, default=False)
    sensitivity_pollution = Column(Boolean, default=False)
    sensitivity_fragrance = Column(Boolean, default=False)
    sensitivity_alcohol = Column(Boolean, default=False)

    # Environmental exposure
    humidity = Column(String, nullable=True)  # low, moderate, high
    pollution_level = Column(String, nullable=True)  # low, moderate, high
    uv_exposure = Column(String, nullable=True)  # low, moderate, high
    outdoor_hours = Column(Float, nullable=True)
    climate = Column(String, nullable=True)  # dry, humid, temperate, tropical, cold

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="skin_profile")


class Image(Base):
    __tablename__ = "images"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=False)
    purpose = Column(String, default="scan")  # scan, profile_photo
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    image_id = Column(String, ForeignKey("images.id"), nullable=True)
    processed_image_id = Column(String, ForeignKey("images.id"), nullable=True)
    confidence_score = Column(Float, default=0.0)
    concern_priority = Column(String, nullable=True)  # highest-scoring concern, e.g. "acne"

    acne_score = Column(Float, default=0.0)
    pigmentation_score = Column(Float, default=0.0)
    wrinkle_score = Column(Float, default=0.0)
    dryness_score = Column(Float, default=0.0)
    oiliness_score = Column(Float, default=0.0)
    redness_score = Column(Float, default=0.0)
    pores_score = Column(Float, default=0.0)

    skin_health_score = Column(Float, default=0.0)  # 0-100, higher is healthier
    risk_score = Column(Float, default=0.0)  # 0-100, higher is riskier

    status = Column(String, default="pending_review")  # pending_review, consultant_reviewed, dermatologist_reviewed, closed
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments", foreign_keys=[user_id])
    ai_result = relationship("AIResult", back_populates="assessment", uselist=False)


class AIResult(Base):
    __tablename__ = "ai_results"

    id = Column(String, primary_key=True, default=gen_uuid)
    assessment_id = Column(String, ForeignKey("skin_assessments.id"), unique=True, nullable=False)
    model_version = Column(String, default="skin-cv-heuristic-v1")
    raw_output = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    assessment = relationship("SkinAssessment", back_populates="ai_result")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    category = Column(String, nullable=True)  # cleanser, moisturizer, sunscreen, serum...
    description = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    suitable_for = Column(String, nullable=True)  # skin types, comma separated
    created_at = Column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(String, ForeignKey("skin_assessments.id"), nullable=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    category = Column(String, nullable=True)  # routine, lifestyle, product
    text = Column(Text, nullable=False)
    created_by_role = Column(String, default="system")  # system, consultant, dermatologist
    created_by_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    provider_id = Column(String, ForeignKey("users.id"), nullable=False)
    provider_role = Column(Enum(RoleName), nullable=False)  # consultant or dermatologist
    scheduled_at = Column(DateTime, nullable=False)
    status = Column(String, default="requested")  # requested, confirmed, completed, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ConsultantNote(Base):
    __tablename__ = "consultant_notes"

    id = Column(String, primary_key=True, default=gen_uuid)
    consultant_id = Column(String, ForeignKey("users.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(String, ForeignKey("skin_assessments.id"), nullable=True)
    note = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class DermatologistNote(Base):
    __tablename__ = "dermatologist_notes"

    id = Column(String, primary_key=True, default=gen_uuid)
    dermatologist_id = Column(String, ForeignKey("users.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(String, ForeignKey("skin_assessments.id"), nullable=True)
    diagnosis = Column(Text, nullable=True)
    prescription = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    generated_by_id = Column(String, nullable=True)
    report_type = Column(String, default="assessment_summary")
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    """Backs the Consultant 'Message User' feature (also usable user <-> dermatologist)."""
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=gen_uuid)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    success = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
