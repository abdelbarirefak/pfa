from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import LoginPayload, LoginResponse, RegisterPayload, UserResponse
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(payload: RegisterPayload, db: AsyncSession = Depends(get_db)):
    user = await auth_service.register(
        db,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        password=payload.password,
        academic_affiliation=payload.academic_affiliation,
        country=payload.country,
    )
    return user


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginPayload, db: AsyncSession = Depends(get_db)):
    result = await auth_service.login(db, email=payload.email, password=payload.password)
    return result
