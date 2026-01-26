"""Tests for unsubscribe API endpoints."""

from unittest.mock import AsyncMock, patch

from app.clients.user_client import UserNotFoundError
from app.services.unsubscribe_service import UnsubscribeService


class TestGetUnsubscribePage:
    """Tests for GET /unsubscribe/{token} endpoint."""

    def test_shows_confirmation_page(self, sync_client, mock_mongodb):
        """Should show confirmation page with user email."""
        # Token now contains email directly
        token = UnsubscribeService.generate_token("test@example.com")

        response = sync_client.get(f"/unsubscribe/{token}")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        assert "test@example.com" in response.text

    def test_includes_user_email_in_page(self, sync_client, mock_mongodb):
        """Should show personalized page with user's email."""
        token = UnsubscribeService.generate_token("personalized@example.com")

        response = sync_client.get(f"/unsubscribe/{token}")

        assert "personalized@example.com" in response.text

    def test_rejects_invalid_token(self, sync_client, mock_mongodb):
        """Should return 400 for invalid token."""
        response = sync_client.get("/unsubscribe/invalid-token")

        assert response.status_code == 400


class TestPostUnsubscribe:
    """Tests for POST /unsubscribe/{token} endpoint."""

    def test_unsubscribes_user(self, sync_client, mock_mongodb):
        """Should unsubscribe user and show success page."""
        with patch(
            "app.services.unsubscribe_service.UserServiceClient.unsubscribe_by_email",
            new_callable=AsyncMock,
        ):
            token = UnsubscribeService.generate_token("test@example.com")

            response = sync_client.post(f"/unsubscribe/{token}")

            assert response.status_code == 200
            assert "test@example.com" in response.text
            # Should show success message
            assert "İptal" in response.text or "success" in response.text.lower()

    def test_idempotent(self, sync_client, mock_mongodb):
        """Should handle multiple unsubscribe requests gracefully."""
        with patch(
            "app.services.unsubscribe_service.UserServiceClient.unsubscribe_by_email",
            new_callable=AsyncMock,
        ):
            token = UnsubscribeService.generate_token("test@example.com")

            response = sync_client.post(f"/unsubscribe/{token}")

            # Should still succeed
            assert response.status_code == 200

    def test_rejects_invalid_token(self, sync_client, mock_mongodb):
        """Should return 400 for invalid token."""
        response = sync_client.post("/unsubscribe/invalid-token")

        assert response.status_code == 400

    def test_rejects_when_user_not_found(self, sync_client, mock_mongodb):
        """Should return 400 when user not found."""
        with patch(
            "app.services.unsubscribe_service.UserServiceClient.unsubscribe_by_email",
            new_callable=AsyncMock,
            side_effect=UserNotFoundError("User not found"),
        ):
            token = UnsubscribeService.generate_token("nonexistent@example.com")

            response = sync_client.post(f"/unsubscribe/{token}")

            assert response.status_code == 400
