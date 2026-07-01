import uuid
from sqlalchemy.orm import Session
from app.models.job import Job
from app.utils.time import utcnow


def create_job(db: Session, chat_id: str = None) -> Job:
    job = Job(id=str(uuid.uuid4()), status="pending", chat_id=chat_id)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def get_job(db: Session, job_id: str) -> Job | None:
    return db.query(Job).filter(Job.id == job_id).first()


def mark_done(db: Session, job_id: str, result: dict) -> None:
    job = db.query(Job).filter(Job.id == job_id).first()
    if job:
        job.status = "done"
        job.result = result
        job.updated_at = utcnow()
        db.commit()


def mark_failed(db: Session, job_id: str, error: str) -> None:
    job = db.query(Job).filter(Job.id == job_id).first()
    if job:
        job.status = "failed"
        job.error = error
        job.updated_at = utcnow()
        db.commit()