import os
import json
from app.core.config import settings
import uuid
import httpx
from fastapi import HTTPException
from app.schemas.review import ReviewCreate
from app.utils.time import utcnow


def save_review(review: dict) -> None:
    os.makedirs(settings.REVIEWS_DIR, exist_ok=True)
    path = os.path.join(settings.REVIEWS_DIR, f"{review['id']}.json")
    with open(path, "w") as f:
        json.dump(review, f, default=str)


def load_review(review_id: str) -> dict | None:
    path = os.path.join(settings.REVIEWS_DIR, f"{review_id}.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def load_all_reviews() -> list[dict]:
    os.makedirs(settings.REVIEWS_DIR, exist_ok=True)
    reviews = []
    for filename in os.listdir(settings.REVIEWS_DIR):
        if filename.endswith(".json"):
            with open(os.path.join(settings.REVIEWS_DIR, filename)) as f:
                reviews.append(json.load(f))
    return reviews


async def fetch_prompt(client: httpx.AsyncClient, prompt_id: str) -> dict:
    try:
        response = await client.get(f"{settings.PROMPT_SERVICE_URL}/prompts/{prompt_id}")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="prompt-service is unreachable")
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="prompt-service timed out")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="prompt-service is unreachable")

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Prompt not found in prompt-service")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Unexpected error from prompt-service")

    return response.json()


async def fetch_chat(client: httpx.AsyncClient, chat_id: str) -> dict:
    try:
        response = await client.get(f"{settings.PROMPT_SERVICE_URL}/chats/{chat_id}")
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="prompt-service is unreachable")
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="prompt-service timed out")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="prompt-service is unreachable")

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Chat not found in prompt-service")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Unexpected error from prompt-service")

    return response.json()


async def create_review(payload: ReviewCreate, client: httpx.AsyncClient) -> dict:
    if payload.target_type == "prompt":
        prompt_data = await fetch_prompt(client, payload.prompt_id)
        snapshot = prompt_data["content"]
    else:
        chat_data = await fetch_chat(client, payload.chat_id)
        snapshot = json.dumps(chat_data["messages"], default=str)

    review = {
        "id": str(uuid.uuid4()),
        "target_type": payload.target_type,
        "prompt_id": payload.prompt_id,
        "chat_id": payload.chat_id,
        "snapshot": snapshot,
        "reviewer_name": payload.reviewer_name,
        "score": payload.score,
        "feedback": payload.feedback,
        "reviewed_at": utcnow().isoformat(),
    }

    save_review(review)
    return review


def get_summary(prompt_id: str) -> dict:
    reviews = [r for r in load_all_reviews() if r.get("prompt_id") == prompt_id]
    if not reviews:
        raise HTTPException(status_code=404, detail="No reviews found for this prompt")
    avg = round(sum(r["score"] for r in reviews) / len(reviews), 2)
    return {
        "prompt_id": prompt_id,
        "total_reviews": len(reviews),
        "average_score": avg,
        "feedback": [r["feedback"] for r in reviews],
    }


def get_chat_summary(chat_id: str) -> dict:
    reviews = [r for r in load_all_reviews() if r.get("chat_id") == chat_id]
    if not reviews:
        raise HTTPException(status_code=404, detail="No reviews found for this chat")
    avg = round(sum(r["score"] for r in reviews) / len(reviews), 2)
    return {
        "chat_id": chat_id,
        "total_reviews": len(reviews),
        "average_score": avg,
        "feedback": [r["feedback"] for r in reviews],
    }


def delete_review(review_id: str) -> bool:
    path = os.path.join(settings.REVIEWS_DIR, f"{review_id}.json")
    if not os.path.exists(path):
        return False
    os.remove(path)
    return True