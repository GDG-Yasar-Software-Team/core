"""Tests for unsubscribe service."""

from unittest.mock import AsyncMock, patch

import pytest

from app.clients.user_client import UserNotFoundError
from app.services.unsubscribe_service import InvalidTokenError, UnsubscribeService


class TestGenerateToken:
    """Tests for token generation."""

    def test_creates_valid_token(self):
        """Should create a non-empty token string."""
        token = UnsubscribeService.generate_token("test@example.com")

        assert token is not None
        assert len(token) > 0
        assert isinstance(token, str)

    def test_includes_email(self):
        """Should include email that can be decoded."""
        token = UnsubscribeService.generate_token("test@example.com")

        # Verify we can decode it back
        email = UnsubscribeService.verify_token(token)
        assert email == "test@example.com"

    def test_different_emails_different_tokens(self):
        """Should generate unique tokens for different emails."""
        token1 = UnsubscribeService.generate_token("user1@example.com")
        token2 = UnsubscribeService.generate_token("user2@example.com")

        assert token1 != token2


class TestVerifyToken:
    """Tests for token verification."""

    def test_returns_email(self):
        """Should return correct email from valid token."""
        token = UnsubscribeService.generate_token("test@example.com")

        email = UnsubscribeService.verify_token(token)

        assert email == "test@example.com"

    def test_rejects_invalid_token(self):
        """Should raise InvalidTokenError for invalid token."""
        with pytest.raises(InvalidTokenError):
            UnsubscribeService.verify_token("invalid-token-format")

    def test_rejects_tampered_token(self):
        """Should raise InvalidTokenError for tampered token."""
        token = UnsubscribeService.generate_token("test@example.com")
        tampered = token[:-5] + "XXXXX"  # Modify the end

        with pytest.raises(InvalidTokenError):
            UnsubscribeService.verify_token(tampered)

    def test_rejects_empty_token(self):
        """Should raise InvalidTokenError for empty token."""
        with pytest.raises(InvalidTokenError, match="cannot be empty"):
            UnsubscribeService.verify_token("")

    def test_handles_special_characters(self):
        """Should handle emails with special characters."""
        # Generate token and verify it works
        token = UnsubscribeService.generate_token("user+test@example.com")
        email = UnsubscribeService.verify_token(token)

        assert email == "user+test@example.com"


class TestUnsubscribeByToken:
    """Tests for unsubscribing via token."""

    async def test_unsubscribes_user(self):
        """Should unsubscribe user and return email."""
        with patch(
            "app.services.unsubscribe_service.UserServiceClient.unsubscribe_by_email",
            new_callable=AsyncMock,
        ) as mock_unsubscribe:
            token = UnsubscribeService.generate_token("test@example.com")

            email = await UnsubscribeService.unsubscribe_by_token(token)

            assert email == "test@example.com"
            mock_unsubscribe.assert_called_once_with("test@example.com")

    async def test_rejects_invalid_token(self):
        """Should raise InvalidTokenError for invalid token."""
        with pytest.raises(InvalidTokenError):
            await UnsubscribeService.unsubscribe_by_token("invalid-token")

    async def test_raises_for_nonexistent_user(self):
        """Should raise UserNotFoundError when user not found."""
        with patch(
            "app.services.unsubscribe_service.UserServiceClient.unsubscribe_by_email",
            new_callable=AsyncMock,
            side_effect=UserNotFoundError("User not found"),
        ):
            token = UnsubscribeService.generate_token("nonexistent@example.com")

            with pytest.raises(UserNotFoundError):
                await UnsubscribeService.unsubscribe_by_token(token)


class TestGetUserEmailFromToken:
    """Tests for getting user email from token."""

    def test_returns_email(self):
        """Should return email for valid token."""
        token = UnsubscribeService.generate_token("test@example.com")

        email = UnsubscribeService.get_user_email_from_token(token)

        assert email == "test@example.com"

    def test_returns_none_for_invalid_token(self):
        """Should return None for invalid token."""
        email = UnsubscribeService.get_user_email_from_token("invalid")

        assert email is None
