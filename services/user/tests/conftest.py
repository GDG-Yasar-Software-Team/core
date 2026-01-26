"""Pytest fixtures for user service tests."""

from collections.abc import AsyncGenerator, Generator
from datetime import datetime
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

from app.config import Settings
from app.models.user import User

# Test token constant
TEST_API_TOKEN = "test-api-token-12345"


@pytest.fixture
def valid_api_token() -> str:
    """Return a valid test API token."""
    return TEST_API_TOKEN


# Mock settings for testing
@pytest.fixture(autouse=True)
def mock_settings():
    """Mock settings for all tests."""
    test_settings = Settings(
        MONGODB_URI="mongodb://localhost:27017",
        DATABASE_NAME="test_db",
        USERS_COLLECTION="test_users",
        FORM_SERVICE_TOKEN=TEST_API_TOKEN,
        MAIL_SERVICE_TOKEN="mail-service-token",
        FORM_FRONTEND_TOKEN="form-frontend-token",
        ENV="test",
    )
    with patch("app.config.settings", test_settings):
        with patch("app.config.get_settings", return_value=test_settings):
            with patch("app.db.mongodb.settings", test_settings):
                with patch("app.repositories.user_repository.settings", test_settings):
                    with patch("app.auth.api_key.settings", test_settings):
                        yield test_settings


@pytest.fixture
def mock_mongodb():
    """Mock MongoDB collections."""
    users_collection = MagicMock()

    # Set up async methods
    users_collection.find_one = AsyncMock()
    users_collection.insert_one = AsyncMock()
    users_collection.update_one = AsyncMock()
    users_collection.find = MagicMock()

    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(
        side_effect=lambda x: {
            "test_users": users_collection,
        }.get(x, MagicMock())
    )

    mock_client = MagicMock()
    mock_client.__getitem__ = MagicMock(return_value=mock_db)

    with patch("app.db.mongodb.MongoDB.client", mock_client):
        with patch("app.db.mongodb.MongoDB.get_db", return_value=mock_db):
            yield {
                "db": mock_db,
                "users": users_collection,
            }


@pytest.fixture
def sample_user_data() -> list[User]:
    """Sample User instances for testing."""
    return [
        User(email="user1@example.com", name="User One"),
        User(email="student@stu.yasar.edu.tr", name="Yasar Student"),
        User(
            email="user2@example.com",
            name="User Two",
            section="Computer Engineering",
            is_subscribed=False,
        ),
    ]


@pytest.fixture
def sample_user_doc() -> dict[str, Any]:
    """Sample user document in DB format."""
    return {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "email": "user1@example.com",
        "name": "User One",
        "is_yasar_student": False,
        "section": None,
        "submitted_form_ids": [],
        "submitted_form_count": 0,
        "received_mail_ids": [],
        "received_mail_count": 0,
        "is_subscribed": True,
        "unsubscribed_at": None,
        "created_at": datetime(2025, 1, 15, 12, 0, 0),
        "updated_at": None,
    }


@pytest.fixture
def sample_users_docs() -> list[dict[str, Any]]:
    """Sample user documents in DB format."""
    return [
        {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "user1@example.com",
            "name": "User One",
            "is_yasar_student": False,
            "section": None,
            "submitted_form_ids": [],
            "submitted_form_count": 0,
            "received_mail_ids": [],
            "received_mail_count": 0,
            "is_subscribed": True,
            "unsubscribed_at": None,
            "created_at": datetime(2025, 1, 15, 12, 0, 0),
            "updated_at": None,
        },
        {
            "_id": ObjectId("507f1f77bcf86cd799439012"),
            "email": "student@stu.yasar.edu.tr",
            "name": "Yasar Student",
            "is_yasar_student": True,
            "section": "Engineering",
            "submitted_form_ids": [ObjectId("507f1f77bcf86cd799439030")],
            "submitted_form_count": 1,
            "received_mail_ids": [],
            "received_mail_count": 0,
            "is_subscribed": True,
            "unsubscribed_at": None,
            "created_at": datetime(2025, 1, 16, 10, 0, 0),
            "updated_at": None,
        },
        {
            "_id": ObjectId("507f1f77bcf86cd799439013"),
            "email": "unsubscribed@example.com",
            "name": "Unsubscribed User",
            "is_yasar_student": False,
            "section": None,
            "submitted_form_ids": [],
            "submitted_form_count": 0,
            "received_mail_ids": [],
            "received_mail_count": 0,
            "is_subscribed": False,
            "unsubscribed_at": datetime(2025, 1, 17, 8, 0, 0),
            "created_at": datetime(2025, 1, 14, 9, 0, 0),
            "updated_at": datetime(2025, 1, 17, 8, 0, 0),
        },
    ]


@pytest.fixture
async def async_client(mock_mongodb) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client for API testing."""
    from app.main import app

    # Mock the lifespan events
    with patch("app.main.MongoDB.connect", new_callable=AsyncMock):
        with patch("app.main.MongoDB.close", new_callable=AsyncMock):
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test",
            ) as client:
                yield client


@pytest.fixture
def sync_client(mock_mongodb) -> Generator[TestClient, None, None]:
    """Sync HTTP client for API testing."""
    from app.main import app

    with patch("app.main.MongoDB.connect", new_callable=AsyncMock):
        with patch("app.main.MongoDB.close", new_callable=AsyncMock):
            with TestClient(app) as client:
                yield client


class MockAsyncCursor:
    """Mock async cursor that supports async for."""

    def __init__(self, docs: list[dict]):
        self.docs = docs
        self.index = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.index >= len(self.docs):
            raise StopAsyncIteration
        doc = self.docs[self.index]
        self.index += 1
        return doc

    def sort(self, *args, **kwargs):
        return self

    def skip(self, n):
        return self

    def limit(self, n):
        return self


def create_async_cursor(docs: list[dict]) -> MockAsyncCursor:
    """Create a mock async cursor that yields documents."""
    return MockAsyncCursor(docs)
