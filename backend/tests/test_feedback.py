"""Tests for feedback endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_submit_positive_feedback(client: AsyncClient, test_user: dict):
    """Submit positive feedback on an assistant message."""
    # Send a chat to get an assistant message
    chat_resp = await client.post(
        "/api/chat",
        json={"message": "How do returns work?"},
        headers=test_user["headers"],
    )
    assistant_msg_id = chat_resp.json()["assistant_message"]["id"]

    # Submit feedback
    response = await client.post(
        f"/api/messages/{assistant_msg_id}/feedback",
        json={"rating": "positive", "comment": "Very helpful!"},
        headers=test_user["headers"],
    )
    assert response.status_code == 201
    data = response.json()
    assert data["rating"] == "positive"
    assert data["comment"] == "Very helpful!"


@pytest.mark.asyncio
async def test_submit_negative_feedback(client: AsyncClient, test_user: dict):
    chat_resp = await client.post(
        "/api/chat",
        json={"message": "Tell me about shipping"},
        headers=test_user["headers"],
    )
    assistant_msg_id = chat_resp.json()["assistant_message"]["id"]

    response = await client.post(
        f"/api/messages/{assistant_msg_id}/feedback",
        json={"rating": "negative"},
        headers=test_user["headers"],
    )
    assert response.status_code == 201
    assert response.json()["rating"] == "negative"
    assert response.json()["comment"] is None


@pytest.mark.asyncio
async def test_update_existing_feedback(client: AsyncClient, test_user: dict):
    """Submitting feedback again should update, not error."""
    chat_resp = await client.post(
        "/api/chat",
        json={"message": "Payment help"},
        headers=test_user["headers"],
    )
    assistant_msg_id = chat_resp.json()["assistant_message"]["id"]

    # First feedback
    await client.post(
        f"/api/messages/{assistant_msg_id}/feedback",
        json={"rating": "negative"},
        headers=test_user["headers"],
    )

    # Update feedback
    response = await client.post(
        f"/api/messages/{assistant_msg_id}/feedback",
        json={"rating": "positive", "comment": "Actually, this was helpful."},
        headers=test_user["headers"],
    )
    assert response.status_code == 201
    assert response.json()["rating"] == "positive"


@pytest.mark.asyncio
async def test_feedback_on_user_message_rejected(client: AsyncClient, test_user: dict):
    """Feedback should only be allowed on assistant messages."""
    chat_resp = await client.post(
        "/api/chat",
        json={"message": "Hello"},
        headers=test_user["headers"],
    )
    user_msg_id = chat_resp.json()["user_message"]["id"]

    response = await client.post(
        f"/api/messages/{user_msg_id}/feedback",
        json={"rating": "positive"},
        headers=test_user["headers"],
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_feedback_authorization(
    client: AsyncClient, test_user: dict, other_user: dict
):
    """User B cannot submit feedback on User A's messages."""
    chat_resp = await client.post(
        "/api/chat",
        json={"message": "Private question"},
        headers=test_user["headers"],
    )
    assistant_msg_id = chat_resp.json()["assistant_message"]["id"]

    response = await client.post(
        f"/api/messages/{assistant_msg_id}/feedback",
        json={"rating": "positive"},
        headers=other_user["headers"],
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_feedback_invalid_rating(client: AsyncClient, test_user: dict):
    chat_resp = await client.post(
        "/api/chat",
        json={"message": "Test"},
        headers=test_user["headers"],
    )
    assistant_msg_id = chat_resp.json()["assistant_message"]["id"]

    response = await client.post(
        f"/api/messages/{assistant_msg_id}/feedback",
        json={"rating": "maybe"},
        headers=test_user["headers"],
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_feedback_nonexistent_message(client: AsyncClient, test_user: dict):
    import uuid
    fake_id = str(uuid.uuid4())
    response = await client.post(
        f"/api/messages/{fake_id}/feedback",
        json={"rating": "positive"},
        headers=test_user["headers"],
    )
    assert response.status_code == 404
