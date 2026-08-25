import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    # Nullable because an appointment belongs to
    # EITHER a dermatologist OR a consultant.
    dermatologist_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=True,
    )

    consultant_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=True,
    )

    appointment_date = Column(
        DateTime,
        nullable=False,
    )

    consultation_type = Column(
        String,
        nullable=False,
    )

    reason = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="pending",
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    patient = relationship(
        "User",
        foreign_keys=[patient_id],
    )

    dermatologist = relationship(
        "User",
        foreign_keys=[dermatologist_id],
    )

    consultant = relationship(
        "User",
        foreign_keys=[consultant_id],
    )