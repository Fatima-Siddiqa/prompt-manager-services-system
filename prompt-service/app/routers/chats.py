from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import asyncio

from app.database import get_db
from app.schemas.chat import ChatOut, ExecuteRequest, FollowUpRequest, SummarizeResponse
from app.services import prompt_service, chat_service
from app.services import llm_client

router = APIRouter()


def chat_to_dict(chat, messages):
    return {
        "id": chat.id,
        "prompt_id": chat.prompt_id,
        "title": chat.title,
        "total_tokens": chat.total_tokens,
        "summary": chat.summary,
        "created_at": chat.created_at,
        "updated_at": chat.updated_at,
        "messages": [
            {
                "id": m.id,
                "chat_id": m.chat_id,
                "role": m.role,
                "content": m.content,
                "prompt_tokens": m.prompt_tokens,
                "completion_tokens": m.completion_tokens,
                "total_tokens": m.total_tokens,
                "created_at": m.created_at,
            }
            for m in messages
        ],
    }


@router.post("/prompts/{prompt_id}/execute")
async def execute_prompt(prompt_id: str, body: ExecuteRequest, request: Request, db: Session = Depends(get_db)):
    prompt = await asyncio.to_thread(prompt_service.get_prompt, db, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    chat = await asyncio.to_thread(chat_service.create_chat, db, prompt_id, prompt.name)

    await asyncio.to_thread(
        chat_service.add_message, db, chat.id, "user", prompt.content
    )

    messages = [{"role": "user", "content": prompt.content}]
    client = request.app.state.http_client
    result = await llm_client.generate(client, messages, body.model)

    usage = result["usage"]
    await asyncio.to_thread(
        chat_service.add_message, db, chat.id, "assistant", result["content"],
        usage["prompt_tokens"], usage["completion_tokens"], usage["total_tokens"]
    )

    chat = await asyncio.to_thread(chat_service.update_chat_tokens, db, chat, usage["total_tokens"])
    messages = await asyncio.to_thread(chat_service.get_messages, db, chat.id)

    return chat_to_dict(chat, messages)


@router.post("/chats/{chat_id}/messages")
async def follow_up(chat_id: str, body: FollowUpRequest, request: Request, db: Session = Depends(get_db)):
    chat = await asyncio.to_thread(chat_service.get_chat, db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    await asyncio.to_thread(chat_service.add_message, db, chat_id, "user", body.content)

    all_messages = await asyncio.to_thread(chat_service.get_messages, db, chat_id)
    messages_payload = [{"role": m.role, "content": m.content} for m in all_messages]

    client = request.app.state.http_client
    result = await llm_client.generate(client, messages_payload, body.model)

    usage = result["usage"]
    await asyncio.to_thread(
        chat_service.add_message, db, chat_id, "assistant", result["content"],
        usage["prompt_tokens"], usage["completion_tokens"], usage["total_tokens"]
    )

    chat = await asyncio.to_thread(chat_service.update_chat_tokens, db, chat, usage["total_tokens"])
    all_messages = await asyncio.to_thread(chat_service.get_messages, db, chat_id)

    return chat_to_dict(chat, all_messages)


@router.get("/chats")
async def list_chats(prompt_id: str = None, db: Session = Depends(get_db)):
    chats = await asyncio.to_thread(chat_service.list_chats, db, prompt_id)
    return chats


@router.get("/chats/{chat_id}")
async def get_chat(chat_id: str, db: Session = Depends(get_db)):
    chat = await asyncio.to_thread(chat_service.get_chat, db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = await asyncio.to_thread(chat_service.get_messages, db, chat_id)
    return chat_to_dict(chat, messages)


@router.post("/chats/{chat_id}/summary")
async def summarize_chat(chat_id: str, request: Request, db: Session = Depends(get_db)):
    chat = await asyncio.to_thread(chat_service.get_chat, db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = await asyncio.to_thread(chat_service.get_messages, db, chat_id)
    if not messages:
        raise HTTPException(status_code=400, detail="Chat has no messages to summarize")

    messages_payload = [{"role": m.role, "content": m.content} for m in messages]
    client = request.app.state.http_client
    summary = await llm_client.summarize(client, messages_payload)

    chat = await asyncio.to_thread(chat_service.update_chat_summary, db, chat, summary)

    return SummarizeResponse(chat_id=chat_id, summary=summary)


@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: str, db: Session = Depends(get_db)):
    chat = await asyncio.to_thread(chat_service.get_chat, db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    await asyncio.to_thread(chat_service.delete_chat, db, chat)
    return {"message": "Chat deleted successfully"}