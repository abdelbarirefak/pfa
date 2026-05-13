from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user, require_role
from app.schemas import (
    ConferenceResponse,
    CreateConferencePayload,
    CreateTrackPayload,
    TrackResponse,
)
from app.services import conferences as conferences_service

router = APIRouter(prefix="/conferences", tags=["conferences"])


@router.get("", response_model=list[ConferenceResponse])
async def list_conferences(
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await conferences_service.list_conferences(db, status, search)


@router.get("/{conference_id}", response_model=ConferenceResponse)
async def get_conference(
    conference_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await conferences_service.get_conference_by_id(db, conference_id)


@router.get("/{conference_id}/tracks", response_model=list[TrackResponse])
async def get_tracks(
    conference_id: str,
    db: AsyncSession = Depends(get_db),
    _=Depends(get_current_user),
):
    return await conferences_service.get_tracks(db, conference_id)


@router.post("", response_model=ConferenceResponse, status_code=201)
async def create_conference(
    payload: CreateConferencePayload,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role("PC_CHAIR", "ADMIN")),
):
    return await conferences_service.create_conference(db, payload.model_dump())


@router.post("/{conference_id}/tracks", response_model=TrackResponse, status_code=201)
async def add_track(
    conference_id: str,
    payload: CreateTrackPayload,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_role("PC_CHAIR", "ADMIN")),
):
    return await conferences_service.add_track(db, conference_id, payload.name)
