import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROMPT_SERVICE_URL: str = os.getenv("PROMPT_SERVICE_URL", "http://localhost:8000")
    SERVICE_PORT: int = int(os.getenv("SERVICE_PORT", 8001))
    REVIEWS_DIR: str = os.getenv("REVIEWS_DIR", "reviews")


settings = Settings()