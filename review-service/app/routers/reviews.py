from fastapi import APIRouter
from typing import Optional, List
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services import review_service

router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(payload: ReviewCreate):
    return review_service.create_review(payload)