from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

from app.routers import llm
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # one shared client for the lifetime of the service
    app.state.http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(connect=5.0, read=60.0, write=10.0, pool=5.0)
    )
    yield
    await app.state.http_client.aclose()


app = FastAPI(title="LLM Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(llm.router, tags=["LLM"])