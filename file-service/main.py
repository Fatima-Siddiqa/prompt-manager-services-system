from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import files
from app.core.config import settings

app = FastAPI(title="File Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files.router, prefix="/files", tags=["Files"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "file-service"}