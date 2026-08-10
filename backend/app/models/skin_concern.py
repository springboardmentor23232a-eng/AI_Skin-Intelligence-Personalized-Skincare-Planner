import uuid

from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class SkinConcern(Base):
    __tablename__ = "skin_concerns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    assessment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("skin_assessments.id", ondelete="CASCADE"),
        nullable=False,
    )

    concern_name = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    priority = Column(Integer, nullable=False)

    assessment = relationship(
        "SkinAssessment",
        back_populates="concerns",
    )