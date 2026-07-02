# Prompt Manager System

A multi-service AI-powered application built during the ATS AI Engineering Internship — Week 1 & 2.

## Services

| Service | Port | Storage |
|---|---|---|
| prompt-service | 8000 | PostgreSQL via SQLAlchemy |
| review-service | 8001 | JSON files |
| llm-service | 8002 | Stateless |
| file-service | 8003 | Local disk |
| frontend | 5173 (dev) / 80 (nginx) | — |

## Architecture

```
Browser → ngrok → nginx :80
                    ├── /              → Vite dev server :5173
                    ├── /api/prompts   → prompt-service :8000
                    ├── /api/chats     → prompt-service :8000
                    ├── /api/jobs      → prompt-service :8000
                    ├── /api/reviews   → review-service :8001
                    └── /api/files     → file-service :8003

prompt-service → llm-service (via httpx, async)
review-service → prompt-service (via httpx, async)
llm-service    → OpenRouter API (via httpx, async)
file-service   → local disk (uploads/)
```

Each service runs independently. nginx routes traffic — it does not serve static files.

`llm-service` (port 8002) is never reached directly by the browser or through nginx — it's
only called server-to-server by `prompt-service` over httpx, using the `LLM_SERVICE_URL`
env var. That's why it has no `/api/...` route of its own above; it doesn't need one.

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- nginx
- ngrok
- OpenRouter API key (free tier at openrouter.ai)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Fatima-Siddiqa/prompt-manager-services-system.git
cd prompt-manager-services-system
```

### 2. PostgreSQL — create the database

```sql
CREATE DATABASE prompt_db;
```

### 3. prompt-service

```bash
cd prompt-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/prompt_db
SERVICE_PORT=8000
LLM_SERVICE_URL=http://localhost:8002
```

Run Alembic migrations:

```bash
alembic upgrade head
```

Run:

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. review-service

```bash
cd review-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env`:

```env
PROMPT_SERVICE_URL=http://localhost:8000
SERVICE_PORT=8001
REVIEWS_DIR=reviews
```

Run:

```bash
uvicorn app.main:app --reload --port 8001
```

### 5. llm-service

```bash
cd llm-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env`:

```env
OPENROUTER_API_KEY=sk-or-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
DEFAULT_MODEL=your_model_here
SERVICE_PORT=8002
FALLBACK_MODELS=your_fallback_model_1,your_fallback_model_2,your_fallback_model_3
HEALTH_CHECK_INTERVAL_SECONDS=30
```

Run:

```bash
uvicorn main:app --reload --port 8002
```

### 6. file-service

```bash
cd file-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env`:

```env
SERVICE_PORT=8003
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
```

Run:

```bash
uvicorn main:app --reload --port 8003
```

### 7. Frontend

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_PROMPTS_API_URL=/api/prompts
VITE_CHATS_API_URL=/api/chats
VITE_REVIEWS_API_URL=/api/reviews
VITE_JOBS_API_URL=/api/jobs
VITE_FILES_API_URL=/api/files
```

Run dev server:

```bash
npm run dev
```

### 8. nginx

Copy `nginx.conf.example` to `nginx.conf` and replace `localhost` with `127.0.0.1` and set your actual ports. Start nginx:

```bash
cd C:\path\to\nginx-folder
.\nginx
```

Stop nginx:

```bash
taskkill /IM nginx.exe /F
```

### 9. ngrok

```bash
ngrok http 80
```

Share the ngrok URL to access the app remotely.

---

## .env Reference

### prompt-service/.env

```env
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/prompt_db
SERVICE_PORT=8000
LLM_SERVICE_URL=http://localhost:8002
```

### review-service/.env

```env
PROMPT_SERVICE_URL=http://localhost:8000
SERVICE_PORT=8001
REVIEWS_DIR=reviews
```

### llm-service/.env

```env
OPENROUTER_API_KEY=sk-or-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
DEFAULT_MODEL=your_model_here
SERVICE_PORT=8002
FALLBACK_MODELS=your_fallback_model_1,your_fallback_model_2,your_fallback_model_3
HEALTH_CHECK_INTERVAL_SECONDS=30
```

### file-service/.env

```env
SERVICE_PORT=8003
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
```

### frontend/.env

```env
VITE_PROMPTS_API_URL=/api/prompts
VITE_CHATS_API_URL=/api/chats
VITE_REVIEWS_API_URL=/api/reviews
VITE_JOBS_API_URL=/api/jobs
VITE_FILES_API_URL=/api/files
```

---

## Running the Full System

Open 5 terminals:

| Terminal | Command |
|---|---|
| 1 | `cd llm-service && .venv\Scripts\activate && uvicorn main:app --reload --port 8002` |
| 2 | `cd prompt-service && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000` |
| 3 | `cd review-service && venv\Scripts\activate && uvicorn app.main:app --reload --port 8001` |
| 4 | `cd file-service && venv\Scripts\activate && uvicorn main:app --reload --port 8003` |
| 5 | `cd frontend && npm run dev` |

Then start nginx and ngrok separately.

Start order matters: llm-service → prompt-service → review-service → file-service → frontend.

---

## API Reference

### prompt-service — port 8000

#### Prompts

