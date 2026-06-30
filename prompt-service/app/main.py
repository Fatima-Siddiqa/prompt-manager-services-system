from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

from app.database import engine, Base
from app.routers import prompts, chats
from app.middleware.logging import log_requests

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(connect=5.0, read=60.0, write=10.0, pool=5.0)
    )
    yield
    await app.state.http_client.aclose()


app = FastAPI(title="Prompt Service", version="1.0.0", lifespan=lifespan)

app.middleware("http")(log_requests)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prompts.router, prefix="/prompts", tags=["Prompts"])
app.include_router(chats.router, tags=["Chats"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "prompt-service"}