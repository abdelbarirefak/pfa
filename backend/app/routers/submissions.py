import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.middleware.auth import get_current_user
from app.schemas import (
    CreateSubmissionPayload,
    PaperSubmissionResponse,
    UpdateAuthorshipPayload,
    UpdateSubmissionPayload,
)
from app.services import submissions as submissions_service

router = APIRouter(prefix="/submissions", tags=["submissions"])

UPLOAD_DIR = settings.upload_dir
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("", response_model=list[PaperSubmissionResponse])
async def list_mine(
    user_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    uid = user_id or current_user.sub
    return await submissions_service.list_by_user(db, uid)


@router.get("/{submission_id}", response_model=PaperSubmissionResponse)
async def get_submission(
    submission_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await submissions_service.get_by_id(db, submission_id)


@router.post("", response_model=PaperSubmissionResponse, status_code=201)
async def create_submission(
    payload: CreateSubmissionPayload,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await submissions_service.create(
        db,
        track_id=payload.track_id,
        conference_id=payload.conference_id,
        title=payload.title,
        abstract=payload.abstract,
        user_id=current_user.sub,
    )


@router.patch("/{submission_id}", response_model=PaperSubmissionResponse)
async def update_submission(
    submission_id: str,
    payload: UpdateSubmissionPayload,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await submissions_service.update(
        db, submission_id, current_user.sub, payload.model_dump(exclude_none=True)
    )


@router.patch("/{submission_id}/authors", response_model=PaperSubmissionResponse)
async def update_authors(
    submission_id: str,
    payload: UpdateAuthorshipPayload,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await submissions_service.update_authors(
        db, submission_id, current_user.sub,
        [a.model_dump() for a in payload.authorships],
    )


@router.post("/{submission_id}/manuscript", response_model=PaperSubmissionResponse)
async def upload_manuscript(
    submission_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Only PDF files are allowed")

    ext = os.path.splitext(file.filename or "manuscript.pdf")[1] or ".pdf"
    filename = f"manuscript-{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    if len(content) > settings.max_file_size:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="File too large (max 20MB)")

    async with __import__("aiofiles").open(filepath, "wb") as f:
        await f.write(content)

    file_url = f"/uploads/{filename}"
    return await submissions_service.update_manuscript_url(
        db, submission_id, current_user.sub, file_url
    )
