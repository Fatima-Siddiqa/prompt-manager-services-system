from fastapi import APIRouter, HTTPException, Request
from typing import Optional, List
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services import review_service

router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=201)
async def create_review(payload: ReviewCreate, request: Request):
    client = request.app.state.http_client
    return await review_service.create_review(payload, client)


@router.get("/", response_model=List[ReviewResponse])
def list_reviews(prompt_id: Optional[str] = None, chat_id: Optional[str] = None):
    reviews = review_service.load_all_reviews()
    if prompt_id:
        reviews = [r for r in reviews if r.get("prompt_id") == prompt_id]
    if chat_id:
        reviews = [r for r in reviews if r.get("chat_id") == chat_id]
    return reviews


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: str):
    review = review_service.load_review(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.get("/chat/{chat_id}/summary")
def get_chat_summary(chat_id: str):
    return review_service.get_chat_summary(chat_id)


@router.get("/{prompt_id}/summary")
def get_summary(prompt_id: str):
    return review_service.get_summary(prompt_id)


@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: str):
    deleted = review_service.delete_review(review_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Review not found")