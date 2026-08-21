from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=True)
    role = Column(String(30), default="USER")
    provider = Column(String(20), default="LOCAL")
    profile_picture = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assessments = relationship("SkinAssessment", back_populates="user", cascade="all, delete-orphan")
    routines = relationship("PersonalizedRoutine", back_populates="user", cascade="all, delete-orphan")
    progress_logs = relationship("SkinProgressLog", back_populates="user", cascade="all, delete-orphan")


class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_date = Column(DateTime, default=datetime.utcnow)
    skin_health_score = Column(Integer, nullable=False)
    overall_condition = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="assessments")
    concerns = relationship("SkinConcern", back_populates="assessment", cascade="all, delete-orphan")
    risks = relationship("RiskFactor", back_populates="assessment", cascade="all, delete-orphan")


class SkinConcern(Base):
    __tablename__ = "skin_concerns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    concern_name = Column(String(100), nullable=False)
    severity = Column(String(30), nullable=False)
    priority = Column(String(30), nullable=False)

    assessment = relationship("SkinAssessment", back_populates="concerns")


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    risk_level = Column(String(30), nullable=False)

    assessment = relationship("SkinAssessment", back_populates="risks")
