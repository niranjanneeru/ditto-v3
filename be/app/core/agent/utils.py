"""
Utility functions for the LangGraph cold outreach workflow.
"""

import json
import logging

logger = logging.getLogger(__name__)


async def send_sim_event(room, payload: dict, topic: str = "sim:event", identities: list[str] | None = None, reliable: bool = True):
    """Send a SIM event to the room participants."""
    data = json.dumps(payload)
    await room.local_participant.publish_data(
        data,
        reliable=reliable,
        destination_identities=identities or [],
        topic=topic
    )
