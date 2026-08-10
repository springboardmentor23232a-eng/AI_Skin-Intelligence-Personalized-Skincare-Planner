import uuid

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    assessment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("skin_assessments.id", ondelete="CASCADE"),
        nullable=False,
    )

    risk_name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    risk_level = Column(String, nullable=True)

    assessment = relationship(
        "SkinAssessment",
        back_populates="risk_factors",
    )