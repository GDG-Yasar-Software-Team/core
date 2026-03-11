"""Tests for events API endpoints."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from app.models.event import EventResponse, Speaker
from app.repositories.event_repository import EventNotFoundError


class TestAuth:
    """Tests for API authentication."""

    def test_401_without_token(self, sync_client):
        """Requests without token return 401."""
        response = sync_client.get("/events/")

        assert response.status_code == 401
        assert "Missing API token" in response.json()["detail"]

    def test_401_with_invalid_token(self, sync_client):
        """Requests with invalid token return 401."""
        response = sync_client.get(
            "/events/",
            headers={"X-API-Token": "invalid-token"},
        )

        assert response.status_code == 401
        assert "Invalid API token" in response.json()["detail"]

    def test_200_with_valid_token(self, sync_client, valid_api_token):
        """Requests with valid token succeed."""
        with patch(
            "app.services.event_service.EventService.list_events",
            new_callable=AsyncMock,
            return_value=[],
        ):
            response = sync_client.get(
                "/events/",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200


class TestPostEvents:
    """Tests for POST /events/."""

    def test_creates_event_201(self, sync_client, valid_api_token):
        """POST creates event and returns 201."""
        with patch(
            "app.services.event_service.EventService.create_event",
            new_callable=AsyncMock,
            return_value="507f1f77bcf86cd799439011",
        ):
            response = sync_client.post(
                "/events/",
                headers={"X-API-Token": valid_api_token},
                json={
                    "title": "GDG DevFest 2025",
                    "description": "Annual developer festival.",
                    "date": "2099-11-15T10:00:00Z",
                    "place": "Yaşar University",
                    "speakers": [
                        {"name": "Jane Doe", "title": "Engineer", "company": "Google"}
                    ],
                },
            )

            assert response.status_code == 201
            data = response.json()
            assert data["id"] == "507f1f77bcf86cd799439011"

    def test_validates_missing_title_422(self, sync_client, valid_api_token):
        """POST with missing required field returns 422."""
        response = sync_client.post(
            "/events/",
            headers={"X-API-Token": valid_api_token},
            json={
                "description": "Some event",
                "date": "2099-11-15T10:00:00Z",
                "place": "Somewhere",
            },
        )

        assert response.status_code == 422

    def test_handles_past_date_400(self, sync_client, valid_api_token):
        """POST with past date returns 400."""
        with patch(
            "app.services.event_service.EventService.create_event",
            new_callable=AsyncMock,
            side_effect=ValueError("Event date must be in the future"),
        ):
            response = sync_client.post(
                "/events/",
                headers={"X-API-Token": valid_api_token},
                json={
                    "title": "Past Event",
                    "description": "This event is in the past.",
                    "date": "2020-01-01T00:00:00Z",
                    "place": "Nowhere",
                },
            )

            assert response.status_code == 400
            assert "future" in response.json()["detail"]


class TestGetEventById:
    """Tests for GET /events/{event_id}."""

    def test_returns_event_200(self, sync_client, valid_api_token):
        """GET returns event when found."""
        mock_response = EventResponse(
            id="507f1f77bcf86cd799439011",
            title="GDG DevFest 2025",
            description="Annual developer festival.",
            date=datetime(2099, 11, 15, 10, 0, 0, tzinfo=timezone.utc),
            place="Yaşar University",
            speakers=[Speaker(name="Jane Doe", title="Engineer", company="Google")],
            image_url="https://example.com/image.jpg",
            created_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
            updated_at=None,
        )

        with patch(
            "app.services.event_service.EventService.get_event_by_id",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            response = sync_client.get(
                "/events/507f1f77bcf86cd799439011",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "GDG DevFest 2025"
            assert data["id"] == "507f1f77bcf86cd799439011"

    def test_returns_404_when_not_found(self, sync_client, valid_api_token):
        """GET returns 404 when event not found."""
        with patch(
            "app.services.event_service.EventService.get_event_by_id",
            new_callable=AsyncMock,
            return_value=None,
        ):
            response = sync_client.get(
                "/events/507f1f77bcf86cd799439099",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 404
            assert "not found" in response.json()["detail"]


class TestPutEvents:
    """Tests for PUT /events/{event_id}."""

    def test_updates_event_200(self, sync_client, valid_api_token):
        """PUT updates event and returns 200."""
        mock_response = EventResponse(
            id="507f1f77bcf86cd799439011",
            title="Updated Title",
            description="Annual developer festival.",
            date=datetime(2099, 11, 15, 10, 0, 0, tzinfo=timezone.utc),
            place="Yaşar University",
            speakers=[],
            image_url=None,
            created_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
            updated_at=datetime(2025, 1, 2, 12, 0, 0, tzinfo=timezone.utc),
        )

        with patch(
            "app.services.event_service.EventService.update_event",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            response = sync_client.put(
                "/events/507f1f77bcf86cd799439011",
                headers={"X-API-Token": valid_api_token},
                json={"title": "Updated Title"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "Updated Title"

    def test_returns_404_when_not_found(self, sync_client, valid_api_token):
        """PUT returns 404 when event not found."""
        with patch(
            "app.services.event_service.EventService.update_event",
            new_callable=AsyncMock,
            side_effect=EventNotFoundError("Event not found"),
        ):
            response = sync_client.put(
                "/events/507f1f77bcf86cd799439099",
                headers={"X-API-Token": valid_api_token},
                json={"title": "Updated Title"},
            )

            assert response.status_code == 404


class TestDeleteEvents:
    """Tests for DELETE /events/{event_id}."""

    def test_deletes_event_204(self, sync_client, valid_api_token):
        """DELETE removes event and returns 204."""
        with patch(
            "app.services.event_service.EventService.delete_event",
            new_callable=AsyncMock,
        ):
            response = sync_client.delete(
                "/events/507f1f77bcf86cd799439011",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 204

    def test_returns_404_when_not_found(self, sync_client, valid_api_token):
        """DELETE returns 404 when event not found."""
        with patch(
            "app.services.event_service.EventService.delete_event",
            new_callable=AsyncMock,
            side_effect=EventNotFoundError("Event not found"),
        ):
            response = sync_client.delete(
                "/events/507f1f77bcf86cd799439099",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 404


class TestListEvents:
    """Tests for GET /events/."""

    def test_returns_events_200(self, sync_client, valid_api_token):
        """GET returns list of events."""
        mock_events = [
            EventResponse(
                id="507f1f77bcf86cd799439011",
                title="GDG DevFest 2025",
                description="Annual developer festival.",
                date=datetime(2099, 11, 15, 10, 0, 0, tzinfo=timezone.utc),
                place="Yaşar University",
                speakers=[],
                image_url=None,
                created_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
                updated_at=None,
            ),
            EventResponse(
                id="507f1f77bcf86cd799439012",
                title="Flutter Workshop",
                description="Hands-on Flutter workshop.",
                date=datetime(2099, 12, 1, 14, 0, 0, tzinfo=timezone.utc),
                place="Engineering Building",
                speakers=[],
                image_url=None,
                created_at=datetime(2025, 2, 1, 0, 0, 0, tzinfo=timezone.utc),
                updated_at=None,
            ),
        ]

        with patch(
            "app.services.event_service.EventService.list_events",
            new_callable=AsyncMock,
            return_value=mock_events,
        ):
            response = sync_client.get(
                "/events/",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["title"] == "GDG DevFest 2025"

    def test_passes_query_params(self, sync_client, valid_api_token):
        """GET passes limit and offset to service."""
        with patch(
            "app.services.event_service.EventService.list_events",
            new_callable=AsyncMock,
            return_value=[],
        ) as mock_list:
            response = sync_client.get(
                "/events/?limit=5&offset=10",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200
            mock_list.assert_called_once_with(limit=5, offset=10)

    def test_returns_empty_list_200(self, sync_client, valid_api_token):
        """GET returns empty list when no events exist."""
        with patch(
            "app.services.event_service.EventService.list_events",
            new_callable=AsyncMock,
            return_value=[],
        ):
            response = sync_client.get(
                "/events/",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200
            assert response.json() == []
