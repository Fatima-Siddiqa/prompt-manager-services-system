# Prompt Manager System
Two-service FastAPI architecture built during ATS AI Engineering Internship Week 1.

Services:
- prompt-service (port 8000) — stores prompts in PostgreSQL via SQLAlchemy
- review-service (port 8001) — reviews prompts, fetches via httpx, stores as JSON