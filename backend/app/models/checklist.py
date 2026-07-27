import uuid
from datetime import date

from sqlalchemy import Column, String, Date, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ChecklistEntry(Base):
    __tablename__ = "checklist_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    log_date = Column(Date, default=date.today, nullable=False)
    step_key = Column(String, nullable=False)   # e.g. "morning-1", "evening-3"
    completed = Column(Boolean, default=False)