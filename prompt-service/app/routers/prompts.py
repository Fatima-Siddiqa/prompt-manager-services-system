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