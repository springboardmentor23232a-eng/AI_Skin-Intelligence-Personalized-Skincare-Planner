from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    assessment_date = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    skin_type = Column(String(50), nullable=False, default="Combination") # Dry, Oily, Combination, Normal, Sensitive
    skin_health_score = Column(Float, nullable=False) # 0.0 to 100.0
    overall_condition = Column(String(100), nullable=False) # Optimal, Good, Moderate Concern, High Risk / Action Required
    
    # Quantitative Skin Parameters
    hydration_level = Column(Float, default=50.0) # 0 to 100
    oiliness_level = Column(Float, default=50.0) # 0 to 100
    sensitivity_level = Column(Float, default=20.0) # 0 to 100
    acne_severity = Column(Float, default=10.0) # 0 to 100
    pigmentation_score = Column(Float, default=15.0) # 0 to 100
    wrinkles_score = Column(Float, default=10.0) # 0 to 100
    
    # Lifestyle & Environment Factors
    sun_exposure_hours = Column(Float, default=2.0)
    spf_frequency = Column(String(50), default="Daily") # Never, Occasional, Daily, Reapplied
    sleep_hours = Column(Float, default=7.5)
    stress_level = Column(Integer, default=4) # 1 to 10 scale
    
    # Advanced Clinical Criteria (NEW)
    climate_environment = Column(String(100), default="Temperate & Balanced")
    water_intake_liters = Column(Float, default=2.0)
    exfoliation_frequency = Column(String(100), default="1-2 Times/Week")
    fitzpatrick_phototype = Column(String(100), default="Type III (Medium)")
    makeup_usage = Column(String(100), default="Light Minimal Makeup")
    hormonal_phase = Column(String(100), default="Not Applicable / Balanced")
    primary_skin_goal = Column(String(150), default="Barrier Repair & Hydration")
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    concerns = relationship("SkinConcern", back_populates="assessment", cascade="all, delete-orphan")
    risk_factors = relationship("RiskFactor", back_populates="assessment", cascade="all, delete-orphan")
    routines = relationship("SkinRoutine", back_populates="assessment", cascade="all, delete-orphan")


class SkinConcern(Base):
    __tablename__ = "skin_concerns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    concern_name = Column(String(150), nullable=False)
    severity = Column(String(50), nullable=False) # Mild, Moderate, Severe, Critical
    priority = Column(Integer, nullable=False, index=True) # 1 = Highest Priority, 2, 3...
    category = Column(String(100), default="General") # Inflammatory, Moisture, Pigmentary, Structural
    description = Column(Text, nullable=True)
    
    # Clinical recommendations
    recommended_ingredients = Column(JSON, nullable=True)
    routine_advice = Column(Text, nullable=True)
    avoid_ingredients = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationship back to assessment
    assessment = relationship("SkinAssessment", back_populates="concerns")


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    risk_level = Column(String(50), nullable=False, index=True) # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Float, default=50.0)
    affected_areas = Column(String(255), default="Full Face")
    mitigation_tip = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationship back to assessment
    assessment = relationship("SkinAssessment", back_populates="risk_factors")


