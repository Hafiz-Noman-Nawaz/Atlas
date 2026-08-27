"""Tests for conversation CRUD endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_conversation(client: AsyncClient, test_user: dict):
    response = await client.post(
        "/api/conversations",
        json={"title": "My first conversation"},
        headers=test_user["headers"],
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My first conversation"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_conversation_default_title(client: AsyncClient, test_user: dict):
    response = await client.post(
        "/api/conversations",
        headers=test_user["headers"],
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Conversation"


@pytest.mark.asyncio
async def test_list_conversations(client: AsyncClient, test_user: dict):
    # Create a few conversations
    for i in range(3):
        await client.post(
            "/api/conversations",
            json={"title": f"Conversation {i}"},
            headers=test_user["headers"],
        )

    response = await client.get("/api/conversations", headers=test_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert len(data["items"]) == 3


@pytest.mark.asyncio
async def test_get_conversation(client: AsyncClient, test_user: dict):
    # Create
    create_resp = await client.post(
        "/api/conversations",
        json={"title": "Get me"},
        headers=test_user["headers"],
    )
    conv_id = create_resp.json()["id"]

    # Get
    response = await client.get(
        f"/api/conversations/{conv_id}",
        headers=test_user["headers"],
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Get me"


@pytest.mark.asyncio
async def test_update_conversation(client: AsyncClient, test_user: dict):
    create_resp = await client.post(
        "/api/conversations",
        json={"title": "Old title"},
        headers=test_user["headers"],
    )
    conv_id = create_resp.json()["id"]

    response = await client.patch(
        f"/api/conversations/{conv_id}",
        json={"title": "New title"},
        headers=test_user["headers"],
    )
    assert response.status_code == 200
    assert response.json()["title"] == "New title"


@pytest.mark.asyncio
async def test_delete_conversation(client: AsyncClient, test_user: dict):
    create_resp = await client.post(
        "/api/conversations",
        json={"title": "Delete me"},
        headers=test_user["headers"],
    )
    conv_id = create_resp.json()["id"]

    # Delete
    response = await client.delete(
        f"/api/conversations/{conv_id}",
        headers=test_user["headers"],
    )
    assert response.status_code == 204

    # Verify it's gone
    response = await client.get(
        f"/api/conversations/{conv_id}",
        headers=test_user["headers"],
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_conversation_authorization(
    client: AsyncClient, test_user: dict, other_user: dict
):
    """User A cannot access User B's conversations."""
    # User A creates a conversation
    create_resp = await client.post(
        "/api/conversations",
        json={"title": "Private"},
        headers=test_user["headers"],
    )
    conv_id = create_resp.json()["id"]

    # User B tries to access it
    response = await client.get(
        f"/api/conversations/{conv_id}",
        headers=other_user["headers"],
    )
    assert response.status_code == 404

    # User B tries to update it
    response = await client.patch(
        f"/api/conversations/{conv_id}",
        json={"title": "Hacked"},
        headers=other_user["headers"],
    )
    assert response.status_code == 404

    # User B tries to delete it
    response = await client.delete(
        f"/api/conversations/{conv_id}",
        headers=other_user["headers"],
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_nonexistent_conversation(client: AsyncClient, test_user: dict):
    import uuid
    fake_id = str(uuid.uuid4())
    response = await client.get(
        f"/api/conversations/{fake_id}",
        headers=test_user["headers"],
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_conversations_unauthenticated(client: AsyncClient):
    response = await client.get("/api/conversations")
    assert response.status_code == 401
