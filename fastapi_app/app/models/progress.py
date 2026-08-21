from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SkinProgressLog(Base):
    __tablename__ = "skin_progress_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    log_date = Column(Date, default=date.today, index=True)
    skin_score = Column(Integer, nullable=False)
    moisture_level = Column(Integer, nullable=False)
    acne_severity = Column(String(30), default="Low")
    redness_level = Column(String(30), default="Low")
    routine_completed = Column(Boolean, default=True)
    photo_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="progress_logs")
