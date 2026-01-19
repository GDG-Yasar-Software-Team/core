from itsdangerous import BadSignature, URLSafeSerializer

from app.config import settings
from app.repositories.user_repository import UserNotFoundError, UserRepository
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
    def generate_token(cls, user_id: str) -> str:
        """Generate a signed unsubscribe token for a user."""
        serializer = cls._get_serializer()
        return serializer.dumps({"user_id": user_id})

    @classmethod
    def verify_token(cls, token: str) -> str:
        """
        Verify an unsubscribe token and return the user ID.

        Raises:
            InvalidTokenError: If the token is invalid or tampered with.
        """
        if not token:
            raise InvalidTokenError("Token cannot be empty")

        serializer = cls._get_serializer()
        try:
            data = serializer.loads(token)
            user_id = data.get("user_id")
            if not user_id:
                raise InvalidTokenError("Token missing user_id")
            return user_id
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
        user_id = cls.verify_token(token)

        # Get user info before unsubscribing
        user = await UserRepository.get_user_by_id(user_id)
        if user is None:
            raise UserNotFoundError(f"User not found: {user_id}")

        await UserRepository.unsubscribe_by_id(user_id)
        logger.info("User unsubscribed via token", user_id=user_id, email=user.email)

        return user.email

    @classmethod
    async def get_user_email_from_token(cls, token: str) -> str | None:
        """
        Get the user's email from a token without unsubscribing.

        Returns:
            The user's email or None if invalid/not found.
        """
        try:
            user_id = cls.verify_token(token)
            user = await UserRepository.get_user_by_id(user_id)
            return user.email if user else None
        except InvalidTokenError:
            return None
