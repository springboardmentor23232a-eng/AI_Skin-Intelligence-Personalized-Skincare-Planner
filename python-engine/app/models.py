from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
import os

Base = declarative_base()

# Match the same development DB fallback used by app.database.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./skin_assessment.db")
if DATABASE_URL.startswith("postgresql"):
    DATABASE_URL = "sqlite:///./skin_assessment.db"

USE_SQLITE = DATABASE_URL.startswith("sqlite")

# Use String for UUID in SQLite, UUID for PostgreSQL
UUIDType = String(36) if USE_SQLITE else UUID(as_uuid=True)

def generate_uuid():
    return str(uuid.uuid4()) if USE_SQLITE else uuid.uuid4()

class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(UUIDType, nullable=False)
    assessment_date = Column(DateTime, default=datetime.utcnow)
    skin_health_score = Column(Integer, nullable=False)
    overall_condition = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Store JSON data as JSONB (PostgreSQL) or JSON (SQLite)
    concerns = Column(JSON, nullable=True)
    risk_factors = Column(JSON, nullable=True)

class SkinConcern(Base):
    __tablename__ = "skin_concerns"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    assessment_id = Column(UUIDType, ForeignKey("skin_assessments.id"), nullable=False)
    concern_name = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)
    priority = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    assessment_id = Column(UUIDType, ForeignKey("skin_assessments.id"), nullable=False)
    risk_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    risk_level = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SkincareRoutine(Base):
    __tablename__ = "skincare_routines"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(UUIDType, nullable=False)
    assessment_id = Column(UUIDType, ForeignKey("skin_assessments.id"), nullable=True)
    routine_name = Column(String(100), nullable=False)
    routine_type = Column(String(20), nullable=False)  # morning, evening, weekly, seasonal
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Store JSON data for routine details
    routine_steps = Column(JSON, nullable=True)
    personalized_factors = Column(JSON, nullable=True)
    products = Column(JSON, nullable=True)

