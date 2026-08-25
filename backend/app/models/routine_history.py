import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class RoutineHistory(Base):
    __tablename__ = "routine_history"

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

    morning_routine = Column(
        JSON,
        default=list,
    )

    evening_routine = Column(
        JSON,
        default=list,
    )

    weekly_treatments = Column(
        JSON,
        default=list,
    )

    season = Column(
        String,
        default="all",
    )

    notes = Column(
        String,
        default="",
    )

    condition_score = Column(
        Float,
        nullable=True,
    )

    change_summary = Column(
        String,
        default="Initial routine generated.",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )