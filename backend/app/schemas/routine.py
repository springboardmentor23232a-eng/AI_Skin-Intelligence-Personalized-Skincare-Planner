import uuid
from datetime import datetime
from typing import List, Dict, Any

from pydantic import BaseModel


class RoutineOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    morning_routine: List[Dict[str, Any]]
    evening_routine: List[Dict[str, Any]]
    weekly_treatments: List[Dict[str, Any]]
    season: str
    notes: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
