from bson import ObjectId

from app.config import settings
from app.db.mongodb import MongoDB
from app.models.user import UserEmailInfo
from app.utils.logger import logger


class UserNotFoundError(Exception):
    """Raised when a user is not found."""

    pass


class UserRepository:
    @classmethod
    def _get_collection(cls):
        return MongoDB.get_db()[settings.USERS_COLLECTION]

    @classmethod
    async def get_subscribed_users(cls) -> list[UserEmailInfo]:
        """Fetch all users with isSubscribed=true."""
        collection = cls._get_collection()
        users = []

        cursor = collection.find({"isSubscribed": True})
        async for doc in cursor:
            try:
                # Skip documents missing required fields
                if "_id" not in doc or "email" not in doc:
                    logger.warning(
                        "Skipping user document missing required fields",
                        doc_id=str(doc.get("_id", "unknown")),
                    )
                    continue
                users.append(UserEmailInfo.model_validate(doc))
            except Exception as e:
                logger.warning(
                    "Skipping invalid user document",
                    doc_id=str(doc.get("_id", "unknown")),
                    error=str(e),
                )
                continue

        return users

    @classmethod
    async def unsubscribe_by_id(cls, user_id: str) -> None:
        """Set isSubscribed=false for a user by ID."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(user_id):
            raise UserNotFoundError(f"Invalid user ID: {user_id}")

        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"isSubscribed": False}},
        )

        if result.matched_count == 0:
            raise UserNotFoundError(f"User not found: {user_id}")

        logger.info("User unsubscribed", user_id=user_id)

    @classmethod
    async def unsubscribe_by_email(cls, email: str) -> None:
        """Set isSubscribed=false for a user by email."""
        collection = cls._get_collection()

        result = await collection.update_one(
            {"email": email},
            {"$set": {"isSubscribed": False}},
        )

        if result.matched_count == 0:
            raise UserNotFoundError(f"User not found with email: {email}")

        logger.info("User unsubscribed", email=email)

    @classmethod
    async def get_user_by_id(cls, user_id: str) -> UserEmailInfo | None:
        """Get a user by ID."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(user_id):
            return None

        doc = await collection.find_one({"_id": ObjectId(user_id)})
        if doc is None:
            return None

        try:
            return UserEmailInfo.model_validate(doc)
        except Exception:
            return None

    @classmethod
    async def get_user_by_email(cls, email: str) -> UserEmailInfo | None:
        """Get a user by email."""
        collection = cls._get_collection()

        doc = await collection.find_one({"email": email})
        if doc is None:
            return None

        try:
            return UserEmailInfo.model_validate(doc)
        except Exception:
            return None