```bash
# Create a prompt
curl -X POST http://localhost:8000/prompts/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mythical Story Builder",
    "description": "Chained storytelling prompt",
    "content": "You are a master storyteller...",
    "tags": "creative,storytelling",
    "model_target": "your_model_here"
  }'

# List all prompts
curl http://localhost:8000/prompts/

# Filter by tag and limit
curl "http://localhost:8000/prompts/?tag=creative&limit=10"

# Get a prompt by ID
curl http://localhost:8000/prompts/{id}

# Update a prompt
curl -X PUT http://localhost:8000/prompts/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Delete a prompt
curl -X DELETE http://localhost:8000/prompts/{id}

# Check if prompt exists
curl http://localhost:8000/prompts/{id}/exists
```

#### Chats

```bash
# Execute a prompt — creates a new chat, returns job_id immediately
curl -X POST http://localhost:8000/prompts/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{}'

curl -X POST http://localhost:8000/prompts/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"system_prompt": "Document text here..."}'

# Poll job status
curl http://localhost:8000/jobs/{job_id}

# Send a follow-up message — returns job_id immediately
curl -X POST http://localhost:8000/chats/{chat_id}/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Tell me more."}'

# List all chats (no trailing slash — route is defined as "/chats")
curl http://localhost:8000/chats

# Filter chats by prompt
curl "http://localhost:8000/chats?prompt_id={prompt_id}"

# Get a chat with all messages
curl http://localhost:8000/chats/{chat_id}

# Summarize a chat
curl -X POST http://localhost:8000/chats/{chat_id}/summary

# Delete a chat
curl -X DELETE http://localhost:8000/chats/{chat_id}
```

---

### review-service — port 8001

```bash
# Submit a prompt review
curl -X POST http://localhost:8001/reviews/ \
  -H "Content-Type: application/json" \
  -d '{
    "target_type": "prompt",
    "prompt_id": "your-prompt-uuid",
    "reviewer_name": "Fatima",
    "score": 5,
    "feedback": "Clear and well structured prompt."
  }'

# Submit a chat review
curl -X POST http://localhost:8001/reviews/ \
  -H "Content-Type: application/json" \
  -d '{
    "target_type": "chat",
    "chat_id": "your-chat-uuid",
    "reviewer_name": "Fatima",
    "score": 4,
    "feedback": "Good conversation flow."
  }'

# List all reviews
curl http://localhost:8001/reviews/

# Filter by prompt
curl "http://localhost:8001/reviews/?prompt_id={prompt_id}"

# Filter by chat
curl "http://localhost:8001/reviews/?chat_id={chat_id}"

# Get a review by ID
curl http://localhost:8001/reviews/{id}

# Get summary for a prompt
curl http://localhost:8001/reviews/{prompt_id}/summary

# Get summary for a chat
curl http://localhost:8001/reviews/chat/{chat_id}/summary

# Delete a review
curl -X DELETE http://localhost:8001/reviews/{id}
```

---

### llm-service — port 8002

```bash
# Generate a response
curl -X POST http://localhost:8002/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain transformers in one sentence."}
    ],
    "max_tokens": 100
  }'

# Summarize a conversation
curl -X POST http://localhost:8002/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is relativity?"},
      {"role": "assistant", "content": "Relativity is Einstein'\''s theory..."}
    ]
  }'

# Check active model and health
curl http://localhost:8002/health
```

---

### file-service — port 8003

```bash
# Upload a PDF or Word document
curl -X POST http://localhost:8003/files/ \
  -F "file=@/path/to/document.pdf"

# Get file metadata
curl http://localhost:8003/files/{file_id}

# Extract text from file (with token estimate)
curl http://localhost:8003/files/{file_id}/text

# Delete a file
curl -X DELETE http://localhost:8003/files/{file_id}
```

---

## Swagger UI

All services expose auto-generated interactive docs:

| Service | URL |
|---|---|
| prompt-service | http://localhost:8000/docs |
| review-service | http://localhost:8001/docs |
| llm-service | http://localhost:8002/docs |
| file-service | http://localhost:8003/docs |

---

## Key Features

### Week 1

- Prompt CRUD with tag filtering and UUID primary keys
- Review service with prompt snapshot (verbatim copy at review time)
- Service-to-service HTTP communication via httpx
- Raw SQL on prompt-service, JSON file storage on review-service

### Week 2

- LLM integration via OpenRouter with automatic fallback models
- Background health-check scheduler — silently swaps models on failure
- Async background job queue (PostgreSQL-backed) for execute and follow-up
- Frontend job polling with rotating progress messages
- Chat history with token tracking per message (prompt/completion/total)
- Collapsible chat summary via LLM
- Document upload (PDF/Word) with text extraction and token management
- Document context injected as system prompt into LLM conversation
- Chat reviews with snapshot of full conversation at review time

---

## Git Structure

```
main           ← production (merged after each completed week)
└── dev-week2  ← integration branch
    ├── feature/llm-service
    ├── feature/llm-service-fallback
    ├── feature/prompt-service-week2
    ├── feature/async-jobs
    ├── feature/review-service-week2
    ├── feature/frontend-week2
    ├── feature/file-service
    └── feature/document-chat
```

---

## Notes

- All API keys and secrets live in `.env` files — never committed to git
- `nginx.conf` is gitignored — use `nginx.conf.example` as a template
- Free OpenRouter models share a daily quota (50 requests/day account-wide) — check your
  provider's current limits, since free-tier quotas change over time
- The fallback scheduler runs every 30 seconds silently in the background
- Uploaded files are saved to `file-service/uploads/` on the host machine
- Document text is truncated to ~3000 tokens before being sent as a system prompt