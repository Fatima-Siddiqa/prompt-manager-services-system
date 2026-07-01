import os
import uuid
import json
import fitz  # pymupdf
from docx import Document as DocxDocument
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.core.config import settings
from app.schemas.file import FileResponse, FileTextResponse

router = APIRouter()

ALLOWED_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
}

# rough estimate: 1 token ≈ 4 characters
CHARS_PER_TOKEN = 4
# safe limit for system prompt — leave room for conversation
MAX_SYSTEM_PROMPT_TOKENS = 3000
MAX_SYSTEM_PROMPT_CHARS = MAX_SYSTEM_PROMPT_TOKENS * CHARS_PER_TOKEN


def get_upload_dir() -> str:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    return settings.UPLOAD_DIR


def get_meta_path(file_id: str) -> str:
    return os.path.join(get_upload_dir(), f"{file_id}.meta.json")


def save_meta(file_id: str, meta: dict) -> None:
    with open(get_meta_path(file_id), "w") as f:
        json.dump(meta, f)


def load_meta(file_id: str) -> dict | None:
    path = get_meta_path(file_id)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def extract_text_from_pdf(path: str) -> str:
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text.strip()


def extract_text_from_docx(path: str) -> str:
    doc = DocxDocument(path)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


@router.post("/", response_model=FileResponse)
async def upload_file(file: UploadFile = File(...)):
    # validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Only PDF and Word documents are allowed."
        )

    # read and validate size
    contents = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB."
        )

    # generate unique ID and save file
    file_id = str(uuid.uuid4())
    extension = ALLOWED_TYPES[file.content_type]
    filename_on_disk = f"{file_id}{extension}"
    upload_path = os.path.join(get_upload_dir(), filename_on_disk)

    with open(upload_path, "wb") as f:
        f.write(contents)

    # save metadata
    meta = {
        "id": file_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(contents),
        "upload_path": upload_path,
        "extension": extension,
    }
    save_meta(file_id, meta)

    return FileResponse(**meta)


@router.get("/{file_id}", response_model=FileResponse)
def get_file(file_id: str):
    meta = load_meta(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(**meta)


@router.get("/{file_id}/text", response_model=FileTextResponse)
def get_file_text(file_id: str):
    meta = load_meta(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")

    path = meta["upload_path"]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File data not found on disk")

    # extract text based on file type
    try:
        if meta["extension"] == ".pdf":
            text = extract_text_from_pdf(path)
        else:
            text = extract_text_from_docx(path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    # token management — truncate if too long
    truncated = False
    truncated_at_chars = None

    if len(text) > MAX_SYSTEM_PROMPT_CHARS:
        truncated = True
        truncated_at_chars = MAX_SYSTEM_PROMPT_CHARS
        text = text[:MAX_SYSTEM_PROMPT_CHARS]

    return FileTextResponse(
        id=file_id,
        filename=meta["filename"],
        text=text,
        char_count=len(text),
        estimated_tokens=len(text) // CHARS_PER_TOKEN,
        truncated=truncated,
        truncated_at_chars=truncated_at_chars,
    )


@router.delete("/{file_id}", status_code=204)
def delete_file(file_id: str):
    meta = load_meta(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")

    # delete actual file
    if os.path.exists(meta["upload_path"]):
        os.remove(meta["upload_path"])

    # delete metadata
    os.remove(get_meta_path(file_id))