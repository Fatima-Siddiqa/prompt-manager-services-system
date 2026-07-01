import uuid
from sqlalchemy.orm import Session
from app.models.chat import Chat, Message
from app.utils.time import utcnow


def create_chat(db: Session, prompt_id: str, title: str) -> Chat:
    chat = Chat(
        id=str(uuid.uuid4()),
        prompt_id=prompt_id,
        title=title,
        total_tokens=0,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


def get_chat(db: Session, chat_id: str) -> Chat | None:
    return db.query(Chat).filter(Chat.id == chat_id).first()


def list_chats(db: Session, prompt_id: str = None) -> list[Chat]:
    query = db.query(Chat)
    if prompt_id:
        query = query.filter(Chat.prompt_id == prompt_id)
    return query.order_by(Chat.updated_at.desc()).all()


def get_messages(db: Session, chat_id: str) -> list[Message]:
    return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()


def add_message(db: Session, chat_id: str, role: str, content: str,
                prompt_tokens: int = 0, completion_tokens: int = 0, total_tokens: int = 0) -> Message:
    message = Message(
        id=str(uuid.uuid4()),
        chat_id=chat_id,
        role=role,
        content=content,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def update_chat_tokens(db: Session, chat: Chat, additional_tokens: int) -> Chat:
    chat.total_tokens += additional_tokens
    chat.updated_at = utcnow()
    db.commit()
    db.refresh(chat)
    return chat


def update_chat_summary(db: Session, chat: Chat, summary: str) -> Chat:
    chat.summary = summary
    chat.updated_at = utcnow()
    db.commit()
    db.refresh(chat)
    return chat


def delete_chat(db: Session, chat: Chat) -> None:
    db.query(Message).filter(Message.chat_id == chat.id).delete()
    db.delete(chat)
    db.commit()