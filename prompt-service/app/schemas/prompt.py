from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PromptCreate(BaseModel):
    name: str
    description: Optional[str] = None
    content: str
    tags: Optional[str] = None
    model_target: Optional[str] = None

class PromptUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None
    model_target: Optional[str] = None