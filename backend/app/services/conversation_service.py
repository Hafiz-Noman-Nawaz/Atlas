"""
Conversation service — CRUD operations for conversations.
"""

import uuid

from fastapi import HTTPException, status
from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import (
    ConversationCreate,
    ConversationListResponse,
    ConversationResponse,
    ConversationUpdate,
)


async def list_conversations(
    db: AsyncSession,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 50,
) -> ConversationListResponse:
    """List all conversations for a user, newest first, with last message preview."""

    # Count total
    count_stmt = select(func.count()).select_from(Conversation).where(
        Conversation.user_id == user_id
    )
    total = (await db.execute(count_stmt)).scalar() or 0

    # Fetch conversations
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .options(selectinload(Conversation.messages))
        .order_by(Conversation.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    conversations = result.scalars().all()

    items = []
    for conv in conversations:
        last_msg = None
        if conv.messages:
            last_msg = conv.messages[-1].content[:100]  # Truncate preview

        items.append(
            ConversationResponse(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                last_message=last_msg,
            )
        )

    return ConversationListResponse(items=items, total=total)


async def create_conversation(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: ConversationCreate,
) -> ConversationResponse:
    """Create a new conversation."""

    conv = Conversation(
        user_id=user_id,
        title=data.title,
    )
    db.add(conv)
    await db.flush()

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        last_message=None,
    )


async def get_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Conversation:
    """
    Get a conversation by ID, ensuring it belongs to the requesting user.
    Returns the ORM model (used internally by chat service).
    """

    stmt = (
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()

    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )
    return conv


async def get_conversation_response(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
) -> ConversationResponse:
    """Get a conversation as a response schema."""
    conv = await get_conversation(db, conversation_id, user_id)
    last_msg = None
    if conv.messages:
        last_msg = conv.messages[-1].content[:100]

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        last_message=last_msg,
    )


async def update_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
    data: ConversationUpdate,
) -> ConversationResponse:
    """Update a conversation's title."""

    # Verify ownership
    conv = await get_conversation(db, conversation_id, user_id)

    conv.title = data.title
    await db.flush()
    await db.refresh(conv)

    last_msg = None
    if conv.messages:
        last_msg = conv.messages[-1].content[:100]

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        last_message=last_msg,
    )


async def delete_conversation(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
) -> None:
    """Delete a conversation and all its messages (cascade)."""

    # Verify ownership first
    await get_conversation(db, conversation_id, user_id)

    stmt = delete(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id,
    )
    await db.execute(stmt)
