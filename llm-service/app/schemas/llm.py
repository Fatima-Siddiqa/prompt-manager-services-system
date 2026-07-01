from pydantic import BaseModel
from typing import Literal, Optional

class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str

class GenerateRequest(BaseModel):
    messages: list[ChatMessage]
    model: Optional[str] = None
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

class TokenUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class GenerateResponse(BaseModel):
    content: str
    model: str
    usage: TokenUsage
    finish_reason: str

class SummarizeRequest(BaseModel):
    messages: list[ChatMessage]