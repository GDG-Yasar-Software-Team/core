"""Tests for event service."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
from bson import ObjectId

from app.models.event import EventCreate, EventInDB, EventUpdate
from app.repositories.event_repository import EventNotFoundError
from app.services.event_service import EventService


def _make_db_event(**kwargs) -> EventInDB:
    """Helper to create an EventInDB with sensible defaults."""
    defaults = {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "title": "GDG DevFest 2025",
        "description": "Annual developer festival.",
        "date": datetime(2099, 11, 15, 10, 0, 0, tzinfo=timezone.utc),
        "place": "Yaşar University",
        "speakers": [],
        "image_url": None,
        "created_at": datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
        "updated_at": None,
    }
    defaults.update(kwargs)
    return EventInDB(**defaults)


class TestCreateEvent:
    """Tests for EventService.create_event()."""

    async def test_creates_event_with_future_date(self, mock_mongodb):
        """create_event delegates to repository for a valid future date."""
        with patch(
            "app.services.event_service.EventRepository.create",
            new_callable=AsyncMock,
            return_value="507f1f77bcf86cd799439011",
        ):
            data = EventCreate(
                title="GDG DevFest 2025",
                description="Annual developer festival.",
                date=datetime(2099, 11, 15, 10, 0, 0, tzinfo=timezone.utc),
                place="Yaşar University",
            )
            event_id = await EventService.create_event(data)

            assert event_id == "507f1f77bcf86cd799439011"

    async def test_raises_value_error_for_past_date(self, mock_mongodb):
        """create_event raises ValueError when event date is in the past."""
        data = EventCreate(
            title="Past Event",
            description="Already happened.",
            date=datetime(2020, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
            place="Somewhere",
        )

        with pytest.raises(ValueError, match="Event date must be in the future"):
            await EventService.create_event(data)

    async def test_delegates_to_repository(self, mock_mongodb):
        """create_event calls EventRepository.create with the data."""
        with patch(
            "app.services.event_service.EventRepository.create",
            new_callable=AsyncMock,
            return_value="507f1f77bcf86cd799439011",
        ) as mock_create:
            data = EventCreate(
                title="Workshop",
                description="A workshop.",
                date=datetime(2099, 6, 1, 10, 0, 0, tzinfo=timezone.utc),
                place="Lab",
            )
            await EventService.create_event(data)

            mock_create.assert_called_once_with(data)


class TestGetEventById:
    """Tests for EventService.get_event_by_id()."""

    async def test_returns_event_response(self, mock_mongodb):
        """get_event_by_id returns EventResponse when found."""
        db_event = _make_db_event()

        with patch(
            "app.services.event_service.EventRepository.get_by_id",
            new_callable=AsyncMock,
            return_value=db_event,
        ):
            response = await EventService.get_event_by_id("507f1f77bcf86cd799439011")

            assert response is not None
            assert response.id == "507f1f77bcf86cd799439011"
            assert response.title == "GDG DevFest 2025"

    async def test_returns_none_when_not_found(self, mock_mongodb):
        """get_event_by_id returns None when event doesn't exist."""
        with patch(
            "app.services.event_service.EventRepository.get_by_id",
            new_callable=AsyncMock,
            return_value=None,
        ):
            response = await EventService.get_event_by_id("507f1f77bcf86cd799439011")

            assert response is None


class TestUpdateEvent:
    """Tests for EventService.update_event()."""

    async def test_updates_and_returns_response(self, mock_mongodb):
        """update_event delegates to repository and returns EventResponse."""
        db_event = _make_db_event(title="Updated Title")

        with patch(
            "app.services.event_service.EventRepository.update",
            new_callable=AsyncMock,
            return_value=db_event,
        ):
            update = EventUpdate(title="Updated Title")
            response = await EventService.update_event(
                "507f1f77bcf86cd799439011", update
            )

            assert response.title == "Updated Title"
            assert response.id == "507f1f77bcf86cd799439011"

    async def test_propagates_not_found_error(self, mock_mongodb):
        """update_event propagates EventNotFoundError from repository."""
        with patch(
            "app.services.event_service.EventRepository.update",
            new_callable=AsyncMock,
            side_effect=EventNotFoundError("Event not found"),
        ):
            update = EventUpdate(title="New Title")
            with pytest.raises(EventNotFoundError):
                await EventService.update_event("507f1f77bcf86cd799439011", update)


class TestDeleteEvent:
    """Tests for EventService.delete_event()."""

    async def test_delegates_to_repository(self, mock_mongodb):
        """delete_event calls EventRepository.delete."""
        with patch(
            "app.services.event_service.EventRepository.delete",
            new_callable=AsyncMock,
        ) as mock_delete:
            await EventService.delete_event("507f1f77bcf86cd799439011")

            mock_delete.assert_called_once_with("507f1f77bcf86cd799439011")

    async def test_propagates_not_found_error(self, mock_mongodb):
        """delete_event propagates EventNotFoundError from repository."""
        with patch(
            "app.services.event_service.EventRepository.delete",
            new_callable=AsyncMock,
            side_effect=EventNotFoundError("Event not found"),
        ):
            with pytest.raises(EventNotFoundError):
                await EventService.delete_event("507f1f77bcf86cd799439011")


class TestListEvents:
    """Tests for EventService.list_events()."""

    async def test_returns_list_of_event_responses(self, mock_mongodb):
        """list_events returns list of EventResponse models."""
        db_events = [
            _make_db_event(),
            _make_db_event(
                _id=ObjectId("507f1f77bcf86cd799439012"),
                title="Flutter Workshop",
            ),
        ]

        with patch(
            "app.services.event_service.EventRepository.list_events",
            new_callable=AsyncMock,
            return_value=db_events,
        ):
            responses = await EventService.list_events()

            assert len(responses) == 2
            assert responses[0].id == "507f1f77bcf86cd799439011"
            assert responses[1].title == "Flutter Workshop"

    async def test_returns_empty_list(self, mock_mongodb):
        """list_events returns empty list when no events exist."""
        with patch(
            "app.services.event_service.EventRepository.list_events",
            new_callable=AsyncMock,
            return_value=[],
        ):
            responses = await EventService.list_events()

            assert responses == []

    async def test_passes_limit_and_offset(self, mock_mongodb):
        """list_events forwards limit and offset to repository."""
        with patch(
            "app.services.event_service.EventRepository.list_events",
            new_callable=AsyncMock,
            return_value=[],
        ) as mock_list:
            await EventService.list_events(limit=10, offset=5)

            mock_list.assert_called_once_with(limit=10, offset=5)
