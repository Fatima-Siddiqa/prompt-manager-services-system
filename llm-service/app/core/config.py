from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str
    DEFAULT_MODEL: str
    SERVICE_PORT: int
    FALLBACK_MODELS: str
    HEALTH_CHECK_INTERVAL_SECONDS: int = 30

    class Config:
        env_file = ".env"

    @property
    def fallback_model_list(self) -> list[str]:
        return [m.strip() for m in self.FALLBACK_MODELS.split(",") if m.strip()]


settings = Settings()