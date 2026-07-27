import uuid
from datetime import datetime
from typing import List, Dict, Optional

from pydantic import BaseModel


class AssessmentOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    identified_concerns: List[str]
    concern_severity: Dict[str, str]
    prioritized_concerns: List[str]
    risk_factors: List[str]
    condition_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True
