"""Feedback request and response schemas."""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class FeedbackRating(str, Enum):
    positive = "positive"
    negative = "negative"


class FeedbackCreate(BaseModel):
    rating: FeedbackRating
    comment: str | None = Field(default=None, max_length=1000)


class FeedbackResponse(BaseModel):
    id: uuid.UUID
    message_id: uuid.UUID
    rating: str
    comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
