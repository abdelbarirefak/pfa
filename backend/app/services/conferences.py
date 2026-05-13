from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Conference, Track


async def list_conferences(db: AsyncSession, status_filter: str | None = None,
                           search: str | None = None) -> list[dict]:
    stmt = select(Conference).options(selectinload(Conference.tracks))

    if status_filter:
        stmt = stmt.where(Conference.status == status_filter)
    if search:
        stmt = stmt.where(
            Conference.name.ilike(f"%{search}%") |
            Conference.location.ilike(f"%{search}%")
        )

    stmt = stmt.order_by(Conference.start_date)
    result = await db.execute(stmt)
    conferences = result.scalars().unique().all()

    return [_map_conference(c) for c in conferences]


async def get_conference_by_id(db: AsyncSession, conference_id: str) -> dict:
    stmt = (
        select(Conference)
        .options(selectinload(Conference.tracks))
        .where(Conference.id == conference_id)
    )
    result = await db.execute(stmt)
    conference = result.scalar_one_or_none()

    if not conference:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'Conference with ID "{conference_id}" not found')
    return _map_conference(conference)


async def get_tracks(db: AsyncSession, conference_id: str) -> list[dict]:
    await get_conference_by_id(db, conference_id)

    result = await db.execute(
        select(Track).where(Track.conference_id == conference_id).order_by(Track.name)
    )
    tracks = result.scalars().all()
    return [
        {"id": t.id, "conference_id": t.conference_id, "name": t.name}
        for t in tracks
    ]


async def create_conference(db: AsyncSession, data: dict) -> dict:
    conference = Conference(
        name=data["name"],
        location=data["location"],
        start_date=data["start_date"] if isinstance(data["start_date"], datetime) else datetime.fromisoformat(data["start_date"]),
        end_date=data["end_date"] if isinstance(data["end_date"], datetime) else datetime.fromisoformat(data["end_date"]),
        submission_deadline=data["submission_deadline"] if isinstance(data["submission_deadline"], datetime) else datetime.fromisoformat(data["submission_deadline"]),
        description=data.get("description"),
        status=data.get("status", "UPCOMING"),
    )
    db.add(conference)
    await db.commit()
    await db.refresh(conference)

    stmt = (
        select(Conference)
        .options(selectinload(Conference.tracks))
        .where(Conference.id == conference.id)
    )
    result = await db.execute(stmt)
    return _map_conference(result.scalar_one())


async def add_track(db: AsyncSession, conference_id: str, name: str) -> dict:
    await get_conference_by_id(db, conference_id)

    track = Track(name=name, conference_id=conference_id)
    db.add(track)
    await db.commit()
    await db.refresh(track)
    return {"id": track.id, "conference_id": track.conference_id, "name": track.name}


def _map_conference(c: Conference) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "location": c.location,
        "start_date": c.start_date.isoformat(),
        "end_date": c.end_date.isoformat(),
        "submission_deadline": c.submission_deadline.isoformat(),
        "status": c.status,
        "description": c.description,
        "track_count": len(c.tracks) if c.tracks else None,
    }
