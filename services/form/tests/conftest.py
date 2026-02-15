"""Pytest fixtures for form service tests."""

import os

# Must set required env vars BEFORE importing app modules,
# because app.config instantiates Settings() at import time.
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")

from collections.abc import AsyncGenerator, Generator
from datetime import datetime
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from bson import ObjectId
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

from app.config import Settings
from app.models.form import FormCreate, FormFieldSchema
from app.models.submission import SubmissionCreate
from tests.helpers import SAMPLE_FORM_ID, SAMPLE_SUBMISSION_ID


# Mock settings for testing
@pytest.fixture(autouse=True)
def mock_settings():
    """Mock settings for all tests."""
    test_settings = Settings(
        MONGODB_URI="mongodb://localhost:27017",
        DATABASE_NAME="test_db",
        HOST="0.0.0.0",
        PORT=8002,
        ENV="test",
    )
    with patch("app.config.settings", test_settings):
        with patch("app.db.mongodb.settings", test_settings):
            yield test_settings


@pytest.fixture
def mock_mongodb():
    """Mock MongoDB collections."""
    forms_collection = MagicMock()
    submissions_collection = MagicMock()

    # Set up async methods for forms
    forms_collection.find_one = AsyncMock()
    forms_collection.insert_one = AsyncMock()
    forms_collection.update_one = AsyncMock()
    forms_collection.delete_one = AsyncMock()
    forms_collection.find_one_and_update = AsyncMock()
    forms_collection.count_documents = AsyncMock(return_value=0)
    forms_collection.find = MagicMock()

    # Set up async methods for submissions
    submissions_collection.find_one = AsyncMock()
    submissions_collection.insert_one = AsyncMock()
    submissions_collection.update_one = AsyncMock()
    submissions_collection.count_documents = AsyncMock(return_value=0)
    submissions_collection.find = MagicMock()

    mock_db = MagicMock()
    mock_db.__getitem__ = MagicMock(
        side_effect=lambda x: {
            "forms": forms_collection,
            "submissions": submissions_collection,
        }.get(x, MagicMock())
    )

    mock_client = MagicMock()
    mock_client.__getitem__ = MagicMock(return_value=mock_db)

    with patch("app.db.mongodb.MongoDB.client", mock_client):
        with patch("app.db.mongodb.MongoDB.get_db", return_value=mock_db):
            yield {
                "db": mock_db,
                "forms": forms_collection,
                "submissions": submissions_collection,
            }


@pytest.fixture
def sample_form_data() -> FormCreate:
    """Sample form creation data."""
    return FormCreate(
        title="Test Form",
        description="A test form for unit testing",
        questions=[
            FormFieldSchema(
                field_id="name",
                field_type="text",
                label="Full Name",
                placeholder="Enter your name",
                required=True,
            ),
            FormFieldSchema(
                field_id="department",
                field_type="select",
                label="Department",
                required=True,
                options=["Engineering", "Design", "Marketing"],
            ),
        ],
        is_active=True,
    )


@pytest.fixture
def sample_form_doc() -> dict[str, Any]:
    """Sample form document in DB format."""
    return {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "title": "Test Form",
        "description": "A test form for unit testing",
        "questions": [
            {
                "field_id": "name",
                "field_type": "text",
                "label": "Full Name",
                "placeholder": "Enter your name",
                "required": True,
                "options": None,
                "validation": None,
            },
            {
                "field_id": "department",
                "field_type": "select",
                "label": "Department",
                "placeholder": None,
                "required": True,
                "options": ["Engineering", "Design", "Marketing"],
                "validation": None,
            },
        ],
        "start_date": None,
        "deadline": None,
        "is_active": True,
        "created_at": datetime(2025, 6, 15, 12, 0, 0),
        "updated_at": None,
        "view_count": 0,
        "submission_count": 0,
    }


@pytest.fixture
def sample_submission_data() -> SubmissionCreate:
    """Sample submission creation data."""
    return SubmissionCreate(
        form_id=SAMPLE_FORM_ID,
        answers={"name": "John Doe", "department": "Engineering"},
        respondent_email="john@example.com",
        respondent_name="John Doe",
    )


@pytest.fixture
def sample_submission_doc() -> dict[str, Any]:
    """Sample submission document in DB format."""
    return {
        "_id": SAMPLE_SUBMISSION_ID,
        "form_id": SAMPLE_FORM_ID,
        "answers": {"name": "John Doe", "department": "Engineering"},
        "respondent_email": "john@example.com",
        "respondent_name": "John Doe",
        "submitted_at": datetime(2025, 6, 16, 10, 0, 0),
    }


@pytest.fixture
async def async_client(mock_mongodb) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client for API testing."""
    from app.main import app

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
