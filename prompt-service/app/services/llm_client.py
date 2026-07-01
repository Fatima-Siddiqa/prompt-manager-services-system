import httpx
from fastapi import HTTPException
from app.core.config import settings


async def generate(client: httpx.AsyncClient, messages: list[dict], model: str = None) -> dict:
    payload = {
        "messages": messages,
        "max_tokens": 50,   # tiny, just enough to verify the flow works
    }
    if model:
        payload["model"] = model

    try:
        response = await client.post(
            f"{settings.LLM_SERVICE_URL}/generate",
            json=payload,
        )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="llm-service is unreachable")
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="llm-service timed out")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Request error: {str(e)}")

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"llm-service error: {response.text}")

    return response.json()


async def summarize(client: httpx.AsyncClient, messages: list[dict]) -> str:
    try:
        response = await client.post(
            f"{settings.LLM_SERVICE_URL}/summarize",
            json={"messages": messages},
        )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="llm-service is unreachable")
    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="llm-service timed out")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Request error: {str(e)}")

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"llm-service error: {response.text}")

    return response.json()["summary"]