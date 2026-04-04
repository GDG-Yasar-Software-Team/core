"""Tests for event repository."""

from datetime import datetime
from unittest.mock import MagicMock

import pytest
from bson import ObjectId

from app.repositories.event_repository import (
    EventNotFoundError,
    EventRepository,
)
from tests.conftest import create_async_cursor


class TestCreate:
    """Tests for EventRepository.create()."""

    async def test_inserts_document_and_returns_id(
        self, mock_mongodb, sample_event_data
    ):
        """Create inserts a document and returns the inserted ID as string."""
        expected_id = ObjectId("507f1f77bcf86cd799439011")
        mock_mongodb["events"].insert_one.return_value = MagicMock(
            inserted_id=expected_id
        )

        event_id = await EventRepository.create(sample_event_data)

        assert event_id == str(expected_id)
        assert isinstance(event_id, str)
        mock_mongodb["events"].insert_one.assert_called_once()

    async def test_document_structure(self, mock_mongodb, sample_event_data):
        """Create inserts a document with correct field structure."""
        mock_mongodb["events"].insert_one.return_value = MagicMock(
            inserted_id=ObjectId()
        )

        await EventRepository.create(sample_event_data)

        call_args = mock_mongodb["events"].insert_one.call_args[0][0]
        assert call_args["title"] == "GDG DevFest 2025"
        assert call_args["description"] == "Annual developer festival."
        assert call_args["place"] == "Yaşar University"
        assert call_args["image_url"] == "https://example.com/image.jpg"
        assert len(call_args["speakers"]) == 1
        assert call_args["speakers"][0]["name"] == "Jane Doe"
        assert call_args["tags"] == ["devfest", "gdg"]
        assert (
            call_args["registration_form_url"] == "https://forms.example.com/register"
        )
        assert call_args["event_type"] == "conference"

    async def test_sets_timestamps(self, mock_mongodb, sample_event_data):
        """Create sets created_at and updated_at=None."""
        mock_mongodb["events"].insert_one.return_value = MagicMock(
            inserted_id=ObjectId()
        )

        await EventRepository.create(sample_event_data)

        call_args = mock_mongodb["events"].insert_one.call_args[0][0]
        assert isinstance(call_args["created_at"], datetime)
        assert call_args["updated_at"] is None

    async def test_speakers_serialized_as_dicts(self, mock_mongodb, sample_event_data):
        """Create serializes Speaker models to dicts."""
        mock_mongodb["events"].insert_one.return_value = MagicMock(
            inserted_id=ObjectId()
        )

        await EventRepository.create(sample_event_data)

        call_args = mock_mongodb["events"].insert_one.call_args[0][0]
        assert isinstance(call_args["speakers"][0], dict)
        assert call_args["speakers"][0] == {
            "name": "Jane Doe",
            "title": "Engineer",
            "company": "Google",
        }


class TestGetById:
    """Tests for EventRepository.get_by_id()."""

    async def test_returns_event_when_found(self, mock_mongodb, sample_event_doc):
        """get_by_id returns EventInDB when document exists."""
        mock_mongodb["events"].find_one.return_value = sample_event_doc

        event = await EventRepository.get_by_id("507f1f77bcf86cd799439011")

        assert event is not None
        assert str(event.id) == "507f1f77bcf86cd799439011"
        assert event.title == "GDG DevFest 2025"
        assert event.tags == ["devfest", "gdg"]
        assert event.registration_form_url == "https://forms.example.com/register"
        assert event.event_type == "conference"

    async def test_returns_none_when_not_found(self, mock_mongodb):
        """get_by_id returns None when document does not exist."""
        mock_mongodb["events"].find_one.return_value = None
        event = await EventRepository.get_by_id("507f1f77bcf86cd799439011")
        assert event is None

    async def test_returns_none_for_invalid_id(self, mock_mongodb):
        """get_by_id returns None for invalid ObjectId string."""
        event = await EventRepository.get_by_id("invalid-id")
        assert event is None
        mock_mongodb["events"].find_one.assert_not_called()


