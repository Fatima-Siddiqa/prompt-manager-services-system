from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SERVICE_PORT: int
    UPLOAD_DIR: str
    MAX_FILE_SIZE_MB: int

    class Config:
        env_file = ".env"


settings = Settings()