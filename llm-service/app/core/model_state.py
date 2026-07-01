import asyncio
import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("llm-service.model_state")


class ModelState:
    def __init__(self):
        self.active_model: str = settings.DEFAULT_MODEL
        self._lock = asyncio.Lock()

    async def get_active_model(self) -> str:
        async with self._lock:
            return self.active_model

    async def set_active_model(self, model: str) -> None:
        async with self._lock:
            if model != self.active_model:
                logger.warning(f"Switching active model: {self.active_model} -> {model}")
            self.active_model = model


model_state = ModelState()


async def health_check_model(client: httpx.AsyncClient, model: str) -> bool:
    try:
        response = await client.post(
            f"{settings.OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": "ping"}],
                "max_tokens": 5,
            },
            timeout=httpx.Timeout(connect=5.0, read=15.0, write=5.0, pool=5.0),
        )
        return response.status_code == 200
    except httpx.RequestError:
        return False


async def run_health_check_loop(client: httpx.AsyncClient):
    candidates = [settings.DEFAULT_MODEL] + settings.fallback_model_list

    while True:
        await asyncio.sleep(settings.HEALTH_CHECK_INTERVAL_SECONDS)

        current = await model_state.get_active_model()
        is_healthy = await health_check_model(client, current)

        if is_healthy:
            continue

        logger.warning(f"Active model '{current}' failed health check. Searching for a fallback.")

        for candidate in candidates:
            if candidate == current:
                continue
            if await health_check_model(client, candidate):
                await model_state.set_active_model(candidate)
                break
        else:
            logger.error("All candidate models failed health check. Keeping current model.")