"""
Feedback endpoint — rate assistant messages.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.conversation import Conversation
from app.models.feedback import Feedback
from app.models.message import Message
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter(tags=["Feedback"])


@router.post(
    "/messages/{message_id}/feedback",
    response_model=FeedbackResponse,
    status_code=201,
    summary="Submit feedback on an assistant message",
)
async def create_feedback(
    message_id: uuid.UUID,
    data: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch the message
    msg_stmt = select(Message).where(Message.id == message_id)
    result = await db.execute(msg_stmt)
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found.",
        )

    # Only assistant messages can receive feedback
    if message.role != "assistant":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback can only be submitted for assistant messages.",
        )

    # Verify user owns the conversation
    conv_stmt = select(Conversation).where(
        Conversation.id == message.conversation_id,
        Conversation.user_id == current_user.id,
    )
    result = await db.execute(conv_stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found.",  # Don't reveal existence to non-owners
        )

    # Check for existing feedback
    existing_stmt = select(Feedback).where(Feedback.message_id == message_id)
    result = await db.execute(existing_stmt)
    existing = result.scalar_one_or_none()

    if existing:
        # Update existing feedback instead of erroring
        existing.rating = data.rating.value
        existing.comment = data.comment
        await db.flush()
        await db.refresh(existing)
        return FeedbackResponse(
            id=existing.id,
            message_id=existing.message_id,
            rating=existing.rating,
            comment=existing.comment,
            created_at=existing.created_at,
        )

    # Create new feedback
    feedback = Feedback(
        message_id=message_id,
        user_id=current_user.id,
        rating=data.rating.value,
        comment=data.comment,
    )
    db.add(feedback)
    await db.flush()

    return FeedbackResponse(
        id=feedback.id,
        message_id=feedback.message_id,
        rating=feedback.rating,
        comment=feedback.comment,
        created_at=feedback.created_at,
    )
