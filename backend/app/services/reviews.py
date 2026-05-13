from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Conference, PaperSubmission, Review, Track, User

REVIEW_INCLUDE = (
    selectinload(Review.paper)
    .selectinload(PaperSubmission.track)
    .selectinload(Track.conference),
)


def _map_review(review: Review) -> dict:
    paper = review.paper
    track = paper.track if paper else None
    conference = track.conference if track else None
    return {
        "id": review.id,
        "paper_id": review.paper_id,
        "reviewer_id": review.reviewer_id,
        "comments": review.comments,
        "evaluation_comments": review.evaluation_comments,
        "status": review.status,
        "paper_title": paper.title if paper else None,
        "conference_name": conference.name if conference else None,
    }


async def list_by_reviewer(db: AsyncSession, reviewer_id: str) -> list[dict]:
    stmt = (
        select(Review)
        .options(*REVIEW_INCLUDE)
        .where(Review.reviewer_id == reviewer_id)
        .order_by(Review.created_at.desc())
    )
    result = await db.execute(stmt)
    reviews = result.scalars().unique().all()
    return [_map_review(r) for r in reviews]


async def get_by_id(db: AsyncSession, review_id: str) -> dict:
    stmt = select(Review).options(*REVIEW_INCLUDE).where(Review.id == review_id)
    result = await db.execute(stmt)
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'Review with ID "{review_id}" not found')
    return _map_review(review)


async def update(db: AsyncSession, review_id: str, requester_id: str,
                 data: dict) -> dict:
    stmt = select(Review).options(*REVIEW_INCLUDE).where(Review.id == review_id)
    result = await db.execute(stmt)
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'Review with ID "{review_id}" not found')
    if review.reviewer_id != requester_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You can only update your own reviews")
    if review.status == "COMPLETED" and data.get("status", "COMPLETED") != "COMPLETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Cannot reopen a completed review")

    for key in ("comments", "evaluation_comments", "status"):
        if key in data and data[key] is not None:
            setattr(review, key, data[key])

    await db.commit()
    stmt = select(Review).options(*REVIEW_INCLUDE).where(Review.id == review_id)
    result = await db.execute(stmt)
    return _map_review(result.scalar_one())


async def assign(db: AsyncSession, paper_id: str, reviewer_id: str) -> dict:
    paper_result = await db.execute(
        select(PaperSubmission).where(PaperSubmission.id == paper_id)
    )
    if not paper_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'Paper with ID "{paper_id}" not found')

    reviewer_result = await db.execute(
        select(User).where(User.id == reviewer_id)
    )
    if not reviewer_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'Reviewer with ID "{reviewer_id}" not found')

    existing_result = await db.execute(
        select(Review).where(
            Review.paper_id == paper_id, Review.reviewer_id == reviewer_id
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="This reviewer is already assigned to this paper")

    review = Review(paper_id=paper_id, reviewer_id=reviewer_id, status="PENDING")
    db.add(review)
    await db.commit()

    stmt = select(Review).options(*REVIEW_INCLUDE).where(Review.id == review.id)
    result = await db.execute(stmt)
    return _map_review(result.scalar_one())
