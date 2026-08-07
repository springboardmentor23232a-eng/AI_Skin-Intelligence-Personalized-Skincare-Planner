from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from .database import Base


class SkinAssessment(Base):
    __tablename__ = "skin_assessment"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    assessment_date = Column(DateTime, default=datetime.utcnow)
    skin_health_score = Column(Integer)
    overall_condition = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class SkinConcern(Base):
    __tablename__ = "skin_concern"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer)
    concern_name = Column(String)
    severity = Column(String)
    priority = Column(String)


class RiskFactor(Base):
    __tablename__ = "risk_factor"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer)
    risk_name = Column(String)
    description = Column(Text)
    risk_level = Column(String)


# ==========================
# User Model
# ==========================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="USER")
    provider = Column(String, default="LOCAL")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )