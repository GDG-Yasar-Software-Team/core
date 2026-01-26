"""Tests for user service client."""

from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from app.clients.user_client import (
    UserNotFoundError,
    UserServiceAuthError,
    UserServiceClient,
    UserServiceError,
    UserServiceTimeoutError,
)


@pytest.fixture(autouse=True)
def reset_client():
    """Reset the client singleton before each test."""
    UserServiceClient._client = None
    yield
    UserServiceClient._client = None


class TestGetSubscribedEmails:
    """Tests for get_subscribed_emails method."""

    async def test_returns_emails(self):
        """Should return list of emails on success."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "emails": ["user1@example.com", "user2@example.com"],
            "count": 2,
        }
        mock_response.raise_for_status = MagicMock()

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            emails = await UserServiceClient.get_subscribed_emails()

            assert emails == ["user1@example.com", "user2@example.com"]
            mock_client.get.assert_called_once_with("/users/subscribed-emails")

    async def test_returns_empty_list(self):
        """Should return empty list when no users subscribed."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"emails": [], "count": 0}
        mock_response.raise_for_status = MagicMock()

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            emails = await UserServiceClient.get_subscribed_emails()

            assert emails == []

    async def test_raises_on_timeout(self):
        """Should raise UserServiceTimeoutError on timeout."""
        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(
                side_effect=httpx.TimeoutException("Connection timeout")
            )
            mock_get_client.return_value = mock_client

            with pytest.raises(UserServiceTimeoutError):
                await UserServiceClient.get_subscribed_emails()

    async def test_raises_on_auth_error_401(self):
        """Should raise UserServiceAuthError on 401."""
        mock_response = MagicMock()
        mock_response.status_code = 401

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            with pytest.raises(UserServiceAuthError):
                await UserServiceClient.get_subscribed_emails()

    async def test_raises_on_auth_error_403(self):
        """Should raise UserServiceAuthError on 403."""
        mock_response = MagicMock()
        mock_response.status_code = 403

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            with pytest.raises(UserServiceAuthError):
                await UserServiceClient.get_subscribed_emails()

    async def test_raises_on_http_error(self):
        """Should raise UserServiceError on other HTTP errors."""
        mock_response = MagicMock()
        mock_response.status_code = 500

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
                "Server error",
                request=MagicMock(),
                response=mock_response,
            )
            mock_get_client.return_value = mock_client

            with pytest.raises(UserServiceError):
                await UserServiceClient.get_subscribed_emails()


class TestUnsubscribeByEmail:
    """Tests for unsubscribe_by_email method."""

    async def test_unsubscribes_user(self):
        """Should successfully unsubscribe user."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.put = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            await UserServiceClient.unsubscribe_by_email("test@example.com")

            mock_client.put.assert_called_once_with(
                "/users/by-email/test@example.com",
                json={"email": "test@example.com", "is_subscribed": False},
            )

    async def test_raises_on_not_found(self):
        """Should raise UserNotFoundError when user not found."""
        mock_response = MagicMock()
        mock_response.status_code = 404

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.put = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            with pytest.raises(UserNotFoundError):
                await UserServiceClient.unsubscribe_by_email("nonexistent@example.com")

    async def test_raises_on_timeout(self):
        """Should raise UserServiceTimeoutError on timeout."""
        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.put = AsyncMock(
                side_effect=httpx.TimeoutException("Connection timeout")
            )
            mock_get_client.return_value = mock_client

            with pytest.raises(UserServiceTimeoutError):
                await UserServiceClient.unsubscribe_by_email("test@example.com")

    async def test_raises_on_auth_error(self):
        """Should raise UserServiceAuthError on 401."""
        mock_response = MagicMock()
        mock_response.status_code = 401

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.put = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            with pytest.raises(UserServiceAuthError):
                await UserServiceClient.unsubscribe_by_email("test@example.com")


class TestRecordMailReceived:
    """Tests for record_mail_received method."""

    async def test_records_mail(self):
        """Should successfully record mail received."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.post = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            await UserServiceClient.record_mail_received(
                "test@example.com", "campaign123"
            )

            mock_client.post.assert_called_once_with(
                "/users/by-email/test@example.com/mails/campaign123"
            )

    async def test_handles_not_found_gracefully(self):
        """Should not raise when user not found (logs warning)."""
        mock_response = MagicMock()
        mock_response.status_code = 404

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.post = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            # Should not raise
            await UserServiceClient.record_mail_received(
                "nonexistent@example.com", "campaign123"
            )

    async def test_handles_timeout_gracefully(self):
        """Should not raise on timeout (logs warning)."""
        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.post = AsyncMock(
                side_effect=httpx.TimeoutException("Connection timeout")
            )
            mock_get_client.return_value = mock_client

            # Should not raise
            await UserServiceClient.record_mail_received(
                "test@example.com", "campaign123"
            )

    async def test_raises_on_auth_error(self):
        """Should raise UserServiceAuthError on 401."""
        mock_response = MagicMock()
        mock_response.status_code = 401

        with patch.object(UserServiceClient, "_get_client") as mock_get_client:
            mock_client = AsyncMock()
            mock_client.post = AsyncMock(return_value=mock_response)
            mock_get_client.return_value = mock_client

            with pytest.raises(UserServiceAuthError):
                await UserServiceClient.record_mail_received(
                    "test@example.com", "campaign123"
                )


class TestClose:
    """Tests for close method."""

    async def test_closes_client(self):
        """Should close the HTTP client."""
        mock_client = AsyncMock()
        UserServiceClient._client = mock_client

        await UserServiceClient.close()

        mock_client.aclose.assert_called_once()
        assert UserServiceClient._client is None

    async def test_handles_no_client(self):
        """Should handle case when client is None."""
        UserServiceClient._client = None

        # Should not raise
        await UserServiceClient.close()

        assert UserServiceClient._client is None
