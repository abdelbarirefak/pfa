from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


def _sanitize(user: User) -> dict:
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "academic_affiliation": user.academic_affiliation,
        "country": user.country,
        "biography": user.biography,
        "meta_link": user.meta_link,
        "role": user.role,
    }


async def search_by_email(db: AsyncSession, email: str) -> list[dict]:
    result = await db.execute(
        select(User)
        .where(User.email.ilike(f"%{email}%"))
        .limit(10)
    )
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "academic_affiliation": u.academic_affiliation,
            "role": u.role,
        }
        for u in users
    ]


async def get_by_id(db: AsyncSession, user_id: str) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'User with ID "{user_id}" not found')
    return _sanitize(user)


async def update_profile(db: AsyncSession, user_id: str, data: dict) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f'User with ID "{user_id}" not found')

    for key in ("first_name", "last_name", "academic_affiliation", "country", "biography", "meta_link"):
        if key in data and data[key] is not None:
            setattr(user, key, data[key])

    await db.commit()
    await db.refresh(user)
    return _sanitize(user)
