from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import reviews

app = FastAPI(title="Review Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "review-service"}