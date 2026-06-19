from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PromptCreate(BaseModel):
    name: str
    description: Optional[str] = None
    content: str
    tags: Optional[str] = None
    model_target: Optional[str] = None