from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SkinHealthScoreRecord(Base):
    __tablename__ = "skin_health_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score_date = Column(DateTime, default=datetime.utcnow)
    overall_score = Column(Integer, nullable=False)
    skin_condition_score = Column(Integer, nullable=False)
    lifestyle_score = Column(Integer, nullable=False)
    sleep_score = Column(Integer, nullable=False)
    routine_consistency_score = Column(Integer, nullable=False)
    hydration_score = Column(Integer, nullable=False)
    score_rating = Column(String(50), nullable=False)
    improvement_delta = Column(Integer, default=0)
    improvement_pct = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="skin_health_scores")
