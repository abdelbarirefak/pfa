import bcrypt
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.middleware.auth import create_jwt
from app.models import User


def sanitize_user(user: User) -> dict:
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


async def register(db: AsyncSession, first_name: str, last_name: str, email: str,
                   password: str, academic_affiliation: str, country: str | None = None) -> dict:
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="A user with this email already exists")

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password_hash=bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
        academic_affiliation=academic_affiliation,
        country=country,
        role="AUTHOR",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return sanitize_user(user)


async def login(db: AsyncSession, email: str, password: str) -> dict:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid email or password")

    token = create_jwt(user.id, user.email, user.role)
    return {"token": token, "user": sanitize_user(user)}
