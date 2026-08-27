"""Chat request and response schemas."""

import uuid

from pydantic import BaseModel, Field

from app.schemas.message import MessageResponse


class ChatRequest(BaseModel):
    conversation_id: uuid.UUID | None = Field(
        default=None,
        description="Existing conversation ID. If null, a new conversation is created.",
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's message to the chatbot.",
    )


class ChatResponse(BaseModel):
    conversation_id: uuid.UUID
    user_message: MessageResponse
    assistant_message: MessageResponse
