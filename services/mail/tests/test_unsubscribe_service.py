"""Tests for unsubscribe service."""

from unittest.mock import AsyncMock

import pytest
from bson import ObjectId

from app.repositories.user_repository import UserNotFoundError
from app.services.unsubscribe_service import InvalidTokenError, UnsubscribeService


class TestGenerateToken:
    """Tests for token generation."""

    def test_creates_valid_token(self):
        """Should create a non-empty token string."""
        token = UnsubscribeService.generate_token("user123")

        assert token is not None
        assert len(token) > 0
        assert isinstance(token, str)

    def test_includes_user_id(self):
        """Should include user ID that can be decoded."""
        token = UnsubscribeService.generate_token("user123")

        # Verify we can decode it back
        user_id = UnsubscribeService.verify_token(token)
        assert user_id == "user123"

    def test_different_users_different_tokens(self):
        """Should generate unique tokens for different users."""
        token1 = UnsubscribeService.generate_token("user1")
        token2 = UnsubscribeService.generate_token("user2")

        assert token1 != token2


class TestVerifyToken:
    """Tests for token verification."""

    def test_returns_user_id(self):
        """Should return correct user ID from valid token."""
        token = UnsubscribeService.generate_token("test-user-id")

        user_id = UnsubscribeService.verify_token(token)

        assert user_id == "test-user-id"

    def test_rejects_invalid_token(self):
        """Should raise InvalidTokenError for invalid token."""
        with pytest.raises(InvalidTokenError):
            UnsubscribeService.verify_token("invalid-token-format")

    def test_rejects_tampered_token(self):
        """Should raise InvalidTokenError for tampered token."""
        token = UnsubscribeService.generate_token("user123")
        tampered = token[:-5] + "XXXXX"  # Modify the end

        with pytest.raises(InvalidTokenError):
            UnsubscribeService.verify_token(tampered)

    def test_rejects_empty_token(self):
        """Should raise InvalidTokenError for empty token."""
        with pytest.raises(InvalidTokenError, match="cannot be empty"):
            UnsubscribeService.verify_token("")

    def test_handles_url_encoding(self):
        """Should handle tokens with special characters."""
        # Generate token and verify it works
        token = UnsubscribeService.generate_token("user-with-special-chars-123")
        user_id = UnsubscribeService.verify_token(token)

        assert user_id == "user-with-special-chars-123"


class TestUnsubscribeByToken:
    """Tests for unsubscribing via token."""

    async def test_unsubscribes_user(self, mock_mongodb):
        """Should unsubscribe user and return email."""
        user_doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "test@example.com",
            "isSubscribed": True,
        }
        mock_mongodb["users"].find_one = AsyncMock(return_value=user_doc)
        mock_mongodb["users"].update_one = AsyncMock(
            return_value=AsyncMock(matched_count=1)
        )

        token = UnsubscribeService.generate_token("507f1f77bcf86cd799439011")

        email = await UnsubscribeService.unsubscribe_by_token(token)

        assert email == "test@example.com"
        mock_mongodb["users"].update_one.assert_called_once()

    async def test_rejects_invalid_token(self, mock_mongodb):
        """Should raise InvalidTokenError for invalid token."""
        with pytest.raises(InvalidTokenError):
            await UnsubscribeService.unsubscribe_by_token("invalid-token")

    async def test_raises_for_nonexistent_user(self, mock_mongodb):
        """Should raise UserNotFoundError when user not found."""
        mock_mongodb["users"].find_one = AsyncMock(return_value=None)

        token = UnsubscribeService.generate_token("nonexistent-id")

        with pytest.raises(UserNotFoundError):
            await UnsubscribeService.unsubscribe_by_token(token)


class TestGetUserEmailFromToken:
    """Tests for getting user email from token."""

    async def test_returns_email(self, mock_mongodb):
        """Should return user email for valid token."""
        user_doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "test@example.com",
            "isSubscribed": True,
        }
        mock_mongodb["users"].find_one = AsyncMock(return_value=user_doc)

        token = UnsubscribeService.generate_token("507f1f77bcf86cd799439011")

        email = await UnsubscribeService.get_user_email_from_token(token)

        assert email == "test@example.com"

    async def test_returns_none_for_invalid_token(self, mock_mongodb):
        """Should return None for invalid token."""
        email = await UnsubscribeService.get_user_email_from_token("invalid")

        assert email is None

    async def test_returns_none_for_nonexistent_user(self, mock_mongodb):
        """Should return None when user not found."""
        mock_mongodb["users"].find_one = AsyncMock(return_value=None)

        token = UnsubscribeService.generate_token("nonexistent-id")

        email = await UnsubscribeService.get_user_email_from_token(token)

        assert email is None
