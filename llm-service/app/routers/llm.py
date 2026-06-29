from fastapi import APIRouter, HTTPException, Request
from app.schemas.llm import (
    GenerateRequest, GenerateResponse,
    SummarizeRequest, TokenUsage
)
from app.core.config import settings
import httpx

router = APIRouter()

SUMMARIZE_SYSTEM_PROMPT = (
    "You are a concise summarizer. Given a conversation between a user and an AI assistant, "
    "produce a short paragraph (3-5 sentences) summarizing the key points discussed and any "
    "conclusions reached. Do not add opinions or new information."
)


async def call_openrouter(client: httpx.AsyncClient, messages: list[dict], model: str, temperature: float, max_tokens: int) -> dict:
    try:
        response = await client.post(
            f"{settings.OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Cannot reach OpenRouter")
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="OpenRouter timed out")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Request error: {str(e)}")

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"OpenRouter error: {response.text}")

    return response.json()


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: Request, body: GenerateRequest):
    client: httpx.AsyncClient = request.app.state.http_client
    model = body.model or settings.DEFAULT_MODEL

    data = await call_openrouter(
        client,
        messages=[m.model_dump() for m in body.messages],
        model=model,
        temperature=body.temperature,
        max_tokens=body.max_tokens,
    )

    choice = data["choices"][0]
    usage = data["usage"]

    return GenerateResponse(
        content=choice["message"]["content"],
        model=data["model"],
        usage=TokenUsage(
            prompt_tokens=usage["prompt_tokens"],
            completion_tokens=usage["completion_tokens"],
            total_tokens=usage["total_tokens"],
        ),
        finish_reason=choice["finish_reason"],
    )


@router.post("/summarize")
async def summarize(request: Request, body: SummarizeRequest):
    client: httpx.AsyncClient = request.app.state.http_client

    messages = [{"role": "system", "content": SUMMARIZE_SYSTEM_PROMPT}]
    messages += [m.model_dump() for m in body.messages]

    data = await call_openrouter(
        client,
        messages=messages,
        model=settings.DEFAULT_MODEL,
        temperature=0.3,
        max_tokens=300,
    )

    return {"summary": data["choices"][0]["message"]["content"]}


@router.get("/models")
async def list_models(request: Request):
    client: httpx.AsyncClient = request.app.state.http_client
    try:
        response = await client.get(
            f"{settings.OPENROUTER_BASE_URL}/models",
            headers={"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}"},
        )
        return response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/health")
async def health():
    key_set = bool(settings.OPENROUTER_API_KEY)
    return {"status": "ok", "service": "llm-service", "api_key_configured": key_set}