from fastapi import APIRouter, HTTPException, Request
from app.schemas.llm import (
    GenerateRequest, GenerateResponse,
    SummarizeRequest, TokenUsage
)
from app.core.config import settings
from app.core.model_state import model_state
import httpx
import asyncio

router = APIRouter()

SUMMARIZE_SYSTEM_PROMPT = (
    "You are a concise summarizer. Given a conversation between a user and an AI assistant, "
    "produce a short paragraph (3-5 sentences) summarizing the key points discussed and any "
    "conclusions reached. Do not add opinions or new information."
)


async def call_openrouter_once(client: httpx.AsyncClient, messages: list[dict], model: str, temperature: float, max_tokens: int):
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
        return None, 503, "Cannot reach OpenRouter"
    except httpx.ReadTimeout:
        return None, 504, "OpenRouter timed out"
    except httpx.RequestError as e:
        return None, 503, f"Request error: {str(e)}"

    if response.status_code == 429 or response.status_code >= 500:
        return None, response.status_code, response.text

    if response.status_code >= 400:
        return None, 502, response.text

    return response.json(), 200, None


async def call_openrouter_with_fallback(client: httpx.AsyncClient, messages: list[dict], requested_model: str | None, temperature: float, max_tokens: int) -> dict:
    if requested_model:
        candidates = [requested_model]
    else:
        active = await model_state.get_active_model()
        candidates = [active] + [m for m in settings.fallback_model_list if m != active]

    last_error_detail = None
    last_error_status = 502

    for model in candidates:
        data, status, error_detail = await call_openrouter_once(client, messages, model, temperature, max_tokens)
        if data is not None:
            return data

        last_error_detail = error_detail
        last_error_status = status

        if status in (429, 500, 502, 503):
            await asyncio.sleep(1)
            data, status, error_detail = await call_openrouter_once(client, messages, model, temperature, max_tokens)
            if data is not None:
                return data
            last_error_detail = error_detail
            last_error_status = status

    raise HTTPException(
        status_code=503 if last_error_status in (429, 503) else 502,
        detail=f"All models exhausted. Last error: {last_error_detail}"
    )


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: Request, body: GenerateRequest):
    client: httpx.AsyncClient = request.app.state.http_client

    data = await call_openrouter_with_fallback(
        client,
        messages=[m.model_dump() for m in body.messages],
        requested_model=body.model,
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

    data = await call_openrouter_with_fallback(
        client,
        messages=messages,
        requested_model=None,
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
    active = await model_state.get_active_model()
    return {"status": "ok", "service": "llm-service", "api_key_configured": key_set, "active_model": active}