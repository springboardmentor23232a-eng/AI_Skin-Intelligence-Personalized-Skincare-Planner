from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, UniqueConstraint
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
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", backref=backref("skin_profile", uselist=False, cascade="all, delete-orphan"))