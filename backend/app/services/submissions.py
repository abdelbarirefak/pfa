from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Authorship, PaperSubmission, Track, User

SUBMISSION_INCLUDE = (
    selectinload(PaperSubmission.track).selectinload(Track.conference),
    selectinload(PaperSubmission.authorships).selectinload(Authorship.user),
)


def _map_submission(sub: PaperSubmission) -> dict:
    track = sub.track
    conference = track.conference if track else None
    authorships = sorted(sub.authorships, key=lambda a: a.author_sequence_order) if sub.authorships else []

    return {
        "id": sub.id,
        "title": sub.title,
        "abstract": sub.abstract,
        "manuscript_file_url": sub.manuscript_file_url,
        "status": sub.status,
        "track_id": sub.track_id,
        "conference_id": conference.id if conference else "",
        "track_name": track.name if track else None,
        "conference_name": conference.name if conference else None,
        "created_at": sub.created_at.isoformat() if sub.created_at else None,
        "updated_at": sub.updated_at.isoformat() if sub.updated_at else None,
        "authorship_list": [
            {
                "paper_id": a.paper_id,
                "user_id": a.user_id,
                "author_sequence_order": a.author_sequence_order,
                "is_corresponding_author": a.is_corresponding_author,
                "user": {
                    "id": a.user.id,
                    "first_name": a.user.first_name,
                    "last_name": a.user.last_name,
                    "email": a.user.email,
                    "academic_affiliation": a.user.academic_affiliation,
                    "country": a.user.country,
                    "biography": a.user.biography,
                    "meta_link": a.user.meta_link,
                    "role": a.user.role,
                } if a.user else None,
            }
            for a in authorships
        ],
    }


async def list_by_user(db: AsyncSession, user_id: str) -> list[dict]:
    subquery = select(Authorship.paper_id).where(Authorship.user_id == user_id).scalar_subquery()
    stmt = (
        select(PaperSubmission)
        .where(PaperSubmission.id.in_(subquery))
        .options(*SUBMISSION_INCLUDE)
    )
    result = await db.execute(stmt)
    papers = result.scalars().unique().all()
    return [_map_submission(p) for p in papers]


async def get_by_id(db: AsyncSession, submission_id: str) -> dict:
    stmt = (
        select(PaperSubmission)
        .options(*SUBMISSION_INCLUDE)
        .where(PaperSubmission.id == submission_id)
    )
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'Submission with ID "{submission_id}" not found')
    return _map_submission(sub)


async def create(db: AsyncSession, track_id: str, conference_id: str,
                 title: str, abstract: str, user_id: str) -> dict:
    track_result = await db.execute(select(Track).where(Track.id == track_id))
    track = track_result.scalar_one_or_none()
    if not track:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'Track with ID "{track_id}" not found')
    if track.conference_id != conference_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Track does not belong to the specified conference")

    sub = PaperSubmission(title=title, abstract=abstract, status="DRAFT", track_id=track_id)
    db.add(sub)
    await db.flush()

    authorship = Authorship(
        paper_id=sub.id, user_id=user_id,
        author_sequence_order=1, is_corresponding_author=True,
    )
    db.add(authorship)
    await db.commit()

    stmt = (
        select(PaperSubmission)
        .options(*SUBMISSION_INCLUDE)
        .where(PaperSubmission.id == sub.id)
    )
    result = await db.execute(stmt)
    return _map_submission(result.scalar_one())


async def update(db: AsyncSession, submission_id: str, requester_id: str,
                 data: dict) -> dict:
    sub = await _get_sub_with_authorships(db, submission_id)

    if not any(a.user_id == requester_id for a in sub.authorships):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not an author of this submission")

    for key in ("title", "abstract", "status"):
        if key in data and data[key] is not None:
            setattr(sub, key, data[key])

    await db.commit()
    return await get_by_id(db, submission_id)


async def update_authors(db: AsyncSession, submission_id: str, requester_id: str,
                         authorships_data: list[dict]) -> dict:
    sub = await _get_sub_with_authorships(db, submission_id)

    if not any(a.user_id == requester_id for a in sub.authorships):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not an author of this submission")

    for a_data in authorships_data:
        user_result = await db.execute(select(User).where(User.id == a_data["user_id"]))
        if not user_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f'User with ID "{a_data["user_id"]}" not found')

    for a in sub.authorships:
        await db.delete(a)

    for a_data in authorships_data:
        db.add(Authorship(
            paper_id=submission_id,
            user_id=a_data["user_id"],
            author_sequence_order=a_data["author_sequence_order"],
            is_corresponding_author=a_data["is_corresponding_author"],
        ))
    await db.commit()

    return await get_by_id(db, submission_id)


async def update_manuscript_url(db: AsyncSession, submission_id: str,
                                requester_id: str, file_url: str) -> dict:
    sub = await _get_sub_with_authorships(db, submission_id)

    if not any(a.user_id == requester_id for a in sub.authorships):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You are not an author of this submission")

    sub.manuscript_file_url = file_url
    await db.commit()
    return await get_by_id(db, submission_id)


async def _get_sub_with_authorships(db: AsyncSession, submission_id: str) -> PaperSubmission:
    stmt = (
        select(PaperSubmission)
        .options(selectinload(PaperSubmission.authorships))
        .where(PaperSubmission.id == submission_id)
    )
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'Submission with ID "{submission_id}" not found')
    return sub
