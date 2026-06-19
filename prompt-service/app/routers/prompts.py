from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.schemas.prompt import PromptCreate, PromptUpdate, PromptResponse
from app.services import prompt_service

router = APIRouter()


@router.post("/", response_model=PromptResponse, status_code=201)
def create_prompt(payload: PromptCreate, db: Session = Depends(get_db)):
    return prompt_service.create_prompt(db, payload)

@router.get("/", response_model=List[PromptResponse])
def list_prompts(
    tag: Optional[str] = None,
    limit: Optional[int] = 100,
    db: Session = Depends(get_db),
):
    return prompt_service.get_all_prompts(db, tag=tag, limit=limit)

@router.get("/{prompt_id}", response_model=PromptResponse)
def get_prompt(prompt_id: str, db: Session = Depends(get_db)):
    prompt = prompt_service.get_prompt_by_id(db, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt