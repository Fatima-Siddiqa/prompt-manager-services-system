from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    prompt_id: str
    reviewer_name: str
    score: int = Field(..., ge=1, le=5)
    feedback: str

class ReviewResponse(BaseModel):
    id: str
    prompt_id: str
    prompt_snapshot: str
    reviewer_name: str
    score: int
    feedback: str
    reviewed_at: datetime