import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProgressLogCreate(BaseModel):
    routine_followed_morning: bool = False
    routine_followed_evening: bool = False
    skin_condition_note: str = ""
    photo_url: Optional[str] = None


class ProgressLogOut(ProgressLogCreate):
    id: uuid.UUID
    user_id: uuid.UUID
    log_date: datetime
    skin_health_score: Optional[float]

    class Config:
        from_attributes = True
