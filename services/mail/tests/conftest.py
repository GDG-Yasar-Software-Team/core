"""Pytest fixtures for mail service tests."""

from collections.abc import AsyncGenerator, Generator
from datetime import datetime
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

from app.config import Settings
from app.main import app
from app.models.campaign import CampaignCreate, ScheduledSend


# Mock settings for testing
@pytest.fixture(autouse=True)
def mock_settings():
    """Mock settings for all tests."""
    test_settings = Settings(
        MONGODB_URI="mongodb://localhost:27017",
        DATABASE_NAME="test_db",
        USERS_COLLECTION="test_users",
        CAMPAIGNS_COLLECTION="test_mails",
        SMTP_SERVER="localhost",
        SMTP_PORT=587,
        SENDER_ADDRESS="test@example.com",
        SMTP_PASSWORD="test_password",
        UNSUBSCRIBE_SECRET_KEY="test-secret-key-for-testing",
        ENV="test",
    )
    with patch("app.config.settings", test_settings):
        with patch("app.db.mongodb.settings", test_settings):
            with patch("app.repositories.user_repository.settings", test_settings):
                with patch(
                    "app.repositories.campaign_repository.settings", test_settings
                ):
                    with patch("app.services.email_service.settings", test_settings):
                        with patch(
                            "app.services.unsubscribe_service.settings", test_settings
                        ):
                            yield test_settings


@pytest.fixture
def mock_mongodb():
    """Mock MongoDB collections."""
    users_collection = MagicMock()
    campaigns_collection = MagicMock()

    # Set up async methods
    users_collection.find_one = AsyncMock()
    users_collection.insert_one = AsyncMock()
    users_collection.update_one = AsyncMock()
    campaigns_collection.find_one = AsyncMock()
    campaigns_collection.insert_one = AsyncMock()
    campaigns_collection.update_one = AsyncMock()

    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(
        side_effect=lambda x: {
            "test_users": users_collection,
            "test_mails": campaigns_collection,
        }.get(x, MagicMock())
    )

    mock_client = MagicMock()
    mock_client.__getitem__ = MagicMock(return_value=mock_db)

    with patch("app.db.mongodb.MongoDB.client", mock_client):
        with patch("app.db.mongodb.MongoDB.get_db", return_value=mock_db):
            yield {
                "db": mock_db,
                "users": users_collection,
                "campaigns": campaigns_collection,
            }


@pytest.fixture
def mock_smtp():
    """Mock SMTP server that tracks sent emails."""
    sent_emails = []

    class MockSMTP:
        def __init__(self, *args, **kwargs):
            pass

        def starttls(self):
            pass

        def login(self, user, password):
            pass

        def sendmail(self, from_addr, to_addr, msg):
            sent_emails.append({"from": from_addr, "to": to_addr, "msg": msg})

        def quit(self):
            pass

    with patch("app.services.email_service.smtplib.SMTP", MockSMTP):
        yield sent_emails


@pytest.fixture
def sample_users() -> list[dict[str, Any]]:
    """Sample user documents."""
    return [
        {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "user1@example.com",
            "isSubscribed": True,
        },
        {
            "_id": ObjectId("507f1f77bcf86cd799439012"),
            "email": "user2@example.com",
            "isSubscribed": True,
        },
        {
            "_id": ObjectId("507f1f77bcf86cd799439013"),
            "email": "user3@example.com",
            "isSubscribed": False,
        },
    ]


@pytest.fixture
def sample_campaign_data() -> CampaignCreate:
    """Sample campaign creation data."""
    return CampaignCreate(
        subject="Test Campaign",
        body_html="<h1>Hello</h1><p>Test body</p>",
        scheduled_sends=[
            ScheduledSend(time=datetime(2025, 1, 20, 10, 0, 0)),
            ScheduledSend(time=datetime(2025, 1, 21, 14, 0, 0), subject="Reminder"),
        ],
        use_custom_subjects=True,
    )


@pytest.fixture
def sample_campaign_doc() -> dict[str, Any]:
    """Sample campaign document in DB format."""
    return {
        "_id": ObjectId("507f1f77bcf86cd799439020"),
        "subject": "Test Campaign",
        "body_html": "<h1>Hello</h1>",
        "scheduled_sends": [
            {"time": datetime(2025, 1, 20, 10, 0, 0), "subject": None},
        ],
        "use_custom_subjects": False,
        "status": "scheduled",
        "executions": [],
        "executed_times": [],
        "created_at": datetime(2025, 1, 15, 12, 0, 0),
        "updated_at": None,
    }


@pytest.fixture
async def async_client(mock_mongodb) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client for API testing."""
    # Mock the lifespan events
    with patch("app.main.MongoDB.connect", new_callable=AsyncMock):
        with patch("app.main.MongoDB.close", new_callable=AsyncMock):
            with patch("app.main.SchedulerService.start"):
                with patch("app.main.SchedulerService.stop"):
                    async with AsyncClient(
                        transport=ASGITransport(app=app),
                        base_url="http://test",
                    ) as client:
                        yield client


@pytest.fixture
def sync_client(mock_mongodb) -> Generator[TestClient, None, None]:
    """Sync HTTP client for API testing."""
    with patch("app.main.MongoDB.connect", new_callable=AsyncMock):
        with patch("app.main.MongoDB.close", new_callable=AsyncMock):
            with patch("app.main.SchedulerService.start"):
                with patch("app.main.SchedulerService.stop"):
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
