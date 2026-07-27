import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Float, Integer, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class SkinProfile(Base):
    __tablename__ = "skin_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    skin_type = Column(String)           # oily, dry, combination, normal, sensitive
    age_group = Column(String)           # teen, 20s, 30s, 40s, 50+
    skin_concerns = Column(ARRAY(String), default=list)   # acne, hyperpigmentation, wrinkles...
    allergies = Column(ARRAY(String), default=list)
    sensitivities = Column(ARRAY(String), default=list)

    sleep_quality = Column(String)       # poor, average, good
    sleep_hours = Column(Float, default=7.0)
    water_intake_liters = Column(Float, default=2.0)
    lifestyle_habits = Column(ARRAY(String), default=list)  # smoking, high-stress, outdoor-exposure...
    environmental_exposure = Column(String)  # low, moderate, high (sun/pollution)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="skin_profile")
