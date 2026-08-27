"""Tests for chat endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_send_message_new_conversation(client: AsyncClient, test_user: dict):
    """Sending a message without a conversation_id should create one."""
    response = await client.post(
        "/api/chat",
        json={"message": "Hello, how are you?"},
        headers=test_user["headers"],
    )
    assert response.status_code == 200
    data = response.json()

    assert "conversation_id" in data
    assert data["user_message"]["role"] == "user"
    assert data["user_message"]["content"] == "Hello, how are you?"
    assert data["assistant_message"]["role"] == "assistant"
    assert len(data["assistant_message"]["content"]) > 0


@pytest.mark.asyncio
async def test_send_message_existing_conversation(client: AsyncClient, test_user: dict):
    """Sending a message to an existing conversation."""
    # Create conversation first
    create_resp = await client.post(
        "/api/conversations",
        json={"title": "Chat test"},
        headers=test_user["headers"],
    )
    conv_id = create_resp.json()["id"]

    # Send message
    response = await client.post(
        "/api/chat",
        json={"conversation_id": conv_id, "message": "Track my order"},
        headers=test_user["headers"],
    )
    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == conv_id


@pytest.mark.asyncio
async def test_get_messages(client: AsyncClient, test_user: dict):
    """Get messages for a conversation after sending a chat."""
    # Send a message (auto-creates conversation)
    chat_resp = await client.post(
        "/api/chat",
        json={"message": "What are your return policies?"},
        headers=test_user["headers"],
    )
    conv_id = chat_resp.json()["conversation_id"]

    # Get messages
    response = await client.get(
        f"/api/conversations/{conv_id}/messages",
        headers=test_user["headers"],
    )
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) == 2  # user + assistant
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"


@pytest.mark.asyncio
async def test_chat_authorization(client: AsyncClient, test_user: dict, other_user: dict):
    """User B cannot send messages to User A's conversation."""
    import uuid

    # User A creates a conversation
    create_resp = await client.post(
        "/api/conversations",
        json={"title": "Private chat"},
        headers=test_user["headers"],
    )
    conv_id = create_resp.json()["id"]

    # User B tries to send a message
    response = await client.post(
        "/api/chat",
        json={"conversation_id": conv_id, "message": "Sneaky message"},
        headers=other_user["headers"],
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_chat_messages_authorization(
    client: AsyncClient, test_user: dict, other_user: dict
):
    """User B cannot read User A's messages."""
    chat_resp = await client.post(
        "/api/chat",
        json={"message": "Private message"},
        headers=test_user["headers"],
    )
    conv_id = chat_resp.json()["conversation_id"]

    response = await client.get(
        f"/api/conversations/{conv_id}/messages",
        headers=other_user["headers"],
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_chat_empty_message(client: AsyncClient, test_user: dict):
    """Empty messages should be rejected."""
    response = await client.post(
        "/api/chat",
        json={"message": ""},
        headers=test_user["headers"],
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_unauthenticated(client: AsyncClient):
    response = await client.post(
        "/api/chat",
        json={"message": "Hello"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_multiple_messages_in_conversation(client: AsyncClient, test_user: dict):
    """Multiple messages in the same conversation should accumulate."""
    # First message creates conversation
    resp1 = await client.post(
        "/api/chat",
        json={"message": "Hello"},
        headers=test_user["headers"],
    )
    conv_id = resp1.json()["conversation_id"]

    # Second message
    await client.post(
        "/api/chat",
        json={"conversation_id": conv_id, "message": "How do I track my order?"},
        headers=test_user["headers"],
    )

    # Third message
    await client.post(
        "/api/chat",
        json={"conversation_id": conv_id, "message": "Thanks!"},
        headers=test_user["headers"],
    )

    # Check total messages
    response = await client.get(
        f"/api/conversations/{conv_id}/messages",
        headers=test_user["headers"],
    )
    messages = response.json()
    assert len(messages) == 6  # 3 user + 3 assistant
