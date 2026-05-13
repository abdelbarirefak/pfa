from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.schemas import UpdateProfilePayload, UserResponse
from app.services import users as users_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
async def search_users(
    email: str = Query(""),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    if not email:
        return []
    return await users_service.search_by_email(db, email)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await users_service.get_by_id(db, user_id)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_profile(
    user_id: str,
    payload: UpdateProfilePayload,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if user_id != current_user.sub and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You can only update your own profile")
    return await users_service.update_profile(
        db, user_id, payload.model_dump(exclude_none=True)
    )
