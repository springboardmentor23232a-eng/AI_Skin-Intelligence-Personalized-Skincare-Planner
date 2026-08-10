import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class SkinAssessment(Base):
    __tablename__ = "skin_assessments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    condition_score = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    concerns = relationship(
        "SkinConcern",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )

    risk_factors = relationship(
        "RiskFactor",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )