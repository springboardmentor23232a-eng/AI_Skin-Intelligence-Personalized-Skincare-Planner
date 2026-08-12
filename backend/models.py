from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=True) # nullable for oauth
    role = Column(String(50), default="User")
    status = Column(String(50), default="Active")
    skin_type = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assessments = relationship("SkinAssessment", back_populates="user", cascade="all, delete-orphan")

class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assessment_date = Column(DateTime(timezone=True), server_default=func.now())
    skin_health_score = Column(Float, nullable=False)
    image_url = Column(String(255), nullable=True)
    overall_condition = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="assessments")
    concerns = relationship("SkinConcern", back_populates="assessment", cascade="all, delete-orphan")
    risk_factors = relationship("RiskFactor", back_populates="assessment", cascade="all, delete-orphan")

class SkinConcern(Base):
    __tablename__ = "skin_concerns"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=False)
    concern_name = Column(String(150), nullable=False)
    severity = Column(String(50), nullable=True) # e.g., Mild, Moderate, Severe
    priority = Column(Integer, default=1) # Lower number means higher priority

    assessment = relationship("SkinAssessment", back_populates="concerns")

class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("skin_assessments.id", ondelete="CASCADE"), nullable=False)
    risk_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    risk_level = Column(String(50), nullable=True) # e.g., Low, Medium, High

    assessment = relationship("SkinAssessment", back_populates="risk_factors")
