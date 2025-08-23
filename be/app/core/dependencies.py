# dependencies.py
from fastapi import Depends
from livekit import api

from app.core.config import settings
from app.core.livekit.room_service import RoomService
from app.core.livekit.token_service import TokenService


async def get_livekit_api() -> api.LiveKitAPI:
    """
    Provides a LiveKitAPI client configured from settings.
    Creates it within the running event loop and ensures cleanup.
    """
    client = api.LiveKitAPI(
        url=settings.LIVEKIT_URL,
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
    )
    try:
        yield client
    finally:
        await client.aclose()


def get_room_service(livekit_api: api.LiveKitAPI = Depends(get_livekit_api)) -> RoomService:
    """
    Dependency provider for RoomService using LiveKitAPI client.
    """
    return RoomService(livekit_api)


def get_token_service() -> TokenService:
    """
    Dependency provider for TokenService.
    """
    return TokenService()