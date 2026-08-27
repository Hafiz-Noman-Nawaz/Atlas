"""Tests for authentication endpoints."""

import pytest
import pytest_asyncio
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post("/api/auth/register", json={
        "name": "New User",
        "email": "newuser@example.com",
        "password": "strongpassword123",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    # Register first user
    await client.post("/api/auth/register", json={
        "name": "User A",
        "email": "duplicate@example.com",
        "password": "password123a",
    })

    # Try to register with same email
    response = await client.post("/api/auth/register", json={
        "name": "User B",
        "email": "duplicate@example.com",
        "password": "password123b",
    })
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    response = await client.post("/api/auth/register", json={
        "name": "Bad Email",
        "email": "not-an-email",
        "password": "password123",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_short_password(client: AsyncClient):
    response = await client.post("/api/auth/register", json={
        "name": "Short Pass",
        "email": "short@example.com",
        "password": "short",
    })
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    # Register
    await client.post("/api/auth/register", json={
        "name": "Login Test",
        "email": "login@example.com",
        "password": "mypassword123",
    })

    # Login
    response = await client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "mypassword123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post("/api/auth/register", json={
        "name": "Wrong Pass",
        "email": "wrongpass@example.com",
        "password": "correctpassword",
    })

    response = await client.post("/api/auth/login", json={
        "email": "wrongpass@example.com",
        "password": "incorrectpassword",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_email(client: AsyncClient):
    response = await client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "password123",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_authenticated(client: AsyncClient, test_user: dict):
    response = await client.get("/api/auth/me", headers=test_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]
    assert data["name"] == "Test User"
    assert "password_hash" not in data
    assert "password" not in data


@pytest.mark.asyncio
async def test_me_unauthenticated(client: AsyncClient):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert response.status_code == 401
