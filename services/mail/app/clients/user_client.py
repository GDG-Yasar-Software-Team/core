"""HTTP client for user service communication."""

import httpx

from app.config import settings
from app.utils.logger import logger


class UserServiceError(Exception):
    """Base exception for user service errors."""

    pass


class UserServiceAuthError(UserServiceError):
    """Raised when authentication with user service fails."""

    pass


class UserServiceTimeoutError(UserServiceError):
    """Raised when user service request times out."""

    pass


class UserNotFoundError(UserServiceError):
    """Raised when a user is not found in user service."""

    pass


class UserServiceClient:
    """HTTP client for user service API."""

    _client: httpx.AsyncClient | None = None

    @classmethod
    def _get_client(cls) -> httpx.AsyncClient:
        """Get or create the HTTP client."""
        if cls._client is None:
            cls._client = httpx.AsyncClient(
                base_url=settings.USER_SERVICE_URL,
                timeout=settings.USER_SERVICE_TIMEOUT,
                headers={"X-API-Token": settings.USER_SERVICE_TOKEN},
            )
        return cls._client

    @classmethod
    async def get_subscribed_emails(cls) -> list[str]:
        """
        Fetch all subscribed user emails from user service.

        Returns:
            List of email addresses.

        Raises:
            UserServiceAuthError: If authentication fails.
            UserServiceTimeoutError: If request times out.
            UserServiceError: For other errors.
        """
        client = cls._get_client()

        try:
            response = await client.get("/users/subscribed-emails")

            if response.status_code == 401:
                raise UserServiceAuthError("Invalid or missing API token")
            if response.status_code == 403:
                raise UserServiceAuthError("Access forbidden")

            response.raise_for_status()

            data = response.json()
            emails = data.get("emails", [])

            logger.info("Fetched subscribed emails", count=len(emails))
            return emails

        except httpx.TimeoutException as e:
            logger.error("User service timeout", error=str(e))
            raise UserServiceTimeoutError("User service request timed out") from e
        except httpx.HTTPStatusError as e:
            logger.error(
                "User service HTTP error",
                status_code=e.response.status_code,
                error=str(e),
            )
            raise UserServiceError(
                f"User service error: {e.response.status_code}"
            ) from e
        except httpx.RequestError as e:
            logger.error("User service request error", error=str(e))
            raise UserServiceError(f"User service request failed: {e}") from e

    @classmethod
    async def unsubscribe_by_email(cls, email: str) -> None:
        """
        Unsubscribe a user by their email address.

        Args:
            email: The user's email address.

        Raises:
            UserNotFoundError: If user not found.
            UserServiceAuthError: If authentication fails.
            UserServiceTimeoutError: If request times out.
            UserServiceError: For other errors.
        """
        client = cls._get_client()

        try:
            response = await client.put(
                f"/users/by-email/{email}",
                json={"email": email, "is_subscribed": False},
            )

            if response.status_code == 401:
                raise UserServiceAuthError("Invalid or missing API token")
            if response.status_code == 403:
                raise UserServiceAuthError("Access forbidden")
            if response.status_code == 404:
                raise UserNotFoundError(f"User not found: {email}")

            response.raise_for_status()

            logger.info("User unsubscribed via user service", email=email)

        except httpx.TimeoutException as e:
            logger.error("User service timeout during unsubscribe", error=str(e))
            raise UserServiceTimeoutError("User service request timed out") from e
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise UserNotFoundError(f"User not found: {email}") from e
            logger.error(
                "User service HTTP error during unsubscribe",
                status_code=e.response.status_code,
                error=str(e),
            )
            raise UserServiceError(
                f"User service error: {e.response.status_code}"
            ) from e
        except httpx.RequestError as e:
            logger.error("User service request error during unsubscribe", error=str(e))
            raise UserServiceError(f"User service request failed: {e}") from e

    @classmethod
    async def record_mail_received(cls, email: str, mail_id: str) -> None:
        """
        Record that a user received a mail.

        Args:
            email: The user's email address.
            mail_id: The campaign/mail ID.

        Note:
            This method logs warnings but doesn't raise on 404 errors,
            as the user may have been deleted after the email was sent.
        """
        client = cls._get_client()

        try:
            response = await client.post(f"/users/by-email/{email}/mails/{mail_id}")

            if response.status_code == 401:
                raise UserServiceAuthError("Invalid or missing API token")
            if response.status_code == 403:
                raise UserServiceAuthError("Access forbidden")
            if response.status_code == 404:
                logger.warning(
                    "User not found when recording mail received",
                    email=email,
                    mail_id=mail_id,
                )
                return

            response.raise_for_status()

            logger.debug("Recorded mail received", email=email, mail_id=mail_id)

        except httpx.TimeoutException as e:
            logger.warning(
                "User service timeout when recording mail received",
                email=email,
                mail_id=mail_id,
                error=str(e),
            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning(
                    "User not found when recording mail received",
                    email=email,
                    mail_id=mail_id,
                )
                return
            logger.warning(
                "User service error when recording mail received",
                email=email,
                mail_id=mail_id,
                status_code=e.response.status_code,
            )
        except httpx.RequestError as e:
            logger.warning(
                "User service request failed when recording mail received",
                email=email,
                mail_id=mail_id,
                error=str(e),
            )

    @classmethod
    async def close(cls) -> None:
        """Close the HTTP client."""
        if cls._client is not None:
            await cls._client.aclose()
            cls._client = None
            logger.info("User service client closed")
