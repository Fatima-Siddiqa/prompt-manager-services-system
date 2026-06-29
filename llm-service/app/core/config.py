from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str
    DEFAULT_MODEL: str
    SERVICE_PORT: int

    class Config:
        env_file = ".env"

settings = Settings()