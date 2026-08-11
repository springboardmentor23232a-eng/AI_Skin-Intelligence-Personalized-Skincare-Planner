from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PersonalizedRoutine(Base):
    __tablename__ = "personalized_routines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    time_of_day = Column(String(30), nullable=False, index=True)  # MORNING, EVENING, WEEKLY, SEASONAL
    step_number = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)  # CLEANSER, EXFOLIATION, TREATMENT, MOISTURIZER, SUN_PROTECTION, NIGHT_CARE, MASK, SEASONAL_CARE
    step_name = Column(String(150), nullable=False)
    instructions = Column(Text, nullable=False)
    recommended_ingredient = Column(String(100), nullable=True)
    season = Column(String(30), default="ALL_SEASONS")  # ALL_SEASONS, SUMMER, WINTER, SPRING, AUTUMN
    created_by_role = Column(String(30), default="SYSTEM_AI")  # PATIENT, DOCTOR, CONSULTANT, SYSTEM_AI
    doctor_notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="routines")
