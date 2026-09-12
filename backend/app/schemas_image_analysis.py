from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, Optional

class ImageAnalysisResponse(BaseModel):
    id: int
    user_id: int
    original_filename: str
    stored_filename: str
    upload_source: str
    upload_time: datetime
    prediction: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    processing_time: Optional[float] = None
    status: str
    image_url: str

    class Config:
        from_attributes = True