class RoutineStep(Base):
    __tablename__ = "routine_steps"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    routine_id = Column(UUIDType, ForeignKey("skincare_routines.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)  # cleansing, exfoliation, treatment, moisturizing, sun_protection, night_care
    step_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    product_recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Ingredient Intelligence Models
class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    name = Column(String(100), nullable=False, unique=True)
    category = Column(String(50), nullable=False)  # retinoids, niacinamide, vitamin_c, hyaluronic_acid, salicylic_acid, ceramides, peptides, ahas_bhas
    description = Column(Text, nullable=True)
    benefits = Column(JSON, nullable=True)  # List of benefits
    concerns = Column(JSON, nullable=True)  # List of potential concerns
    suitable_skin_types = Column(JSON, nullable=True)  # List of suitable skin types
    concentration_range = Column(String(50), nullable=True)  # Recommended concentration range
    interactions = Column(JSON, nullable=True)  # List of ingredient interactions
    common_allergens = Column(JSON, nullable=True)  # List of common allergen concerns
    educational_info = Column(JSON, nullable=True)  # Educational content
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    name = Column(String(200), nullable=False)
    brand = Column(String(100), nullable=True)
    category = Column(String(50), nullable=False)  # face_wash, moisturizer, sunscreen, serum, toner
    product_type = Column(String(50), nullable=True)  # luxury, budget, drugstore, premium
    price = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")
    ingredients = Column(JSON, nullable=True)  # List of ingredient IDs
    key_ingredients = Column(JSON, nullable=True)  # List of key ingredient names
    suitable_skin_types = Column(JSON, nullable=True)  # List of suitable skin types
    target_concerns = Column(JSON, nullable=True)  # List of target concerns
    benefits = Column(JSON, nullable=True)  # List of product benefits
    warnings = Column(JSON, nullable=True)  # List of warnings
    usage_instructions = Column(Text, nullable=True)
    rating = Column(Float, nullable=True)  # Average user rating
    reviews_count = Column(Integer, default=0)
    availability = Column(String(20), default="available")  # available, limited, discontinued
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ProductRecommendation(Base):
    __tablename__ = "product_recommendations"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(UUIDType, nullable=False)
    assessment_id = Column(UUIDType, ForeignKey("skin_assessments.id"), nullable=True)
    product_id = Column(UUIDType, ForeignKey("products.id"), nullable=False)
    suitability_score = Column(Float, nullable=False)  # 0-100 score
    recommendation_reason = Column(Text, nullable=True)
    priority = Column(String(20), default="medium")  # high, medium, low
    category = Column(String(50), nullable=False)  # face_wash, moisturizer, etc.
    budget_category = Column(String(20), nullable=True)  # budget, mid_range, luxury
    is_alternative = Column(Boolean, default=False)  # Whether this is an alternative recommendation
    alternative_for = Column(UUIDType, ForeignKey("products.id"), nullable=True)  # If alternative, which product it replaces
    created_at = Column(DateTime, default=datetime.utcnow)

# Progress Tracking Models
class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(UUIDType, nullable=False, index=True)
    assessment_id = Column(UUIDType, ForeignKey("skin_assessments.id"), nullable=False)
    baseline_score = Column(Integer, nullable=False)  # Initial skin health score
    current_score = Column(Integer, nullable=False)  # Current skin health score
    score_change = Column(Integer, nullable=False)  # Change from baseline
    improvement_percentage = Column(Float, nullable=True)  # Percentage improvement
    goals_achieved = Column(JSON, nullable=True)  # List of achieved goals
    ongoing_concerns = Column(JSON, nullable=True)  # List of ongoing concerns
    resolved_concerns = Column(JSON, nullable=True)  # List of resolved concerns
    routine_adherence = Column(Float, nullable=True)  # Adherence percentage
    milestones = Column(JSON, nullable=True)  # List of milestones achieved
    notes = Column(Text, nullable=True)
    progress_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProgressMilestone(Base):
    __tablename__ = "progress_milestones"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(UUIDType, nullable=False)
    progress_id = Column(UUIDType, ForeignKey("user_progress.id"), nullable=False)
    milestone_type = Column(String(50), nullable=False)  # score_improvement, concern_resolved, goal_achieved, etc.
    milestone_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    achieved_date = Column(DateTime, default=datetime.utcnow)
    metadata_ = Column("metadata", JSON, nullable=True)  # Additional milestone data
    created_at = Column(DateTime, default=datetime.utcnow)

# Analytics Models
class SkinAnalytics(Base):
    __tablename__ = "skin_analytics"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(UUIDType, nullable=False, index=True)
    assessment_id = Column(UUIDType, ForeignKey("skin_assessments.id"), nullable=True)
    time_period = Column(String(20), nullable=False)  # daily, weekly, monthly, yearly
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Score analytics
    average_score = Column(Float, nullable=True)
    score_trend = Column(String(20), nullable=True)  # improving, stable, declining
    highest_score = Column(Integer, nullable=True)
    lowest_score = Column(Integer, nullable=True)
    
    # Concern analytics
    concern_frequency = Column(JSON, nullable=True)  # Frequency of each concern
    resolved_concerns_count = Column(Integer, default=0)
    new_concerns_count = Column(Integer, default=0)
    
    # Routine analytics
    routine_changes_count = Column(Integer, default=0)
    routine_adherence_avg = Column(Float, nullable=True)
    
    # Product analytics
    products_used = Column(JSON, nullable=True)  # List of products used
    product_effectiveness = Column(JSON, nullable=True)  # Product effectiveness scores
    
    # Lifestyle analytics
    lifestyle_factors_impact = Column(JSON, nullable=True)  # Impact of lifestyle factors
    
    # Recommendations
    insights = Column(JSON, nullable=True)  # Generated insights
    recommendations = Column(JSON, nullable=True)  # Personalized recommendations
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserDashboard(Base):
    __tablename__ = "user_dashboards"

    id = Column(UUIDType, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(UUIDType, nullable=False, unique=True, index=True)
    
    # Dashboard configuration
    layout_config = Column(JSON, nullable=True)  # Dashboard layout preferences
    widget_settings = Column(JSON, nullable=True)  # Widget display settings
    
    # Quick stats
    current_skin_score = Column(Integer, nullable=True)
    score_change = Column(Integer, nullable=True)
    active_concerns_count = Column(Integer, default=0)
    routine_adherence = Column(Float, nullable=True)
    
    # Recent activity
    recent_assessments = Column(JSON, nullable=True)  # Recent assessment summaries
    recent_routines = Column(JSON, nullable=True)  # Recent routine updates
    
    # Goals and progress
    active_goals = Column(JSON, nullable=True)  # Active skincare goals
    goal_progress = Column(JSON, nullable=True)  # Progress towards goals
    
    # Notifications
    unread_notifications = Column(Integer, default=0)
    notification_preferences = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
