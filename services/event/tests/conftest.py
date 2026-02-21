"""Pytest fixtures for event service tests."""

from collections.abc import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

from app.config import Settings

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
        EVENTS_COLLECTION="test_events",
        EVENT_SERVICE_TOKEN=TEST_API_TOKEN,
        ENV="test",
    )
    with patch("app.config.settings", test_settings):
        with patch("app.config.get_settings", return_value=test_settings):
            with patch("app.db.mongodb.settings", test_settings):
                yield test_settings


@pytest.fixture
def mock_mongodb():
    """Mock MongoDB collections."""
    events_collection = MagicMock()

    # Set up async methods
    events_collection.find_one = AsyncMock()
    events_collection.insert_one = AsyncMock()
    events_collection.update_one = AsyncMock()
    events_collection.delete_one = AsyncMock()
    events_collection.find = MagicMock()

    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(
        side_effect=lambda x: {
            "test_events": events_collection,
        }.get(x, MagicMock())
    )

    mock_client = MagicMock()
    mock_client.__getitem__ = MagicMock(return_value=mock_db)

    with patch("app.db.mongodb.MongoDB.client", mock_client):
        with patch("app.db.mongodb.MongoDB.get_db", return_value=mock_db):
            yield {
                "db": mock_db,
                "events": events_collection,
            }


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
