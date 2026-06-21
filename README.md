# Prompt Manager System

A two-service FastAPI architecture built during the ATS AI Engineering Internship — Week 1.

## Services

| Service | Port | Storage |
|---|---|---|
| prompt-service | 8000 | PostgreSQL via SQLAlchemy |
| review-service | 8001 | JSON files |
| frontend | 80 (nginx) | — |

## Architecture

```
Browser → ngrok → nginx :80
                    ├── /             → React frontend (dist/)
                    ├── /api/prompts  → prompt-service :8000
                    └── /api/reviews  → review-service :8001
```

`review-service` calls `prompt-service` over HTTP using `httpx`. It does not share a database — it is a consumer of `prompt-service`'s API.

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- nginx
- ngrok

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
```

Run:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
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
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### 5. Frontend

```bash
cd frontend
npm install
npm run build
```

### 6. nginx

Copy `nginx.conf.example` to `nginx.conf` and update the `root` directive with your absolute path to `frontend/dist`:

```nginx
root "C:/your/absolute/path/to/frontend/dist";
```

Start nginx:

```bash
cd C:\path\to\nginx-folder
.\nginx
```

### 7. ngrok

```bash
ngrok http 80
```

Share the ngrok URL to access the frontend remotely.

---

## .env Reference

### prompt-service/.env

```env
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/prompt_db
SERVICE_PORT=8000
```

### review-service/.env

```env
PROMPT_SERVICE_URL=http://localhost:8000
SERVICE_PORT=8001
REVIEWS_DIR=reviews
```

---

## API Reference

### prompt-service — port 8000

#### Create a prompt

```bash
curl -X POST http://localhost:8000/prompts/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mythical Story Builder",
    "description": "Chained storytelling prompt",
    "content": "You are a master storyteller...",
    "tags": "creative,storytelling",
    "model_target": "claude-opus-4-6"
  }'
```

#### List all prompts

```bash
curl http://localhost:8000/prompts/
```

#### Filter by tag and limit

```bash
curl "http://localhost:8000/prompts/?tag=creative&limit=10"
```

#### Get a prompt by ID

```bash
curl http://localhost:8000/prompts/{id}
```

#### Update a prompt

```bash
curl -X PUT http://localhost:8000/prompts/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

#### Delete a prompt

```bash
curl -X DELETE http://localhost:8000/prompts/{id}
```

#### Check if prompt exists

```bash
curl http://localhost:8000/prompts/{id}/exists
```

---

### review-service — port 8001

#### Submit a review

```bash
curl -X POST http://localhost:8001/reviews/ \
  -H "Content-Type: application/json" \
  -d '{
    "prompt_id": "your-prompt-uuid",
    "reviewer_name": "Fatima",
    "score": 5,
    "feedback": "Clear and well structured prompt."
  }'
```

#### List all reviews

```bash
curl http://localhost:8001/reviews/
```

#### Filter reviews by prompt

```bash
curl "http://localhost:8001/reviews/?prompt_id={prompt_id}"
```

#### Get a review by ID

```bash
curl http://localhost:8001/reviews/{id}
```

#### Get summary for a prompt

```bash
curl http://localhost:8001/reviews/{prompt_id}/summary
```

#### Delete a review

```bash
curl -X DELETE http://localhost:8001/reviews/{id}
```

---

## Swagger UI

Both services expose auto-generated interactive docs:

- prompt-service: http://localhost:8000/docs
- review-service: http://localhost:8001/docs

---

## Running the Full System

Open 4 terminals:

| Terminal | Command |
|---|---|
| 1 | `cd prompt-service && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000` |
| 2 | `cd review-service && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8001` |
| 3 | `cd C:\path\to\nginx && .\nginx` |
| 4 | `ngrok http 80` |

Rebuild frontend only when frontend code changes:

```bash
cd frontend && npm run build
```

Stop nginx:

```bash
taskkill /IM nginx.exe /F
```

---

## Git Structure

```
main     ← production (ngrok-exposed)
└── dev  ← integration branch
    ├── feature/prompt-service
    ├── feature/review-service
    └── feature/frontend
```