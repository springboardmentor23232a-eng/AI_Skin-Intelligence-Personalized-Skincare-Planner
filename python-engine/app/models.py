from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
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
