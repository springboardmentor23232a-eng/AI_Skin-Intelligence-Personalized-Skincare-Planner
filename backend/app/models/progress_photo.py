import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ProgressPhoto(Base):
    __tablename__ = "progress_photos"

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

    assessment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("skin_assessments.id"),
        nullable=True,
    )

    photo_url = Column(
        String,
        nullable=False,
    )

    photo_type = Column(
        String,
        nullable=False,
        default="current",
    )

    skin_health_score = Column(
        Float,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )