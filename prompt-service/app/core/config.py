import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    SERVICE_PORT: int = int(os.getenv("SERVICE_PORT", 8000))


settings = Settings()