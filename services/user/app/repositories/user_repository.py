from datetime import datetime

from bson import ObjectId

from app.config import settings
from app.db.mongodb import MongoDB
from app.models.user import User, UserInDB
from app.utils.logger import logger


class UserNotFoundError(Exception):
    """Raised when a user is not found."""

    pass


class DuplicateEmailError(Exception):
    """Raised when attempting to create a user with an existing email."""

    pass


class UserRepository:
    @classmethod
    def _get_collection(cls):
        return MongoDB.get_db()[settings.USERS_COLLECTION]

    @classmethod
    async def create(cls, user: User) -> str:
        """Create a new user. Returns the inserted ID as string."""
        collection = cls._get_collection()

        # Check for duplicate email
        existing = await collection.find_one({"email": user.email})
        if existing:
            raise DuplicateEmailError(f"User with email {user.email} already exists")

        # Build document with defaults
        doc = {
            "email": user.email,
            "name": user.name,
            "is_yasar_student": user.is_yasar_student
            if user.is_yasar_student is not None
            else False,
            "section": user.section,
            "submitted_form_ids": [],
            "submitted_form_count": 0,
            "received_mail_ids": [],
            "received_mail_count": 0,
            "is_subscribed": user.is_subscribed
            if user.is_subscribed is not None
            else True,
            "unsubscribed_at": None,
            "created_at": datetime.now(),
            "updated_at": None,
        }

        result = await collection.insert_one(doc)
        logger.info("User created", email=user.email, user_id=str(result.inserted_id))
        return str(result.inserted_id)

    @classmethod
    async def get_by_email(cls, email: str) -> UserInDB | None:
        """Get a user by email."""
        collection = cls._get_collection()

        doc = await collection.find_one({"email": email})
        if doc is None:
            return None

        return UserInDB.model_validate(doc)

    @classmethod
    async def get_by_id(cls, user_id: str) -> UserInDB | None:
        """Get a user by ID."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(user_id):
            return None

        doc = await collection.find_one({"_id": ObjectId(user_id)})
        if doc is None:
            return None

        return UserInDB.model_validate(doc)

    @classmethod
    async def update(cls, email: str, update: User) -> UserInDB:
        """Update a user by email. Only updates non-None fields."""
        collection = cls._get_collection()

        # Build update document with only non-None fields
        update_fields = {"updated_at": datetime.now()}

        if update.name is not None:
            update_fields["name"] = update.name
        if update.is_yasar_student is not None:
            update_fields["is_yasar_student"] = update.is_yasar_student
        if update.section is not None:
            update_fields["section"] = update.section
        if update.is_subscribed is not None:
            update_fields["is_subscribed"] = update.is_subscribed
            # Set unsubscribed_at when unsubscribing
            if not update.is_subscribed:
                update_fields["unsubscribed_at"] = datetime.now()

        result = await collection.update_one(
            {"email": email},
            {"$set": update_fields},
        )

        if result.matched_count == 0:
            raise UserNotFoundError(f"User not found with email: {email}")

        logger.info("User updated", email=email)

        # Return updated user
        updated_user = await cls.get_by_email(email)
        if updated_user is None:
            raise UserNotFoundError(f"User not found after update: {email}")
        return updated_user

    @classmethod
    async def get_subscribed_emails(cls) -> list[str]:
        """Get all subscribed users' emails."""
        collection = cls._get_collection()

        emails = []
        cursor = collection.find({"is_subscribed": True})
        async for doc in cursor:
            if "email" in doc:
                emails.append(doc["email"])

        return emails

    @classmethod
    async def add_submitted_form(cls, email: str, form_id: str) -> None:
        """Add a form ID to user's submitted_form_ids idempotently."""
        collection = cls._get_collection()
        form_object_id = ObjectId(form_id)

        result = await collection.update_one(
            {"email": email, "submitted_form_ids": {"$ne": form_object_id}},
            {
                "$push": {"submitted_form_ids": form_object_id},
                "$inc": {"submitted_form_count": 1},
                "$set": {"updated_at": datetime.now()},
            },
        )

        if result.matched_count == 0:
            user = await collection.find_one({"email": email}, {"_id": 1})
            if user is None:
                raise UserNotFoundError(f"User not found with email: {email}")
            logger.info(
                "Form submission already recorded",
                email=email,
                form_id=form_id,
            )
            return

        logger.info("Form submission recorded", email=email, form_id=form_id)

    @classmethod
    async def add_received_mail(cls, email: str, mail_id: str) -> None:
        """Add a mail ID to user's received_mail_ids idempotently."""
        collection = cls._get_collection()
        mail_object_id = ObjectId(mail_id)

        result = await collection.update_one(
            {"email": email, "received_mail_ids": {"$ne": mail_object_id}},
            {
                "$push": {"received_mail_ids": mail_object_id},
                "$inc": {"received_mail_count": 1},
                "$set": {"updated_at": datetime.now()},
            },
        )

        if result.matched_count == 0:
            user = await collection.find_one({"email": email}, {"_id": 1})
            if user is None:
                raise UserNotFoundError(f"User not found with email: {email}")
            logger.info(
                "Mail receipt already recorded",
                email=email,
                mail_id=mail_id,
            )
            return

        logger.info("Mail received recorded", email=email, mail_id=mail_id)