class TestUpdate:
    """Tests for EventRepository.update()."""

    async def test_updates_fields_and_returns_event(
        self, mock_mongodb, sample_event_doc
    ):
        """Update applies $set and returns updated EventInDB."""
        from app.models.event import EventUpdate

        updated_doc = {**sample_event_doc, "title": "Updated Title"}
        mock_mongodb["events"].update_one.return_value = MagicMock(matched_count=1)
        mock_mongodb["events"].find_one.return_value = updated_doc

        update = EventUpdate(title="Updated Title")
        result = await EventRepository.update("507f1f77bcf86cd799439011", update)

        assert result.title == "Updated Title"
        mock_mongodb["events"].update_one.assert_called_once()

    async def test_sets_updated_at(self, mock_mongodb, sample_event_doc):
        """Update sets updated_at timestamp."""
        from app.models.event import EventUpdate

        mock_mongodb["events"].update_one.return_value = MagicMock(matched_count=1)
        mock_mongodb["events"].find_one.return_value = sample_event_doc

        update = EventUpdate(title="New Title")
        await EventRepository.update("507f1f77bcf86cd799439011", update)

        call_args = mock_mongodb["events"].update_one.call_args[0][1]
        assert "updated_at" in call_args["$set"]
        assert isinstance(call_args["$set"]["updated_at"], datetime)

    async def test_raises_not_found_for_missing_event(self, mock_mongodb):
        """Update raises EventNotFoundError when matched_count is 0."""
        from app.models.event import EventUpdate

        mock_mongodb["events"].update_one.return_value = MagicMock(matched_count=0)

        update = EventUpdate(title="New Title")
        with pytest.raises(EventNotFoundError):
            await EventRepository.update("507f1f77bcf86cd799439011", update)

    async def test_raises_not_found_for_invalid_id(self, mock_mongodb):
        """Update raises EventNotFoundError for invalid ObjectId."""
        from app.models.event import EventUpdate

        update = EventUpdate(title="New Title")
        with pytest.raises(EventNotFoundError):
            await EventRepository.update("invalid-id", update)

    async def test_empty_update_returns_current_event(
        self, mock_mongodb, sample_event_doc
    ):
        """Update with no fields returns the current event unchanged."""
        from app.models.event import EventUpdate

        mock_mongodb["events"].find_one.return_value = sample_event_doc

        update = EventUpdate()
        result = await EventRepository.update("507f1f77bcf86cd799439011", update)

        assert result.title == "GDG DevFest 2025"
        mock_mongodb["events"].update_one.assert_not_called()

    async def test_empty_update_raises_not_found_for_missing(self, mock_mongodb):
        """Update with no fields raises EventNotFoundError if missing."""
        from app.models.event import EventUpdate

        mock_mongodb["events"].find_one.return_value = None

        update = EventUpdate()
        with pytest.raises(EventNotFoundError):
            await EventRepository.update("507f1f77bcf86cd799439011", update)

    async def test_updates_speakers(self, mock_mongodb, sample_event_doc):
        """Update serializes speakers list correctly."""
        from app.models.event import EventUpdate, Speaker

        updated_doc = {
            **sample_event_doc,
            "speakers": [
                {"name": "New Speaker", "title": "CTO", "company": "StartupX"}
            ],
        }
        mock_mongodb["events"].update_one.return_value = MagicMock(matched_count=1)
        mock_mongodb["events"].find_one.return_value = updated_doc

        update = EventUpdate(
            speakers=[Speaker(name="New Speaker", title="CTO", company="StartupX")]
        )
        result = await EventRepository.update("507f1f77bcf86cd799439011", update)

        assert len(result.speakers) == 1
        assert result.speakers[0].name == "New Speaker"

    async def test_updates_tags(self, mock_mongodb, sample_event_doc):
        """Update persists tags correctly."""
        from app.models.event import EventUpdate

        updated_doc = {**sample_event_doc, "tags": ["new-tag"]}
        mock_mongodb["events"].update_one.return_value = MagicMock(matched_count=1)
        mock_mongodb["events"].find_one.return_value = updated_doc

        update = EventUpdate(tags=["new-tag"])
        result = await EventRepository.update("507f1f77bcf86cd799439011", update)
        assert result.tags == ["new-tag"]

    async def test_updates_event_type(self, mock_mongodb, sample_event_doc):
        """Update persists event_type correctly."""
        from app.models.event import EventUpdate

        updated_doc = {**sample_event_doc, "event_type": "workshop"}
        mock_mongodb["events"].update_one.return_value = MagicMock(matched_count=1)
        mock_mongodb["events"].find_one.return_value = updated_doc

        update = EventUpdate(event_type="workshop")
        result = await EventRepository.update("507f1f77bcf86cd799439011", update)
        assert result.event_type == "workshop"


class TestDelete:
    """Tests for EventRepository.delete()."""

    async def test_deletes_existing_event(self, mock_mongodb):
        """Delete removes the document when it exists."""
        mock_mongodb["events"].delete_one.return_value = MagicMock(deleted_count=1)
        await EventRepository.delete("507f1f77bcf86cd799439011")
        mock_mongodb["events"].delete_one.assert_called_once_with(
            {"_id": ObjectId("507f1f77bcf86cd799439011")}
        )

    async def test_raises_not_found_when_deleted_count_zero(self, mock_mongodb):
        """Delete raises EventNotFoundError when deleted_count is 0."""
        mock_mongodb["events"].delete_one.return_value = MagicMock(deleted_count=0)
        with pytest.raises(EventNotFoundError):
            await EventRepository.delete("507f1f77bcf86cd799439011")

    async def test_raises_not_found_for_invalid_id(self, mock_mongodb):
        """Delete raises EventNotFoundError for invalid ObjectId."""
        with pytest.raises(EventNotFoundError):
            await EventRepository.delete("invalid-id")
        mock_mongodb["events"].delete_one.assert_not_called()


class TestListEvents:
    """Tests for EventRepository.list_events()."""

    async def test_returns_events_list(self, mock_mongodb, sample_event_docs):
        """list_events returns list of EventInDB models."""
        mock_mongodb["events"].find.return_value = create_async_cursor(
            sample_event_docs
        )
        events = await EventRepository.list_events()
        assert len(events) == 2
        assert events[0].title == "GDG DevFest 2025"
        assert events[1].title == "Flutter Workshop"

    async def test_returns_empty_list(self, mock_mongodb):
        """list_events returns empty list when no events exist."""
        mock_mongodb["events"].find.return_value = create_async_cursor([])
        events = await EventRepository.list_events()
        assert events == []

    async def test_applies_sort_skip_limit(self, mock_mongodb):
        """list_events calls sort, skip, and limit on the cursor."""
        cursor_mock = MagicMock()
        cursor_mock.sort.return_value = cursor_mock
        cursor_mock.skip.return_value = cursor_mock
        cursor_mock.limit.return_value = create_async_cursor([])
        mock_mongodb["events"].find.return_value = cursor_mock

        await EventRepository.list_events(limit=10, offset=5)

        cursor_mock.sort.assert_called_once_with("created_at", -1)
        cursor_mock.skip.assert_called_once_with(5)
        cursor_mock.limit.assert_called_once_with(10)
