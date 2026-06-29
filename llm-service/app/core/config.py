from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    DEFAULT_MODEL: str = "mistralai/mistral-7b-instruct"
    SERVICE_PORT: int = 8002

    class Config:
        env_file = ".env"

settings = Settings()