from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    prompt_id: str
    reviewer_name: str
    score: int = Field(..., ge=1, le=5)
    feedback: str