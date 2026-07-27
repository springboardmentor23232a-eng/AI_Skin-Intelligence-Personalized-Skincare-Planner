import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    log_date = Column(DateTime, default=datetime.utcnow)
    routine_followed_morning = Column(Boolean, default=False)
    routine_followed_evening = Column(Boolean, default=False)
    skin_condition_note = Column(String, default="")
    photo_url = Column(String, nullable=True)

    skin_health_score = Column(Float, nullable=True)
