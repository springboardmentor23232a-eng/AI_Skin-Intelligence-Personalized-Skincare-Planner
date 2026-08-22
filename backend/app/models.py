from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, func, JSON, Boolean
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
