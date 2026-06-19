import uuid
from sqlalchemy.orm import Session
from app.models.prompt import Prompt
from app.schemas.prompt import PromptCreate
from app.utils.time import utcnow
from typing import Optional, List
from app.schemas.prompt import PromptUpdate

def create_prompt(db: Session, payload: PromptCreate) -> Prompt:
    prompt = Prompt(
        id=str(uuid.uuid4()),
        name=payload.name,
        description=payload.description,
        content=payload.content,
        tags=payload.tags,
        model_target=payload.model_target,
        created_at=utcnow(),
        updated_at=utcnow(),
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt

def get_all_prompts(
    db: Session,
    tag: Optional[str] = None,
    limit: int = 100
) -> List[Prompt]:
    query = db.query(Prompt)
    if tag:
        query = query.filter(Prompt.tags.contains(tag))
    return query.limit(limit).all()

def get_prompt_by_id(db: Session, prompt_id: str) -> Optional[Prompt]:
    return db.query(Prompt).filter(Prompt.id == prompt_id).first()

def update_prompt(db: Session, prompt_id: str, payload: PromptUpdate) -> Optional[Prompt]:
    prompt = get_prompt_by_id(db, prompt_id)
    if not prompt:
        return None
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prompt, field, value)
    prompt.updated_at = utcnow()
    db.commit()
    db.refresh(prompt)
    return prompt

def delete_prompt(db: Session, prompt_id: str) -> bool:
    prompt = get_prompt_by_id(db, prompt_id)
    if not prompt:
        return False
    db.delete(prompt)
    db.commit()
    return True