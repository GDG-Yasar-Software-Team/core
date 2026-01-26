from itsdangerous import BadSignature, URLSafeSerializer

from app.clients.user_client import UserServiceClient
from app.config import settings
from app.utils.logger import logger


class InvalidTokenError(Exception):
    """Raised when an unsubscribe token is invalid."""

    pass


class UnsubscribeService:
    _serializer: URLSafeSerializer | None = None

    @classmethod
    def _get_serializer(cls) -> URLSafeSerializer:
        if cls._serializer is None:
            cls._serializer = URLSafeSerializer(settings.UNSUBSCRIBE_SECRET_KEY)
        return cls._serializer

    @classmethod
    def generate_token(cls, email: str) -> str:
        """Generate a signed unsubscribe token for a user email."""
        serializer = cls._get_serializer()
        return serializer.dumps({"email": email})

    @classmethod
    def verify_token(cls, token: str) -> str:
        """
        Verify an unsubscribe token and return the email.

        Raises:
            InvalidTokenError: If the token is invalid or tampered with.
        """
        if not token:
            raise InvalidTokenError("Token cannot be empty")

        serializer = cls._get_serializer()
        try:
            data = serializer.loads(token)
            email = data.get("email")
            if not email:
                raise InvalidTokenError("Token missing email")
            return email
        except BadSignature:
            raise InvalidTokenError("Invalid or tampered token")

    @classmethod
    async def unsubscribe_by_token(cls, token: str) -> str:
        """
        Unsubscribe a user using their token.

        Returns:
            The user's email address.

        Raises:
            InvalidTokenError: If the token is invalid.
            UserNotFoundError: If the user is not found.
        """
        email = cls.verify_token(token)

        await UserServiceClient.unsubscribe_by_email(email)
        logger.info("User unsubscribed via token", email=email)

        return email

    @classmethod
    def get_user_email_from_token(cls, token: str) -> str | None:
        """
        Get the user's email from a token without unsubscribing.

        Returns:
            The user's email or None if invalid.
        """
        try:
            return cls.verify_token(token)
        except InvalidTokenError:
            return None
