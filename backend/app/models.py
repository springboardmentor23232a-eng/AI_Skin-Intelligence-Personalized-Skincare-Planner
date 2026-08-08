from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, func
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
