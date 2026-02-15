"""Tests for FormService business logic."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from bson import ObjectId

from app.models.form import FormCreate, FormFieldSchema, FormUpdate
from app.services.form_service import FormService

from tests.helpers import create_async_cursor


@pytest.fixture
def form_service(mock_mongodb):
    """Create FormService instance with mocked DB."""
    return FormService(mock_mongodb["db"])


class TestCreateForm:
    """Test FormService.create_form."""

    async def test_create_form_success(
        self, form_service, mock_mongodb, sample_form_data
    ):
        """Create form inserts document and returns FormInDB."""
        mock_mongodb["forms"].insert_one = AsyncMock()

        result = await form_service.create_form(sample_form_data)

        mock_mongodb["forms"].insert_one.assert_awaited_once()
        assert result.title == "Test Form"
        assert result.view_count == 0
        assert result.submission_count == 0
        assert result.created_at is not None

    async def test_create_form_document_structure(
        self, form_service, mock_mongodb, sample_form_data
    ):
        """Created document has expected fields."""
        mock_mongodb["forms"].insert_one = AsyncMock()

        await form_service.create_form(sample_form_data)

        call_args = mock_mongodb["forms"].insert_one.call_args[0][0]
        assert "_id" in call_args
        assert isinstance(call_args["_id"], ObjectId)
        assert call_args["title"] == "Test Form"
        assert call_args["view_count"] == 0
        assert call_args["submission_count"] == 0
        assert call_args["updated_at"] is None


class TestGetFormById:
    """Test FormService.get_form_by_id."""

    async def test_get_form_found(self, form_service, mock_mongodb, sample_form_doc):
        """Returns FormInDB when document exists."""
        mock_mongodb["forms"].find_one = AsyncMock(return_value=sample_form_doc)

        result = await form_service.get_form_by_id("507f1f77bcf86cd799439011")

        assert result is not None
        assert result.title == "Test Form"

    async def test_get_form_not_found(self, form_service, mock_mongodb):
        """Returns None when document does not exist."""
        mock_mongodb["forms"].find_one = AsyncMock(return_value=None)

        result = await form_service.get_form_by_id("507f1f77bcf86cd799439011")

        assert result is None

    async def test_get_form_invalid_id(self, form_service):
        """Raises ValueError for invalid ObjectId."""
        with pytest.raises(ValueError, match="Invalid ObjectId"):
            await form_service.get_form_by_id("not-valid")


class TestGetAllForms:
    """Test FormService.get_all_forms."""

    async def test_get_all_forms_empty(self, form_service, mock_mongodb):
        """Returns empty list when no forms exist."""
        mock_mongodb["forms"].count_documents = AsyncMock(return_value=0)
        cursor = create_async_cursor([])
        mock_mongodb["forms"].find = MagicMock(return_value=cursor)

        forms, total = await form_service.get_all_forms()

        assert forms == []
        assert total == 0

    async def test_get_all_forms_with_results(
        self, form_service, mock_mongodb, sample_form_doc
    ):
        """Returns forms and total count."""
        mock_mongodb["forms"].count_documents = AsyncMock(return_value=1)
        cursor = create_async_cursor([sample_form_doc])
        mock_mongodb["forms"].find = MagicMock(return_value=cursor)

        forms, total = await form_service.get_all_forms()

        assert len(forms) == 1
        assert total == 1
        assert forms[0].title == "Test Form"

    async def test_get_all_forms_active_only(
        self, form_service, mock_mongodb, sample_form_doc
    ):
        """Passes active_only filter to query."""
        mock_mongodb["forms"].count_documents = AsyncMock(return_value=1)
        cursor = create_async_cursor([sample_form_doc])
        mock_mongodb["forms"].find = MagicMock(return_value=cursor)

        await form_service.get_all_forms(active_only=True)

        # Verify filter passed to count_documents
        mock_mongodb["forms"].count_documents.assert_awaited_once_with(
            {"is_active": True}
        )

    async def test_get_all_forms_invalid_skip(self, form_service):
        """Raises ValueError for negative skip."""
        with pytest.raises(ValueError, match="skip must be >= 0"):
            await form_service.get_all_forms(skip=-1)

    async def test_get_all_forms_invalid_limit(self, form_service):
        """Raises ValueError for limit out of range."""
        with pytest.raises(ValueError, match="limit must be between 1 and 100"):
            await form_service.get_all_forms(limit=0)


class TestUpdateForm:
    """Test FormService.update_form."""

    async def test_update_form_success(
        self, form_service, mock_mongodb, sample_form_doc
    ):
        """Updates form and returns updated FormInDB."""
        updated_doc = {**sample_form_doc, "title": "Updated Title"}
        mock_mongodb["forms"].find_one_and_update = AsyncMock(return_value=updated_doc)

        update_data = FormUpdate(title="Updated Title")
        result = await form_service.update_form("507f1f77bcf86cd799439011", update_data)

        assert result is not None
        assert result.title == "Updated Title"

    async def test_update_form_not_found(self, form_service, mock_mongodb):
        """Returns None when form does not exist."""
        mock_mongodb["forms"].find_one_and_update = AsyncMock(return_value=None)

        update_data = FormUpdate(title="Updated")
        result = await form_service.update_form("507f1f77bcf86cd799439011", update_data)

        assert result is None

    async def test_update_form_empty_update(
        self, form_service, mock_mongodb, sample_form_doc
    ):
        """Empty update returns current form without modifying."""
        mock_mongodb["forms"].find_one = AsyncMock(return_value=sample_form_doc)

        update_data = FormUpdate()
        result = await form_service.update_form("507f1f77bcf86cd799439011", update_data)

        assert result is not None
        # find_one_and_update should not have been called
        mock_mongodb["forms"].find_one_and_update.assert_not_awaited()


class TestDeleteForm:
    """Test FormService.delete_form."""

    async def test_delete_form_success(self, form_service, mock_mongodb):
        """Returns True when form is deleted."""
        mock_result = MagicMock()
        mock_result.deleted_count = 1
        mock_mongodb["forms"].delete_one = AsyncMock(return_value=mock_result)

        result = await form_service.delete_form("507f1f77bcf86cd799439011")

        assert result is True

    async def test_delete_form_not_found(self, form_service, mock_mongodb):
        """Returns False when form does not exist."""
        mock_result = MagicMock()
        mock_result.deleted_count = 0
        mock_mongodb["forms"].delete_one = AsyncMock(return_value=mock_result)

        result = await form_service.delete_form("507f1f77bcf86cd799439011")

        assert result is False

    async def test_delete_form_invalid_id(self, form_service):
        """Raises ValueError for invalid ObjectId."""
        with pytest.raises(ValueError, match="Invalid ObjectId"):
            await form_service.delete_form("invalid-id")


class TestIncrementViewCount:
    """Test FormService.increment_view_count."""

    async def test_increment_view_count_success(self, form_service, mock_mongodb):
        """Returns True when view count is incremented."""
        mock_result = MagicMock()
        mock_result.matched_count = 1
        mock_mongodb["forms"].update_one = AsyncMock(return_value=mock_result)

        result = await form_service.increment_view_count("507f1f77bcf86cd799439011")

        assert result is True

    async def test_increment_view_count_not_found(self, form_service, mock_mongodb):
        """Returns False when form does not exist."""
        mock_result = MagicMock()
        mock_result.matched_count = 0
        mock_mongodb["forms"].update_one = AsyncMock(return_value=mock_result)

        result = await form_service.increment_view_count("507f1f77bcf86cd799439011")

        assert result is False