class SkinRoutine(Base):
    __tablename__ = "skin_routines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=True, index=True)
    season = Column(String(50), default="Summer")
    
    morning_routine = Column(JSON, nullable=False) # List of step objects
    evening_routine = Column(JSON, nullable=False) # List of step objects
    weekly_plan = Column(JSON, nullable=False)     # Weekly treatment schedule
    seasonal_tips = Column(JSON, nullable=False)   # Seasonal advice & product adaptations
    adaptive_notes = Column(JSON, nullable=True)   # Barrier alerts / adaptive updates
    
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationship back to assessment
    assessment = relationship("SkinAssessment", back_populates="routines")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    chemical_name = Column(String(200), nullable=True)
    category = Column(String(100), nullable=False, index=True) # Retinoids, Niacinamide, Vitamin C, Hyaluronic Acid, Salicylic Acid, Ceramides, Peptides, AHAs/BHAs
    description = Column(Text, nullable=False)
    primary_benefit = Column(Text, nullable=False)
    recommended_conc_range = Column(String(50), default="0.5% - 5%")
    comedogenicity_rating = Column(Integer, default=0) # 0 to 5
    irritant_rating = Column(Integer, default=0)       # 0 to 5
    target_skin_types = Column(JSON, default=list)
    suitable_concerns = Column(JSON, default=list)
    avoid_concerns = Column(JSON, default=list)
    usage_tips = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class IngredientInteraction(Base):
    __tablename__ = "ingredient_interactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ingredient_a = Column(String(150), nullable=False, index=True)
    ingredient_b = Column(String(150), nullable=False, index=True)
    interaction_type = Column(String(50), nullable=False) # Conflict, Synergy, Caution
    severity = Column(String(50), default="Moderate")     # Low, Moderate, High, Severe, Synergistic
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    brand = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False, index=True) # Face Wash, Moisturizer, Sunscreen, Serum, Toner, Treatment Products, Face Masks
    price = Column(Float, nullable=False)
    budget_tier = Column(String(50), nullable=False, index=True) # Budget, Mid-Range, Premium
    rating = Column(Float, default=4.5)
    key_active_ingredients = Column(JSON, nullable=False)
    full_ingredient_list = Column(JSON, nullable=False)
    target_concerns = Column(JSON, nullable=False)
    suitable_skin_types = Column(JSON, nullable=False)
    comedogenic_level = Column(Integer, default=0)
    image_url = Column(Text, nullable=True)
    buy_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class ProductRecommendation(Base):
    __tablename__ = "product_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    suitability_score = Column(Float, nullable=False) # 0 to 100
    recommendation_reason = Column(Text, nullable=True)
    match_tier = Column(String(50), default="High Match")
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class RoutineAdherenceLog(Base):
    __tablename__ = "routine_adherence_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    log_date = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    routine_type = Column(String(50), nullable=False) # Morning, Evening, Weekly
    steps_completed = Column(Integer, default=0)
    total_steps = Column(Integer, default=4)
    adherence_percentage = Column(Float, default=100.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


# ════════════════════════════════════════════════════════════════
# MODULE 8: PROGRESS TRACKING & ANALYTICS ORM MODELS
# ════════════════════════════════════════════════════════════════

class SkinProgressLog(Base):
    """
    Module 8: Historical progress checkpoint tracking quantitative biomarkers over time.
    """
    __tablename__ = "skin_progress_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="SET NULL"), nullable=True)
    log_date = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    checkpoint_title = Column(String(150), nullable=False, default="Routine Checkpoint") # e.g. "Baseline Day 1", "Week 2 Checkpoint"
    tag = Column(String(50), default="Milestone") # Baseline, Week 2, Week 4, Milestone, Current
    
    overall_skin_health_score = Column(Float, nullable=False) # 0 to 100
    hydration_level = Column(Float, default=50.0)             # 0 to 100
    oiliness_level = Column(Float, default=50.0)              # 0 to 100
    sensitivity_level = Column(Float, default=20.0)           # 0 to 100
    acne_severity = Column(Float, default=10.0)               # 0 to 100
    pigmentation_score = Column(Float, default=15.0)          # 0 to 100
    wrinkles_score = Column(Float, default=10.0)              # 0 to 100
    barrier_strength = Column(Float, default=65.0)            # 0 to 100
    redness_reactivity = Column(Float, default=20.0)          # 0 to 100
    
    photo_url = Column(Text, nullable=True)
    routine_adherence_rate = Column(Float, default=85.0)      # % during this period
    clinical_notes = Column(Text, nullable=True)
    key_improvements = Column(JSON, default=list)             # List of strings e.g. ["+12% Hydration", "-25% Acne"]
    active_concerns_snapshot = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class RoutineAdherenceRecord(Base):
    """
    Module 8: Detailed daily routine adherence logging with streaks & AM/PM fidelity.
    """
    __tablename__ = "routine_adherence_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    record_date = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    
    morning_completed = Column(Integer, default=0) # Steps completed in AM
    morning_total = Column(Integer, default=4)
    evening_completed = Column(Integer, default=0) # Steps completed in PM
    evening_total = Column(Integer, default=5)
    weekly_treatment_done = Column(Integer, default=0)
    
    overall_adherence_pct = Column(Float, default=100.0)
    current_streak_days = Column(Integer, default=1)
    water_intake_ml = Column(Integer, default=2000)
    sunscreen_reapplied = Column(Integer, default=1)
    missed_step_reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


class BeforeAfterComparison(Base):
    """
    Module 8: Linked comparison between any two progress checkpoints.
    """
    __tablename__ = "before_after_comparisons"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=False)
    baseline_log_id = Column(Integer, ForeignKey("skin_progress_logs.id", ondelete="CASCADE"), nullable=False)
    current_log_id = Column(Integer, ForeignKey("skin_progress_logs.id", ondelete="CASCADE"), nullable=False)
    
    days_elapsed = Column(Integer, default=30)
    score_delta = Column(Float, nullable=False) # e.g. +7.5
    verdict = Column(String(100), default="Significant Improvement")
    clinical_analysis = Column(Text, nullable=False)
    biomarker_deltas = Column(JSON, nullable=False) # Detailed map of metric changes
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)


