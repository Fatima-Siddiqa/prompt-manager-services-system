import uuid
from sqlalchemy.orm import Session
from app.models.prompt import Prompt
from app.schemas.prompt import PromptCreate
from app.utils.time import utcnow


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