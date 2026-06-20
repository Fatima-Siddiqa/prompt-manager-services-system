from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import prompts
from app.middleware.logging import log_requests

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Prompt Service", version="1.0.0")

app.middleware("http")(log_requests)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prompts.router, prefix="/prompts", tags=["Prompts"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "prompt-service"}