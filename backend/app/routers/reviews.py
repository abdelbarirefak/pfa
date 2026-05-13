from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user, require_role
from app.schemas import AssignReviewPayload, ReviewResponse, UpdateReviewPayload
from app.services import reviews as reviews_service

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("", response_model=list[ReviewResponse])
async def list_mine(
    reviewer_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rid = reviewer_id or current_user.sub
    return await reviews_service.list_by_reviewer(db, rid)


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await reviews_service.get_by_id(db, review_id)


@router.patch("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    payload: UpdateReviewPayload,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await reviews_service.update(
        db, review_id, current_user.sub, payload.model_dump(exclude_none=True)
    )


@router.post("/assign", response_model=ReviewResponse, status_code=201)
async def assign_reviewer(
    payload: AssignReviewPayload,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role("PC_CHAIR", "ADMIN")),
):
    return await reviews_service.assign(db, payload.paper_id, payload.reviewer_id)
