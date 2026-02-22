"""Tests for SubmissionService business logic."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.submission_service import (
    FormNotFoundError,
    FormValidationError,
    InvalidObjectIdError,
    SubmissionService,
)

from tests.helpers import SAMPLE_FORM_ID, create_async_cursor


@pytest.fixture
def mock_submission_collections(mock_mongodb):
    """Set up mock collections for submission service."""
    with patch(
        "app.services.submission_service.MongoDB.get_db",
        return_value=mock_mongodb["db"],
    ):
        yield mock_mongodb


def _make_active_form_doc(
    start_date=None,
    deadline=None,
    is_active=True,
):
    """Create a form document for validation tests."""
    return {
        "_id": SAMPLE_FORM_ID,
        "title": "Test Form",
        "description": "A test form",
        "questions": [
            {
                "field_id": "q1",
                "field_type": "text",
                "label": "Question",
                "placeholder": None,
                "required": True,
                "options": None,
                "validation": None,
            }
        ],
        "start_date": start_date,
        "deadline": deadline,
        "is_active": is_active,
        "created_at": datetime(2025, 6, 15, 12, 0, 0),
        "updated_at": None,
        "view_count": 0,
        "submission_count": 0,
    }


class TestCreateSubmission:
    """Test SubmissionService.create_submission."""

    async def test_create_submission_success(
        self, mock_submission_collections, sample_submission_data
    ):
        """Creates submission when form is valid and active."""
        form_doc = _make_active_form_doc()
        mock_submission_collections["forms"].find_one = AsyncMock(return_value=form_doc)
        mock_submission_collections["submissions"].insert_one = AsyncMock()
        mock_submission_collections["forms"].update_one = AsyncMock()

        result = await SubmissionService.create_submission(sample_submission_data)

        assert result is not None
        assert result.respondent_email == "john@example.com"
        mock_submission_collections["submissions"].insert_one.assert_awaited_once()
        # Verify submission_count was incremented
        mock_submission_collections["forms"].update_one.assert_awaited_once()

    async def test_create_submission_form_not_found(
        self, mock_submission_collections, sample_submission_data
    ):
        """Raises FormNotFoundError when form does not exist."""
        mock_submission_collections["forms"].find_one = AsyncMock(return_value=None)

        with pytest.raises(FormNotFoundError):
            await SubmissionService.create_submission(sample_submission_data)

    async def test_create_submission_form_inactive(
        self, mock_submission_collections, sample_submission_data
    ):
        """Raises FormValidationError when form is inactive."""
        form_doc = _make_active_form_doc(is_active=False)
        mock_submission_collections["forms"].find_one = AsyncMock(return_value=form_doc)

        with pytest.raises(FormValidationError, match="not active"):
            await SubmissionService.create_submission(sample_submission_data)

    async def test_create_submission_form_not_started(
        self, mock_submission_collections, sample_submission_data
    ):
        """Raises FormValidationError when form has not started yet."""
        future_date = datetime(2099, 12, 31, tzinfo=timezone.utc)
        form_doc = _make_active_form_doc(start_date=future_date)
        mock_submission_collections["forms"].find_one = AsyncMock(return_value=form_doc)

        with pytest.raises(FormValidationError, match="not started yet"):
            await SubmissionService.create_submission(sample_submission_data)

    async def test_create_submission_deadline_passed(
        self, mock_submission_collections, sample_submission_data
    ):
        """Raises FormValidationError when deadline has passed."""
        past_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
        form_doc = _make_active_form_doc(deadline=past_date)
        mock_submission_collections["forms"].find_one = AsyncMock(return_value=form_doc)

        with pytest.raises(FormValidationError, match="deadline has passed"):
            await SubmissionService.create_submission(sample_submission_data)


class TestGetSubmissionById:
    """Test SubmissionService.get_submission_by_id."""

    async def test_get_submission_found(
        self, mock_submission_collections, sample_submission_doc
    ):
        """Returns SubmissionInDB when document exists."""
        mock_submission_collections["submissions"].find_one = AsyncMock(
            return_value=sample_submission_doc
        )

        result = await SubmissionService.get_submission_by_id(
            "507f1f77bcf86cd799439022"
        )

        assert result is not None
        assert result.respondent_email == "john@example.com"

    async def test_get_submission_not_found(self, mock_submission_collections):
        """Returns None when document does not exist."""
        mock_submission_collections["submissions"].find_one = AsyncMock(
            return_value=None
        )

        result = await SubmissionService.get_submission_by_id(
            "507f1f77bcf86cd799439022"
        )

        assert result is None

    async def test_get_submission_invalid_id(self, mock_submission_collections):
        """Raises InvalidObjectIdError for invalid ObjectId."""
        with pytest.raises(InvalidObjectIdError):
            await SubmissionService.get_submission_by_id("invalid-id")


class TestGetSubmissionsByFormId:
    """Test SubmissionService.get_submissions_by_form_id."""

    async def test_get_submissions_empty(self, mock_submission_collections):
        """Returns empty list when no submissions exist."""
        mock_submission_collections["submissions"].count_documents = AsyncMock(
            return_value=0
        )
        cursor = create_async_cursor([])
        mock_submission_collections["submissions"].find = MagicMock(return_value=cursor)

        submissions, total = await SubmissionService.get_submissions_by_form_id(
            str(SAMPLE_FORM_ID)
        )

        assert submissions == []
        assert total == 0

    async def test_get_submissions_with_results(
        self, mock_submission_collections, sample_submission_doc
    ):
        """Returns submissions and total count."""
        mock_submission_collections["submissions"].count_documents = AsyncMock(
            return_value=1
        )
        cursor = create_async_cursor([sample_submission_doc])
        mock_submission_collections["submissions"].find = MagicMock(return_value=cursor)

        submissions, total = await SubmissionService.get_submissions_by_form_id(
            str(SAMPLE_FORM_ID)
        )

        assert len(submissions) == 1
        assert total == 1

    async def test_get_submissions_invalid_form_id(self, mock_submission_collections):
        """Raises InvalidObjectIdError for invalid form ID."""
        with pytest.raises(InvalidObjectIdError):
            await SubmissionService.get_submissions_by_form_id("bad-id")
