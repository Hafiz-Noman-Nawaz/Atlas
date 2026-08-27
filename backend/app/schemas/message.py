"""Message response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: str
    intent: str | None = None
    confidence: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
