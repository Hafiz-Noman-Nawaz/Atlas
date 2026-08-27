"""
Chat service — orchestrates user message → chatbot response → database persistence.

This is the central service that connects the API to the chatbot interface.
It does not know or care which chatbot implementation is being used.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.base import ChatbotInterface
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.message import MessageResponse


async def send_message(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: ChatRequest,
    chatbot: ChatbotInterface,
) -> ChatResponse:
    """
    Process a chat message:
    1. Resolve or create the conversation
    2. Save the user's message
    3. Build conversation history for context
    4. Call the chatbot interface
    5. Save the assistant's response
    6. Return both messages
    """

    # 1. Resolve or create conversation
    if data.conversation_id:
        # Verify ownership
        stmt = select(Conversation).where(
            Conversation.id == data.conversation_id,
            Conversation.user_id == user_id,
        )
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()
        if not conversation:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )
        # Update the conversation timestamp
        conversation.updated_at = datetime.now(timezone.utc)
    else:
        # Create a new conversation with the first few words as the title
        title = data.message[:50].strip()
        if len(data.message) > 50:
            title += "..."
        conversation = Conversation(
            user_id=user_id,
            title=title,
        )
        db.add(conversation)
        await db.flush()

    # 2. Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=data.message,
    )
    db.add(user_message)
    await db.flush()

    # 3. Build conversation history for context
    history_stmt = (
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(20)  # Last 20 messages for context
    )
    result = await db.execute(history_stmt)
    history_messages = result.scalars().all()

    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in reversed(history_messages)
    ]

    # 4. Call the chatbot
    chatbot_response = await chatbot.get_response(
        user_message=data.message,
        conversation_history=conversation_history,
    )

    # 5. Save assistant message
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=chatbot_response.message,
        intent=chatbot_response.intent,
        confidence=chatbot_response.confidence,
    )
    db.add(assistant_message)
    await db.flush()

    # 6. Return response
    return ChatResponse(
        conversation_id=conversation.id,
        user_message=MessageResponse(
            id=user_message.id,
            conversation_id=conversation.id,
            role=user_message.role,
            content=user_message.content,
            intent=None,
            confidence=None,
            created_at=user_message.created_at,
        ),
        assistant_message=MessageResponse(
            id=assistant_message.id,
            conversation_id=conversation.id,
            role=assistant_message.role,
            content=assistant_message.content,
            intent=assistant_message.intent,
            confidence=assistant_message.confidence,
            created_at=assistant_message.created_at,
        ),
    )


async def get_messages(
    db: AsyncSession,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 50,
) -> list[MessageResponse]:
    """
    Get paginated messages for a conversation, verifying user ownership.
    Returns messages in chronological order (oldest first).
    """

    # Verify conversation ownership
    conv_stmt = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id,
    )
    result = await db.execute(conv_stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    # Fetch messages
    msg_stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(msg_stmt)
    messages = result.scalars().all()

    return [
        MessageResponse(
            id=msg.id,
            conversation_id=msg.conversation_id,
            role=msg.role,
            content=msg.content,
            intent=msg.intent,
            confidence=msg.confidence,
            created_at=msg.created_at,
        )
        for msg in messages
    ]
