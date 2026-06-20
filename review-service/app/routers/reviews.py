from fastapi import APIRouter
from typing import Optional, List
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services import review_service

router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(payload: ReviewCreate):
    return review_service.create_review(payload)

@router.get("/", response_model=List[ReviewResponse])
def list_reviews(prompt_id: Optional[str] = None):
    reviews = review_service.load_all_reviews()
    if prompt_id:
        reviews = [r for r in reviews if r["prompt_id"] == prompt_id]
    return reviews