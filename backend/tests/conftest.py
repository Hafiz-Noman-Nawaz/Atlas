"""
Test fixtures — async client, test database, and authentication helpers.

Uses an in-memory SQLite database for tests so no PostgreSQL is needed.
The async SQLite driver (aiosqlite) mirrors the async interface of asyncpg.
"""

import asyncio
import uuid
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.core.security import create_access_token, hash_password
from app.main import app
from app.ml.mock_chatbot import MockChatbot
from app.api.chat import set_chatbot
from app.models.user import User

# Test database — in-memory SQLite
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session_factory = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session")
def event_loop():
    """Create a single event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    """Create all tables before each test, drop after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with test_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# Override the database dependency for all tests
app.dependency_overrides[get_db] = override_get_db

# Initialize the chatbot for tests
set_chatbot(MockChatbot())


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client for testing API endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def test_user() -> dict:
    """Create a test user directly in the database and return user info + token."""
    user_id = uuid.uuid4()
    async with test_session_factory() as session:
        user = User(
            id=user_id,
            name="Test User",
            email=f"test_{uuid.uuid4().hex[:8]}@example.com",
            password_hash=hash_password("testpassword123"),
        )
        session.add(user)
        await session.commit()

    token = create_access_token(subject=str(user_id))
    return {
        "id": user_id,
        "name": "Test User",
        "email": user.email,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest_asyncio.fixture
async def other_user() -> dict:
    """Create a second test user for authorization testing."""
    user_id = uuid.uuid4()
    async with test_session_factory() as session:
        user = User(
            id=user_id,
            name="Other User",
            email=f"other_{uuid.uuid4().hex[:8]}@example.com",
            password_hash=hash_password("otherpassword123"),
        )
        session.add(user)
        await session.commit()

    token = create_access_token(subject=str(user_id))
    return {
        "id": user_id,
        "name": "Other User",
        "email": user.email,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }
