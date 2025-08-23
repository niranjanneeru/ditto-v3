from pydantic import BaseModel, Field


class RoomCreationResponse(BaseModel):
    """Simplified schema for livekit creation response."""

    room_id: str = Field(..., description="Room ID")
    participant_id: str = Field(..., description="Participant ID")
    access_token: str = Field(..., description="LiveKit access token")
    created_at: str = Field(..., description="Room creation time in ISO format")


class RoomUpdate(BaseModel):
    """Schema for updating a livekit."""

    metadata: str = Field(..., description="New metadata for the livekit")


class RoomCreate(BaseModel):
    """Schema for creating a livekit."""

    session_id: str = Field(..., description="Client-provided session identifier")
