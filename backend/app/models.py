from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
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
    water_glasses = Column(Float, nullable=True)
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