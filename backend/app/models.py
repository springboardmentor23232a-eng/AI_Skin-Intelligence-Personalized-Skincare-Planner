import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, ForeignKey, DateTime,
    Text, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class RoleEnum(str, enum.Enum):
    user = "user"
    consultant = "consultant"
    dermatologist = "dermatologist"
    admin = "admin"


class SkinTypeEnum(str, enum.Enum):
    oily = "oily"
    dry = "dry"
    combination = "combination"
    normal = "normal"
    sensitive = "sensitive"


class SeverityEnum(str, enum.Enum):
    low = "low"
    moderate = "moderate"
    high = "high"


class RiskLevelEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


# ---------------------------------------------------------------------------
# 1. USER AUTH & ROLE-BASED ACCESS
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)  # null if OAuth-only
    google_id = Column(String(150), nullable=True, unique=True)
    role = Column(SAEnum(RoleEnum), default=RoleEnum.user, nullable=False)
    is_active = Column(Boolean, default=True)
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skin_profile = relationship("SkinProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessments = relationship("SkinAssessment", back_populates="user", cascade="all, delete-orphan")
    routines = relationship("Routine", back_populates="user", cascade="all, delete-orphan")
    progress_logs = relationship("ProgressLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# 2. SKIN PROFILE MANAGEMENT
# ---------------------------------------------------------------------------
class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True, nullable=False)

    skin_type = Column(SAEnum(SkinTypeEnum), nullable=True)
    age_group = Column(String(30), nullable=True)
    allergies = Column(Text, nullable=True)          # comma separated
    sensitivities = Column(Text, nullable=True)       # comma separated
    lifestyle_habits = Column(Text, nullable=True)    # comma separated (smoking, exercise, etc.)
    sleep_quality = Column(Integer, nullable=True)    # 1-10
    water_intake_liters = Column(Float, nullable=True)
    environmental_exposure = Column(String(100), nullable=True)  # e.g. "high pollution, high UV"
    hydration_level = Column(Integer, nullable=True)  # 1-10

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="skin_profile")


# ---------------------------------------------------------------------------
# 3. SKIN ASSESSMENT ENGINE
# ---------------------------------------------------------------------------
class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    assessment_date = Column(DateTime, default=datetime.utcnow)
    skin_health_score = Column(Float, nullable=False, default=0.0)
    overall_condition = Column(String(50), nullable=True)
    detected_skin_type = Column(SAEnum(SkinTypeEnum), nullable=True)
    image_path = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    concerns = relationship("SkinConcern", back_populates="assessment", cascade="all, delete-orphan")
    risk_factors = relationship("RiskFactor", back_populates="assessment", cascade="all, delete-orphan")


class SkinConcern(Base):
    __tablename__ = "skin_concerns"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    assessment_id = Column(UUID(as_uuid=False), ForeignKey("skin_assessments.id"), nullable=False)
    concern_name = Column(String(100), nullable=False)   # acne, hyperpigmentation, dryness...
    severity = Column(SAEnum(SeverityEnum), default=SeverityEnum.low)
    priority = Column(Integer, default=1)  # 1 = highest priority

    assessment = relationship("SkinAssessment", back_populates="concerns")


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    assessment_id = Column(UUID(as_uuid=False), ForeignKey("skin_assessments.id"), nullable=False)
    risk_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    risk_level = Column(SAEnum(RiskLevelEnum), default=RiskLevelEnum.low)

    assessment = relationship("SkinAssessment", back_populates="risk_factors")


# ---------------------------------------------------------------------------
# 4. PERSONALIZED ROUTINE GENERATOR
# ---------------------------------------------------------------------------
class Routine(Base):
    __tablename__ = "routines"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    assessment_id = Column(UUID(as_uuid=False), ForeignKey("skin_assessments.id"), nullable=True)
    routine_type = Column(String(20), default="morning")   # morning, evening, weekly, seasonal
    season = Column(String(20), nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="routines")
    steps = relationship("RoutineStep", back_populates="routine", cascade="all, delete-orphan")


class RoutineStep(Base):
    __tablename__ = "routine_steps"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    routine_id = Column(UUID(as_uuid=False), ForeignKey("routines.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    category = Column(String(30), nullable=False)  # cleansing, exfoliation, treatment, moisturizing, sun_protection, night_care
    instruction = Column(String(255), nullable=False)
    product_id = Column(UUID(as_uuid=False), ForeignKey("products.id"), nullable=True)

    routine = relationship("Routine", back_populates="steps")
    product = relationship("Product")


# ---------------------------------------------------------------------------
# 5. INGREDIENT INTELLIGENCE MODULE
# ---------------------------------------------------------------------------
class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50), nullable=True)   # retinoid, niacinamide, vitamin_c, etc.
    description = Column(Text, nullable=True)
    good_for = Column(Text, nullable=True)          # comma separated concerns
    avoid_if = Column(Text, nullable=True)           # comma separated sensitivities/allergies
    interacts_badly_with = Column(Text, nullable=True)  # comma separated ingredient names


# ---------------------------------------------------------------------------
# 6. PRODUCT RECOMMENDATION ENGINE
# ---------------------------------------------------------------------------
class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(150), nullable=False)
    brand = Column(String(100), nullable=True)
    category = Column(String(30), nullable=False)  # face_wash, moisturizer, sunscreen, serum, toner, treatment, mask
    price = Column(Float, default=0.0)
    suitable_skin_types = Column(Text, nullable=True)  # comma separated
    targets_concerns = Column(Text, nullable=True)     # comma separated
    key_ingredients = Column(Text, nullable=True)      # comma separated ingredient names
    image_url = Column(String(255), nullable=True)


# ---------------------------------------------------------------------------
# 7 & 8. SKIN HEALTH SCORING + PROGRESS TRACKING
# ---------------------------------------------------------------------------
class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    assessment_id = Column(UUID(as_uuid=False), ForeignKey("skin_assessments.id"), nullable=True)
    log_date = Column(DateTime, default=datetime.utcnow)
    routine_adherence_pct = Column(Float, default=0.0)
    skin_health_score = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="progress_logs")


# ---------------------------------------------------------------------------
# 10. NOTIFICATION & REMINDER SYSTEM
# ---------------------------------------------------------------------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(30), default="general")  # routine, replenishment, hydration, sleep, progress, platform
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


# ---------------------------------------------------------------------------
# CONSULTANT / DERMATOLOGIST <-> CLIENT LINK
# ---------------------------------------------------------------------------
class ClientLink(Base):
    """Links a consultant/dermatologist to a user (client/patient)."""
    __tablename__ = "client_links"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    professional_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    client_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ProfessionalRecommendation(Base):
    """Recommendations issued by a consultant/dermatologist for a client."""
    __tablename__ = "professional_recommendations"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    professional_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    client_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    assessment_id = Column(UUID(as_uuid=False), ForeignKey("skin_assessments.id"), nullable=True)
    recommendation_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
