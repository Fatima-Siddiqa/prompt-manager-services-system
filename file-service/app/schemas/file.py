from pydantic import BaseModel
from typing import Optional


class FileResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    size_bytes: int
    upload_path: str


class FileTextResponse(BaseModel):
    id: str
    filename: str
    text: str
    char_count: int
    estimated_tokens: int
    truncated: bool
    truncated_at_chars: Optional[int] = None