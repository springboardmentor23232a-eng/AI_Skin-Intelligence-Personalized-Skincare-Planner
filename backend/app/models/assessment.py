import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Float, ForeignKey, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    identified_concerns = Column(ARRAY(String), default=list)
    concern_severity = Column(JSON, default=dict)     # {"acne": "moderate", ...}
    prioritized_concerns = Column(ARRAY(String), default=list)
    risk_factors = Column(ARRAY(String), default=list)
    condition_score = Column(Float)      # 0-100, higher = healthier

    created_at = Column(DateTime, default=datetime.utcnow)
