import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class SkincareRoutine(Base):
    __tablename__ = "skincare_routines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    morning_routine = Column(JSON, default=list)   # list of {step, category, product_suggestion}
    evening_routine = Column(JSON, default=list)
    weekly_treatments = Column(JSON, default=list)
    season = Column(String, default="all")
    notes = Column(String, default="")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
