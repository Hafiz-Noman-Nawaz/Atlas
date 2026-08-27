"""
Chat endpoints — send messages and retrieve message history.
"""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.ml.base import ChatbotInterface
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.message import MessageResponse
from app.services import chat_service

router = APIRouter(tags=["Chat"])

# The chatbot instance is injected at app startup (see main.py)
_chatbot: ChatbotInterface | None = None


def set_chatbot(chatbot: ChatbotInterface) -> None:
    """Called at app startup to inject the chatbot implementation."""
    global _chatbot
    _chatbot = chatbot


def get_chatbot() -> ChatbotInterface:
    """FastAPI dependency to access the chatbot instance."""
    if _chatbot is None:
        raise RuntimeError("Chatbot not initialized. Check app startup.")
    return _chatbot


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message and receive a chatbot response",
)
async def send_chat_message(
    data: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    chatbot: ChatbotInterface = Depends(get_chatbot),
):
    return await chat_service.send_message(db, current_user.id, data, chatbot)


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponse],
    summary="Get messages for a conversation",
)
async def get_messages(
    conversation_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await chat_service.get_messages(
        db, conversation_id, current_user.id, skip=skip, limit=limit
    )
