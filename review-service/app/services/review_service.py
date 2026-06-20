import os
import json
from app.core.config import settings

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