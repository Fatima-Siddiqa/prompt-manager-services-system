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

def create_review(payload: ReviewCreate) -> dict:
    try:
        response = httpx.get(
            f"{settings.PROMPT_SERVICE_URL}/prompts/{payload.prompt_id}"
        )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="prompt-service is unreachable")

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Prompt not found in prompt-service")
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Unexpected error from prompt-service")

    prompt_data = response.json()

    review = {
        "id": str(uuid.uuid4()),
        "prompt_id": payload.prompt_id,
        "prompt_snapshot": prompt_data["content"],
        "reviewer_name": payload.reviewer_name,
        "score": payload.score,
        "feedback": payload.feedback,
        "reviewed_at": utcnow().isoformat(),
    }

    save_review(review)
    return review

def get_summary(prompt_id: str) -> dict:
    reviews = [r for r in load_all_reviews() if r["prompt_id"] == prompt_id]
    if not reviews:
        raise HTTPException(status_code=404, detail="No reviews found for this prompt")
    avg = round(sum(r["score"] for r in reviews) / len(reviews), 2)
    return {
        "prompt_id": prompt_id,
        "total_reviews": len(reviews),
        "average_score": avg,
        "feedback": [r["feedback"] for r in reviews],
    }