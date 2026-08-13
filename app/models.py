from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, UniqueConstraint, Boolean, Text
from sqlalchemy.orm import relationship, backref
from app.database import Base


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, default="")
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assignments = relationship("Assignment", back_populates="user", cascade="all, delete-orphan")


class Consultant(Base):
    __tablename__ = "consultants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, default="")
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    assignments = relationship("Assignment", back_populates="consultant", cascade="all, delete-orphan")


class Assignment(Base):
    __tablename__ = "assignments"
    __table_args__ = (
        UniqueConstraint("user_id", "consultant_id", name="uq_user_consultant"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    consultant_id = Column(Integer, ForeignKey("consultants.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="assignments")
    consultant = relationship("Consultant", back_populates="assignments")


class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    skin_type = Column(String(50), nullable=True, default="")
    age_group = Column(String(50), nullable=True, default="")
    skin_concerns = Column(String(500), nullable=True, default="")
    allergies = Column(String(500), nullable=True, default="")
    sensitivities = Column(String(500), nullable=True, default="")
    lifestyle_habits = Column(String(500), nullable=True, default="")
    sleep_quality = Column(String(50), nullable=True, default="")
    water_intake = Column(String(50), nullable=True, default="")
    environmental_exposure = Column(String(500), nullable=True, default="")
    image_url = Column(String(500), nullable=True, default="")
    skin_health_score = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref=backref("skin_profile", uselist=False, cascade="all, delete-orphan"))


class AssessmentHistory(Base):
    __tablename__ = "assessment_history"

    assessment_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skin_profile_id = Column(Integer, ForeignKey("skin_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skin_health_score = Column(Integer, nullable=False, default=0)
    skin_health_category = Column(String(50), nullable=False, default="Fair")  # Excellent, Good, Fair, Poor
    overall_risk_level = Column(String(50), nullable=False, default="Low")     # Low, Medium, High, Critical
    assessment_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    model_version = Column(String(50), nullable=False, default="v1.0.0")
    image_url = Column(String(500), nullable=True, default="")
    trigger_source = Column(String(50), nullable=False, default="survey_update")  # survey_update, photo_scan, routine_checkin
    notes = Column(String(1000), nullable=True, default="")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref=backref("assessment_history", cascade="all, delete-orphan"))
    skin_profile = relationship("SkinProfile", backref=backref("assessments", cascade="all, delete-orphan"))
    risks = relationship("AssessmentRisk", back_populates="assessment", cascade="all, delete-orphan")
    priorities = relationship("AssessmentPriority", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentRisk(Base):
    __tablename__ = "assessment_risks"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessment_history.assessment_id", ondelete="CASCADE"), nullable=False, index=True)
    risk_title = Column(String(255), nullable=False)
    risk_level = Column(String(50), nullable=False, default="Low")  # Low, Medium, High, Critical
    description = Column(String(2000), nullable=False, default="")
    recommendation = Column(String(2000), nullable=False, default="")

    assessment = relationship("AssessmentHistory", back_populates="risks")


class AssessmentPriority(Base):
    __tablename__ = "assessment_priorities"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessment_history.assessment_id", ondelete="CASCADE"), nullable=False, index=True)
    concern_name = Column(String(255), nullable=False)
    priority_rank = Column(Integer, nullable=False)
    severity = Column(String(50), nullable=False, default="Low")    # Low, Medium, High, Critical
    priority_score = Column(Integer, nullable=False, default=0)

    assessment = relationship("AssessmentHistory", back_populates="priorities")


class SkincareRoutine(Base):
    __tablename__ = "skincare_routines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    season = Column(String(50), nullable=False, default="Summer")  # Summer, Winter, Spring, Autumn
    last_adapted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    adaptation_summary = Column(Text, nullable=True, default="")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref=backref("skincare_routine", uselist=False, cascade="all, delete-orphan"))
    steps = relationship("RoutineStep", back_populates="routine", cascade="all, delete-orphan", order_by="RoutineStep.step_order")
    seasonal_recommendations = relationship("SeasonalRecommendation", back_populates="routine", cascade="all, delete-orphan")


class RoutineStep(Base):
    __tablename__ = "routine_steps"

    id = Column(Integer, primary_key=True, index=True)
    routine_id = Column(Integer, ForeignKey("skincare_routines.id", ondelete="CASCADE"), nullable=False, index=True)
    time_of_day = Column(String(50), nullable=False, default="morning")  # morning, evening, weekly
    step_order = Column(Integer, nullable=False, default=1)
    category = Column(String(50), nullable=False, default="cleansing")   # cleansing, exfoliation, treatment, moisturizing, sun_protection, night_care
    category_icon = Column(String(20), nullable=False, default="🧼")
    step_title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    active_ingredients = Column(String(500), nullable=True, default="")
    frequency = Column(String(100), nullable=False, default="Daily")     # Daily, 2x/week, Nightly, etc.
    caution_notes = Column(String(500), nullable=True, default="")
    is_active = Column(Boolean, nullable=False, default=True)
    is_customized = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    routine = relationship("SkincareRoutine", back_populates="steps")


class SeasonalRecommendation(Base):
    __tablename__ = "seasonal_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    routine_id = Column(Integer, ForeignKey("skincare_routines.id", ondelete="CASCADE"), nullable=False, index=True)
    season = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    tip = Column(String(500), nullable=True, default="")

    routine = relationship("SkincareRoutine", back_populates="seasonal_recommendations")


class RoutineCheckin(Base):
    __tablename__ = "routine_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    checkin_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    morning_completed = Column(Boolean, nullable=False, default=False)
    evening_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref=backref("routine_checkins", cascade="all, delete-orphan"))