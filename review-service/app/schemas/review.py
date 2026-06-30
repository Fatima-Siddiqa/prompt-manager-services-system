from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime


class ReviewCreate(BaseModel):
    target_type: Literal["prompt", "chat"]
    prompt_id: Optional[str] = None
    chat_id: Optional[str] = None
    reviewer_name: str
    score: int = Field(..., ge=1, le=5)
    feedback: str

    @field_validator("chat_id")
    @classmethod
    def validate_target_ids(cls, v, info):
        target_type = info.data.get("target_type")
        prompt_id = info.data.get("prompt_id")
        if target_type == "chat" and not v:
            raise ValueError("chat_id is required when target_type is 'chat'")
        if target_type == "prompt" and not prompt_id:
            raise ValueError("prompt_id is required when target_type is 'prompt'")
        return v


class ReviewResponse(BaseModel):
    id: str
    target_type: str
    prompt_id: Optional[str] = None
    chat_id: Optional[str] = None
    snapshot: str
    reviewer_name: str
    score: int
    feedback: str
    reviewed_at: datetime