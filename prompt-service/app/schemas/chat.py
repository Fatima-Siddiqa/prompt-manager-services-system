from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageOut(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatOut(BaseModel):
    id: str
    prompt_id: str
    title: str
    total_tokens: int
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: list[MessageOut] = []

    class Config:
        from_attributes = True


class ExecuteRequest(BaseModel):
    model: Optional[str] = None


class FollowUpRequest(BaseModel):
    content: str
    model: Optional[str] = None


class SummarizeResponse(BaseModel):
    chat_id: str
    summary: str