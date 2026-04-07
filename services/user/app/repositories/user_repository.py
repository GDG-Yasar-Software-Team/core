from datetime import datetime

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.db.mongodb import MongoDB
from app.models.user import User, UserInDB
from app.utils.email import normalize_email
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
        normalized_email = normalize_email(str(user.email))
        normalized_user = user.model_copy(update={"email": normalized_email})

        # Check for duplicate email
        existing = await collection.find_one({"email": normalized_email})
        if existing:
            raise DuplicateEmailError(
                f"User with email {normalized_email} already exists"
            )

        # Build document with defaults
        doc = {
            "email": normalized_email,
            "name": normalized_user.name,
            "is_yasar_student": normalized_user.is_yasar_student
            if normalized_user.is_yasar_student is not None
            else False,
            "section": normalized_user.section,
            "grade": normalized_user.grade,
            "turkish_identity_number": normalized_user.turkish_identity_number,
            "submitted_form_ids": [],
            "submitted_form_count": 0,
            "received_mail_ids": [],
            "received_mail_count": 0,
            "is_subscribed": normalized_user.is_subscribed
            if normalized_user.is_subscribed is not None
            else True,
            "unsubscribed_at": None,
            "created_at": datetime.now(),
            "updated_at": None,
        }

        try:
            result = await collection.insert_one(doc)
        except DuplicateKeyError as exc:
            raise DuplicateEmailError(
                f"User with email {normalized_email} already exists"
            ) from exc
        logger.info(
            "User created", email=normalized_email, user_id=str(result.inserted_id)
        )
        return str(result.inserted_id)

    @classmethod
    async def get_by_email(cls, email: str) -> UserInDB | None:
        """Get a user by email."""
        collection = cls._get_collection()
        normalized_email = normalize_email(email)

        doc = await collection.find_one({"email": normalized_email})
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
        normalized_email = normalize_email(email)
        normalized_update = update.model_copy(
            update={"email": normalize_email(str(update.email))}
        )

        # Build update document with only non-None fields
        update_fields = {"updated_at": datetime.now()}

        if normalized_update.email != normalized_email:
            update_fields["email"] = normalized_update.email
        if normalized_update.name is not None:
            update_fields["name"] = normalized_update.name
        if normalized_update.is_yasar_student is not None:
            update_fields["is_yasar_student"] = normalized_update.is_yasar_student
        if normalized_update.section is not None:
            update_fields["section"] = normalized_update.section
        if normalized_update.grade is not None:
            update_fields["grade"] = normalized_update.grade
        if normalized_update.turkish_identity_number is not None:
            update_fields["turkish_identity_number"] = (
                normalized_update.turkish_identity_number
            )
        if normalized_update.is_subscribed is not None:
            update_fields["is_subscribed"] = normalized_update.is_subscribed
            # Set unsubscribed_at when unsubscribing
            if not normalized_update.is_subscribed:
                update_fields["unsubscribed_at"] = datetime.now()

        result = await collection.update_one(
            {"email": normalized_email},
            {"$set": update_fields},
        )

        if result.matched_count == 0:
            raise UserNotFoundError(f"User not found with email: {normalized_email}")

        logger.info("User updated", email=normalized_email)

        # Return updated user
        updated_user = await cls.get_by_email(normalized_update.email)
        if updated_user is None:
            raise UserNotFoundError(
                f"User not found after update: {normalized_update.email}"
            )
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
        normalized_email = normalize_email(email)

        result = await collection.update_one(
            {"email": normalized_email, "submitted_form_ids": {"$ne": form_object_id}},
            {
                "$push": {"submitted_form_ids": form_object_id},
                "$inc": {"submitted_form_count": 1},
                "$set": {"updated_at": datetime.now()},
            },
        )

        if result.matched_count == 0:
            user = await collection.find_one({"email": normalized_email}, {"_id": 1})
            if user is None:
                raise UserNotFoundError(
                    f"User not found with email: {normalized_email}"
                )
            logger.info(
                "Form submission already recorded",
                email=normalized_email,
                form_id=form_id,
            )
            return

        logger.info("Form submission recorded", email=normalized_email, form_id=form_id)

    @classmethod
    async def add_received_mail(cls, email: str, mail_id: str) -> None:
        """Add a mail ID to user's received_mail_ids idempotently."""
        collection = cls._get_collection()
        mail_object_id = ObjectId(mail_id)
        normalized_email = normalize_email(email)

        result = await collection.update_one(
            {"email": normalized_email, "received_mail_ids": {"$ne": mail_object_id}},
            {
                "$push": {"received_mail_ids": mail_object_id},
                "$inc": {"received_mail_count": 1},
                "$set": {"updated_at": datetime.now()},
            },
        )

        if result.matched_count == 0:
            user = await collection.find_one({"email": normalized_email}, {"_id": 1})
            if user is None:
                raise UserNotFoundError(
                    f"User not found with email: {normalized_email}"
                )
            logger.info(
                "Mail receipt already recorded",
                email=normalized_email,
                mail_id=mail_id,
            )
            return

        logger.info("Mail received recorded", email=normalized_email, mail_id=mail_id)
