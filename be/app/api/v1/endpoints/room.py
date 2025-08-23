from datetime import datetime
import json

from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from app.core.dependencies import get_room_service, get_token_service
from app.core.livekit.room_service import RoomService
from app.core.livekit.token_service import TokenService
from app.schemas.rooms import RoomCreate, RoomCreationResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.post("", response_model=RoomCreationResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
        room_data: RoomCreate,
        room_service: RoomService = Depends(get_room_service),
        token_service: TokenService = Depends(get_token_service),
) -> RoomCreationResponse:
    """
    Create a new LiveKit room (public API, no auth).

    Args:
        room_data: Room creation data including session_id.

    Returns:
        RoomCreationResponse: The created room with participant ID, access token and creation time.
    """
    try:
        # Use client-provided session_id directly (public API)
        session_id = room_data.session_id

        # Format room name and participant identity
        room_id = f"room_{session_id}"
        participant_id = f"user_{session_id}"

        # Create metadata JSON with the session info
        metadata = json.dumps({"session_id": session_id})

        # Create the room with the formatted room ID
        room = await room_service.create_room(name=room_id, metadata=metadata)

        # Generate access token for the participant
        access_token = token_service.create_participant_token(
            room_name=room_id,
            participant_identity=participant_id,
            participant_name="User",  # Default display name
        )

        # Convert creation_time (assumed seconds) to ISO UTC
        created_at = datetime.utcfromtimestamp(room.creation_time).isoformat() + "Z"

        logger.info(f"Room created: {room_id}, session_id: {session_id}, creation time: {created_at}")

        # Return response
        return RoomCreationResponse(
            room_id=room.name,
            participant_id=participant_id,
            access_token=access_token,
            created_at=created_at
        )
    except Exception as e:
        logger.exception(f"Failed to create room: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create room: {str(e)}"
        )