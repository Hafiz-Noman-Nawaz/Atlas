"""
Conversation CRUD endpoints.
"""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.conversation import (
    ConversationCreate,
    ConversationListResponse,
    ConversationResponse,
    ConversationUpdate,
)
from app.services import conversation_service

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get(
    "",
    response_model=ConversationListResponse,
    summary="List conversations",
)
async def list_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await conversation_service.list_conversations(
        db, current_user.id, skip=skip, limit=limit
    )


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=201,
    summary="Create a conversation",
)
async def create_conversation(
    data: ConversationCreate = ConversationCreate(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await conversation_service.create_conversation(db, current_user.id, data)


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
    summary="Get a conversation",
)
async def get_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await conversation_service.get_conversation_response(
        db, conversation_id, current_user.id
    )


@router.patch(
    "/{conversation_id}",
    response_model=ConversationResponse,
    summary="Update conversation title",
)
async def update_conversation(
    conversation_id: uuid.UUID,
    data: ConversationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await conversation_service.update_conversation(
        db, conversation_id, current_user.id, data
    )


@router.delete(
    "/{conversation_id}",
    status_code=204,
    summary="Delete a conversation",
)
async def delete_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await conversation_service.delete_conversation(
        db, conversation_id, current_user.id
    )
