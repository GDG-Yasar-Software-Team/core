"""Tests for users API endpoints."""

from datetime import datetime
from unittest.mock import AsyncMock, patch


from app.models.user import SubscribedEmailsResponse, UserResponse
from app.repositories.user_repository import DuplicateEmailError, UserNotFoundError


class TestAuth:
    """Tests for API authentication."""

    def test_401_without_token(self, sync_client):
        """Requests without token return 401."""
        response = sync_client.get("/users/subscribed-emails")

        assert response.status_code == 401
        assert "Missing API token" in response.json()["detail"]

    def test_401_with_invalid_token(self, sync_client):
        """Requests with invalid token return 401."""
        response = sync_client.get(
            "/users/subscribed-emails",
            headers={"X-API-Token": "invalid-token"},
        )

        assert response.status_code == 401
        assert "Invalid API token" in response.json()["detail"]

    def test_200_with_valid_token(self, sync_client, valid_api_token):
        """Requests with valid token succeed."""
        with patch(
            "app.services.user_service.UserService.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=SubscribedEmailsResponse(emails=[], count=0),
        ):
            response = sync_client.get(
                "/users/subscribed-emails",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200


class TestPostUsers:
    """Tests for POST /users/."""

    def test_creates_user_201(self, sync_client, valid_api_token):
        """POST creates user and returns 201."""
        with patch(
            "app.services.user_service.UserService.create_user",
            new_callable=AsyncMock,
            return_value="507f1f77bcf86cd799439011",
        ):
            response = sync_client.post(
                "/users/",
                headers={"X-API-Token": valid_api_token},
                json={"email": "test@example.com"},
            )

            assert response.status_code == 201
            data = response.json()
            assert data["id"] == "507f1f77bcf86cd799439011"
            assert data["email"] == "test@example.com"

    def test_validates_email_422(self, sync_client, valid_api_token):
        """POST with invalid email returns 422."""
        response = sync_client.post(
            "/users/",
            headers={"X-API-Token": valid_api_token},
            json={"email": "not-an-email"},
        )

        assert response.status_code == 422

    def test_handles_duplicate_409(self, sync_client, valid_api_token):
        """POST with duplicate email returns 409."""
        with patch(
            "app.services.user_service.UserService.create_user",
            new_callable=AsyncMock,
            side_effect=DuplicateEmailError("User already exists"),
        ):
            response = sync_client.post(
                "/users/",
                headers={"X-API-Token": valid_api_token},
                json={"email": "existing@example.com"},
            )

            assert response.status_code == 409
            assert "already exists" in response.json()["detail"]


class TestGetUserByEmail:
    """Tests for GET /users/by-email/{email}."""

    def test_returns_user_200(self, sync_client, valid_api_token):
        """GET returns user when found."""
        mock_response = UserResponse(
            id="507f1f77bcf86cd799439011",
            email="user1@example.com",
            name="User One",
            is_yasar_student=False,
            section=None,
            submitted_form_count=0,
            received_mail_count=0,
            is_subscribed=True,
            unsubscribed_at=None,
            created_at=datetime(2025, 1, 15, 12, 0, 0),
            updated_at=None,
        )

        with patch(
            "app.services.user_service.UserService.get_user_by_email",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            response = sync_client.get(
                "/users/by-email/user1@example.com",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["email"] == "user1@example.com"
            assert data["name"] == "User One"

    def test_returns_404_when_not_found(self, sync_client, valid_api_token):
        """GET returns 404 when user not found."""
        with patch(
            "app.services.user_service.UserService.get_user_by_email",
            new_callable=AsyncMock,
            return_value=None,
        ):
            response = sync_client.get(
                "/users/by-email/nonexistent@example.com",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 404
            assert "not found" in response.json()["detail"]


class TestPutUsers:
    """Tests for PUT /users/by-email/{email}."""

    def test_updates_user_200(self, sync_client, valid_api_token):
        """PUT updates user and returns 200."""
        mock_response = UserResponse(
            id="507f1f77bcf86cd799439011",
            email="user1@example.com",
            name="Updated Name",
            is_yasar_student=False,
            section=None,
            submitted_form_count=0,
            received_mail_count=0,
            is_subscribed=True,
            unsubscribed_at=None,
            created_at=datetime(2025, 1, 15, 12, 0, 0),
            updated_at=datetime(2025, 1, 16, 10, 0, 0),
        )

        with patch(
            "app.services.user_service.UserService.update_user",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            response = sync_client.put(
                "/users/by-email/user1@example.com",
                headers={"X-API-Token": valid_api_token},
                json={"email": "user1@example.com", "name": "Updated Name"},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Updated Name"

    def test_returns_404_when_not_found(self, sync_client, valid_api_token):
        """PUT returns 404 when user not found."""
        with patch(
            "app.services.user_service.UserService.update_user",
            new_callable=AsyncMock,
            side_effect=UserNotFoundError("User not found"),
        ):
            response = sync_client.put(
                "/users/by-email/nonexistent@example.com",
                headers={"X-API-Token": valid_api_token},
                json={"email": "nonexistent@example.com", "name": "New Name"},
            )

            assert response.status_code == 404


class TestGetSubscribedEmails:
    """Tests for GET /users/subscribed-emails."""

    def test_returns_emails_200(self, sync_client, valid_api_token):
        """GET returns list of subscribed emails."""
        mock_response = SubscribedEmailsResponse(
            emails=["user1@example.com", "user2@example.com"],
            count=2,
        )

        with patch(
            "app.services.user_service.UserService.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            response = sync_client.get(
                "/users/subscribed-emails",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200
            data = response.json()
            assert data["count"] == 2
            assert "user1@example.com" in data["emails"]


class TestRecordFormSubmission:
    """Tests for POST /users/by-email/{email}/forms/{form_id}."""

    def test_records_form_submission(self, sync_client, valid_api_token):
        """POST records form submission."""
        with patch(
            "app.services.user_service.UserService.record_form_submission",
            new_callable=AsyncMock,
        ):
            response = sync_client.post(
                "/users/by-email/user1@example.com/forms/507f1f77bcf86cd799439030",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200
            assert response.json() == {"status": "ok"}

    def test_returns_404_when_user_not_found(self, sync_client, valid_api_token):
        """POST returns 404 when user not found."""
        with patch(
            "app.services.user_service.UserService.record_form_submission",
            new_callable=AsyncMock,
            side_effect=UserNotFoundError("User not found"),
        ):
            response = sync_client.post(
                "/users/by-email/nonexistent@example.com/forms/507f1f77bcf86cd799439030",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 404


class TestRecordMailReceived:
    """Tests for POST /users/by-email/{email}/mails/{mail_id}."""

    def test_records_mail_received(self, sync_client, valid_api_token):
        """POST records mail received."""
        with patch(
            "app.services.user_service.UserService.record_mail_received",
            new_callable=AsyncMock,
        ):
            response = sync_client.post(
                "/users/by-email/user1@example.com/mails/507f1f77bcf86cd799439040",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 200
            assert response.json() == {"status": "ok"}

    def test_returns_404_when_user_not_found(self, sync_client, valid_api_token):
        """POST returns 404 when user not found."""
        with patch(
            "app.services.user_service.UserService.record_mail_received",
            new_callable=AsyncMock,
            side_effect=UserNotFoundError("User not found"),
        ):
            response = sync_client.post(
                "/users/by-email/nonexistent@example.com/mails/507f1f77bcf86cd799439040",
                headers={"X-API-Token": valid_api_token},
            )

            assert response.status_code == 404
