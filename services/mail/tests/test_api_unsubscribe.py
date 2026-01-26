"""Tests for unsubscribe API endpoints."""

from unittest.mock import AsyncMock, MagicMock

from bson import ObjectId

from app.services.unsubscribe_service import UnsubscribeService


class TestGetUnsubscribePage:
    """Tests for GET /unsubscribe/{token} endpoint."""

    def test_shows_confirmation_page(self, sync_client, mock_mongodb):
        """Should show confirmation page with user email."""
        user_doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "test@example.com",
            "isSubscribed": True,
        }
        mock_mongodb["users"].find_one = AsyncMock(return_value=user_doc)

        token = UnsubscribeService.generate_token("507f1f77bcf86cd799439011")

        response = sync_client.get(f"/unsubscribe/{token}")

        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        assert "test@example.com" in response.text

    def test_includes_user_email_in_page(self, sync_client, mock_mongodb):
        """Should show personalized page with user's email."""
        user_doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "personalized@example.com",
            "isSubscribed": True,
        }
        mock_mongodb["users"].find_one = AsyncMock(return_value=user_doc)

        token = UnsubscribeService.generate_token("507f1f77bcf86cd799439011")

        response = sync_client.get(f"/unsubscribe/{token}")

        assert "personalized@example.com" in response.text

    def test_rejects_invalid_token(self, sync_client, mock_mongodb):
        """Should return 400 for invalid token."""
        response = sync_client.get("/unsubscribe/invalid-token")

        assert response.status_code == 400

    def test_rejects_when_user_not_found(self, sync_client, mock_mongodb):
        """Should return 400 when user not found."""
        mock_mongodb["users"].find_one = AsyncMock(return_value=None)

        token = UnsubscribeService.generate_token("nonexistent-id")

        response = sync_client.get(f"/unsubscribe/{token}")

        assert response.status_code == 400


class TestPostUnsubscribe:
    """Tests for POST /unsubscribe/{token} endpoint."""

    def test_unsubscribes_user(self, sync_client, mock_mongodb):
        """Should unsubscribe user and show success page."""
        user_doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "test@example.com",
            "isSubscribed": True,
        }
        mock_mongodb["users"].find_one = AsyncMock(return_value=user_doc)
        mock_mongodb["users"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        token = UnsubscribeService.generate_token("507f1f77bcf86cd799439011")

        response = sync_client.post(f"/unsubscribe/{token}")

        assert response.status_code == 200
        assert "test@example.com" in response.text
        # Should show success message
        assert "İptal" in response.text or "success" in response.text.lower()

    def test_idempotent(self, sync_client, mock_mongodb):
        """Should handle multiple unsubscribe requests gracefully."""
        user_doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "test@example.com",
            "isSubscribed": False,  # Already unsubscribed
        }
        mock_mongodb["users"].find_one = AsyncMock(return_value=user_doc)
        mock_mongodb["users"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        token = UnsubscribeService.generate_token("507f1f77bcf86cd799439011")

        response = sync_client.post(f"/unsubscribe/{token}")

        # Should still succeed
        assert response.status_code == 200

    def test_rejects_invalid_token(self, sync_client, mock_mongodb):
        """Should return 400 for invalid token."""
        response = sync_client.post("/unsubscribe/invalid-token")

        assert response.status_code == 400

    def test_rejects_when_user_not_found(self, sync_client, mock_mongodb):
        """Should return 400 when user not found."""
        mock_mongodb["users"].find_one = AsyncMock(return_value=None)

        token = UnsubscribeService.generate_token("nonexistent-id")

        response = sync_client.post(f"/unsubscribe/{token}")

        assert response.status_code == 400
