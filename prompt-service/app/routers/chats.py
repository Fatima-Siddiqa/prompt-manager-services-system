from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
import asyncio

from app.database import get_db, SessionLocal
from app.schemas.chat import ExecuteRequest, FollowUpRequest, SummarizeResponse
from app.services import prompt_service, chat_service, job_service
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


async def run_execute_job(job_id: str, prompt_id: str, model: str, http_client):
    db = SessionLocal()
    try:
        prompt = prompt_service.get_prompt_by_id(db, prompt_id)
        if not prompt:
            job_service.mark_failed(db, job_id, "Prompt not found")
            return

        chat = chat_service.create_chat(db, prompt_id, prompt.name)
        chat_service.add_message(db, chat.id, "user", prompt.content)

        messages = [{"role": "user", "content": prompt.content}]
        result = await llm_client.generate(http_client, messages, model)

        usage = result["usage"]
        chat_service.add_message(
            db, chat.id, "assistant", result["content"],
            usage["prompt_tokens"], usage["completion_tokens"], usage["total_tokens"]
        )
        chat = chat_service.update_chat_tokens(db, chat, usage["total_tokens"])
        all_messages = chat_service.get_messages(db, chat.id)

        job_service.mark_done(db, job_id, chat_to_dict(chat, all_messages))
    except Exception as e:
        job_service.mark_failed(db, job_id, str(e))
    finally:
        db.close()


async def run_follow_up_job(job_id: str, chat_id: str, content: str, model: str, http_client):
    db = SessionLocal()
    try:
        chat = chat_service.get_chat(db, chat_id)
        if not chat:
            job_service.mark_failed(db, job_id, "Chat not found")
            return

        chat_service.add_message(db, chat_id, "user", content)

        all_messages = chat_service.get_messages(db, chat_id)
        messages_payload = [{"role": m.role, "content": m.content} for m in all_messages]

        result = await llm_client.generate(http_client, messages_payload, model)

        usage = result["usage"]
        chat_service.add_message(
            db, chat_id, "assistant", result["content"],
            usage["prompt_tokens"], usage["completion_tokens"], usage["total_tokens"]
        )
        chat = chat_service.update_chat_tokens(db, chat, usage["total_tokens"])
        all_messages = chat_service.get_messages(db, chat_id)

        job_service.mark_done(db, job_id, chat_to_dict(chat, all_messages))
    except Exception as e:
        job_service.mark_failed(db, job_id, str(e))
    finally:
        db.close()


@router.post("/prompts/{prompt_id}/execute")
async def execute_prompt(prompt_id: str, body: ExecuteRequest, background_tasks: BackgroundTasks, request: Request, db: Session = Depends(get_db)):
    prompt = await asyncio.to_thread(prompt_service.get_prompt_by_id, db, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    job = await asyncio.to_thread(job_service.create_job, db)

    http_client = request.app.state.http_client
    background_tasks.add_task(run_execute_job, job.id, prompt_id, body.model, http_client)

    return {"job_id": job.id, "status": "pending"}


@router.post("/chats/{chat_id}/messages")
async def follow_up(chat_id: str, body: FollowUpRequest, background_tasks: BackgroundTasks, request: Request, db: Session = Depends(get_db)):
    chat = await asyncio.to_thread(chat_service.get_chat, db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    job = await asyncio.to_thread(job_service.create_job, db, chat_id)

    http_client = request.app.state.http_client
    background_tasks.add_task(run_follow_up_job, job.id, chat_id, body.content, body.model, http_client)

    return {"job_id": job.id, "status": "pending"}


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = await asyncio.to_thread(job_service.get_job, db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": job.id,
        "status": job.status,
        "result": job.result,
        "error": job.error,
    }


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