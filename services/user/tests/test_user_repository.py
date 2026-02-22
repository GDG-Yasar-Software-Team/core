"""Tests for user repository."""

from datetime import datetime
from unittest.mock import MagicMock

import pytest
from bson import ObjectId

from app.repositories.user_repository import (
    DuplicateEmailError,
    UserNotFoundError,
    UserRepository,
)
from tests.conftest import create_async_cursor


class TestCreate:
    """Tests for UserRepository.create()."""

    async def test_inserts_document_with_defaults(self, mock_mongodb):
        """Create inserts a document with default values."""
        from app.models.user import User

        mock_mongodb["users"].find_one.return_value = None  # No existing user
        mock_mongodb["users"].insert_one.return_value = MagicMock(
            inserted_id=ObjectId("507f1f77bcf86cd799439011")
        )

        user = User(email="test@example.com")
        user_id = await UserRepository.create(user)

        assert user_id == "507f1f77bcf86cd799439011"
        mock_mongodb["users"].insert_one.assert_called_once()

        # Verify the document structure
        call_args = mock_mongodb["users"].insert_one.call_args[0][0]
        assert call_args["email"] == "test@example.com"
        assert call_args["is_yasar_student"] is False
        assert call_args["is_subscribed"] is True
        assert call_args["turkish_identity_number"] is None
        assert call_args["submitted_form_ids"] == []
        assert call_args["submitted_form_count"] == 0
        assert call_args["received_mail_ids"] == []
        assert call_args["received_mail_count"] == 0
        assert "created_at" in call_args
        assert isinstance(call_args["created_at"], datetime)

    async def test_sets_timestamps(self, mock_mongodb):
        """Create sets created_at timestamp."""
        from app.models.user import User

        mock_mongodb["users"].find_one.return_value = None
        mock_mongodb["users"].insert_one.return_value = MagicMock(
            inserted_id=ObjectId()
        )

        user = User(email="test@example.com")
        await UserRepository.create(user)

        call_args = mock_mongodb["users"].insert_one.call_args[0][0]
        assert "created_at" in call_args
        assert call_args["updated_at"] is None

    async def test_returns_id_string(self, mock_mongodb):
        """Create returns the inserted ID as string."""
        from app.models.user import User

        expected_id = ObjectId("507f1f77bcf86cd799439011")
        mock_mongodb["users"].find_one.return_value = None
        mock_mongodb["users"].insert_one.return_value = MagicMock(
            inserted_id=expected_id
        )

        user = User(email="test@example.com")
        user_id = await UserRepository.create(user)

        assert user_id == str(expected_id)
        assert isinstance(user_id, str)

    async def test_rejects_duplicate_email(self, mock_mongodb):
        """Create raises DuplicateEmailError for existing email."""
        from app.models.user import User

        mock_mongodb["users"].find_one.return_value = {
            "_id": ObjectId(),
            "email": "existing@example.com",
        }

        user = User(email="existing@example.com")
        with pytest.raises(DuplicateEmailError) as exc_info:
            await UserRepository.create(user)

        assert "existing@example.com" in str(exc_info.value)

    async def test_preserves_provided_values(self, mock_mongodb):
        """Create preserves user-provided optional values."""
        from app.models.user import User

        mock_mongodb["users"].find_one.return_value = None
        mock_mongodb["users"].insert_one.return_value = MagicMock(
            inserted_id=ObjectId()
        )

        user = User(
            email="test@example.com",
            name="Test User",
            is_yasar_student=True,
            section="Engineering",
            turkish_identity_number="12345678901",
            is_subscribed=False,
        )
        await UserRepository.create(user)

        call_args = mock_mongodb["users"].insert_one.call_args[0][0]
        assert call_args["name"] == "Test User"
        assert call_args["is_yasar_student"] is True
        assert call_args["section"] == "Engineering"
        assert call_args["turkish_identity_number"] == "12345678901"
        assert call_args["is_subscribed"] is False


class TestGetByEmail:
    """Tests for UserRepository.get_by_email()."""

    async def test_returns_user_when_found(self, mock_mongodb, sample_user_doc):
        """get_by_email returns UserInDB when found."""
        mock_mongodb["users"].find_one.return_value = sample_user_doc

        user = await UserRepository.get_by_email("user1@example.com")

        assert user is not None
        assert user.email == "user1@example.com"
        mock_mongodb["users"].find_one.assert_called_once_with(
            {"email": "user1@example.com"}
        )

    async def test_returns_none_when_not_found(self, mock_mongodb):
        """get_by_email returns None when user not found."""
        mock_mongodb["users"].find_one.return_value = None

        user = await UserRepository.get_by_email("nonexistent@example.com")

        assert user is None


class TestUpdate:
    """Tests for UserRepository.update()."""

    async def test_partial_updates_work(self, mock_mongodb, sample_user_doc):
        """Update only updates non-None fields."""
        from app.models.user import User

        # Return updated doc after update
        updated_doc = {**sample_user_doc, "name": "Updated Name"}
        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=1)
        mock_mongodb["users"].find_one.return_value = updated_doc

        update = User(email="user1@example.com", name="Updated Name")
        result = await UserRepository.update("user1@example.com", update)

        assert result.name == "Updated Name"
        # Verify only name was in $set (plus updated_at)
        call_args = mock_mongodb["users"].update_one.call_args[0][1]
        assert "name" in call_args["$set"]
        assert "updated_at" in call_args["$set"]

    async def test_updates_updated_at(self, mock_mongodb, sample_user_doc):
        """Update sets updated_at timestamp."""
        from app.models.user import User

        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=1)
        mock_mongodb["users"].find_one.return_value = sample_user_doc

        update = User(email="user1@example.com", name="New Name")
        await UserRepository.update("user1@example.com", update)

        call_args = mock_mongodb["users"].update_one.call_args[0][1]
        assert "updated_at" in call_args["$set"]
        assert isinstance(call_args["$set"]["updated_at"], datetime)

    async def test_updates_turkish_identity_number(self, mock_mongodb, sample_user_doc):
        """Update writes turkish_identity_number when provided."""
        from app.models.user import User

        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=1)
        mock_mongodb["users"].find_one.return_value = {
            **sample_user_doc,
            "turkish_identity_number": "12345678901",
        }

        update = User(
            email="user1@example.com",
            turkish_identity_number="12345678901",
        )
        await UserRepository.update("user1@example.com", update)

        call_args = mock_mongodb["users"].update_one.call_args[0][1]
        assert call_args["$set"]["turkish_identity_number"] == "12345678901"

    async def test_raises_user_not_found_error(self, mock_mongodb):
        """Update raises UserNotFoundError when user not found."""
        from app.models.user import User

        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=0)

        update = User(email="nonexistent@example.com", name="New Name")
        with pytest.raises(UserNotFoundError):
            await UserRepository.update("nonexistent@example.com", update)

    async def test_sets_unsubscribed_at_when_unsubscribing(
        self, mock_mongodb, sample_user_doc
    ):
        """Update sets unsubscribed_at when is_subscribed changes to False."""
        from app.models.user import User

        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=1)
        mock_mongodb["users"].find_one.return_value = {
            **sample_user_doc,
            "is_subscribed": False,
        }

        update = User(email="user1@example.com", is_subscribed=False)
        await UserRepository.update("user1@example.com", update)

        call_args = mock_mongodb["users"].update_one.call_args[0][1]
        assert "unsubscribed_at" in call_args["$set"]


class TestGetSubscribedEmails:
    """Tests for UserRepository.get_subscribed_emails()."""

    async def test_returns_only_subscribed_users_emails(
        self, mock_mongodb, sample_users_docs
    ):
        """get_subscribed_emails returns only emails where is_subscribed=True."""
        # Filter to only subscribed users
        subscribed_docs = [d for d in sample_users_docs if d.get("is_subscribed", True)]
        mock_mongodb["users"].find.return_value = create_async_cursor(subscribed_docs)

        emails = await UserRepository.get_subscribed_emails()

        assert "user1@example.com" in emails
        assert "student@stu.yasar.edu.tr" in emails
        assert "unsubscribed@example.com" not in emails
        mock_mongodb["users"].find.assert_called_once_with({"is_subscribed": True})


class TestAddSubmittedForm:
    """Tests for UserRepository.add_submitted_form()."""

    async def test_appends_form_id(self, mock_mongodb):
        """add_submitted_form appends form ID to submitted_form_ids."""
        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=1)
        form_id = "507f1f77bcf86cd799439030"

        await UserRepository.add_submitted_form("user1@example.com", form_id)

        call_args = mock_mongodb["users"].update_one.call_args
        assert call_args[0][0] == {
            "email": "user1@example.com",
            "submitted_form_ids": {"$ne": ObjectId(form_id)},
        }
        update_doc = call_args[0][1]
        assert "$push" in update_doc
        assert "submitted_form_ids" in update_doc["$push"]
        assert "$inc" in update_doc
        assert "$set" in update_doc
        assert "updated_at" in update_doc["$set"]
        assert update_doc["$inc"]["submitted_form_count"] == 1

    async def test_raises_not_found_for_missing_user(self, mock_mongodb):
        """add_submitted_form raises UserNotFoundError for non-existent user."""
        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=0)
        mock_mongodb["users"].find_one.return_value = None

        with pytest.raises(UserNotFoundError):
            await UserRepository.add_submitted_form(
                "nonexistent@example.com", "507f1f77bcf86cd799439030"
            )

    async def test_noops_when_form_already_recorded(self, mock_mongodb):
        """add_submitted_form is idempotent for existing form IDs."""
        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=0)
        mock_mongodb["users"].find_one.return_value = {
            "_id": ObjectId("507f1f77bcf86cd799439011")
        }

        await UserRepository.add_submitted_form(
            "user1@example.com", "507f1f77bcf86cd799439030"
        )

        mock_mongodb["users"].find_one.assert_called_once_with(
            {"email": "user1@example.com"},
            {"_id": 1},
        )


class TestAddReceivedMail:
    """Tests for UserRepository.add_received_mail()."""

    async def test_appends_mail_id(self, mock_mongodb):
        """add_received_mail appends mail ID to received_mail_ids."""
        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=1)
        mail_id = "507f1f77bcf86cd799439040"

        await UserRepository.add_received_mail("user1@example.com", mail_id)

        call_args = mock_mongodb["users"].update_one.call_args
        assert call_args[0][0] == {
            "email": "user1@example.com",
            "received_mail_ids": {"$ne": ObjectId(mail_id)},
        }
        update_doc = call_args[0][1]
        assert "$push" in update_doc
        assert "received_mail_ids" in update_doc["$push"]
        assert "$inc" in update_doc
        assert "$set" in update_doc
        assert "updated_at" in update_doc["$set"]
        assert update_doc["$inc"]["received_mail_count"] == 1

    async def test_raises_not_found_for_missing_user(self, mock_mongodb):
        """add_received_mail raises UserNotFoundError for non-existent user."""
        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=0)
        mock_mongodb["users"].find_one.return_value = None

        with pytest.raises(UserNotFoundError):
            await UserRepository.add_received_mail(
                "nonexistent@example.com", "507f1f77bcf86cd799439040"
            )

    async def test_noops_when_mail_already_recorded(self, mock_mongodb):
        """add_received_mail is idempotent for existing mail IDs."""
        mock_mongodb["users"].update_one.return_value = MagicMock(matched_count=0)
        mock_mongodb["users"].find_one.return_value = {
            "_id": ObjectId("507f1f77bcf86cd799439011")
        }

        await UserRepository.add_received_mail(
            "user1@example.com", "507f1f77bcf86cd799439040"
        )

        mock_mongodb["users"].find_one.assert_called_once_with(
            {"email": "user1@example.com"},
            {"_id": 1},
        )


class TestGetById:
    """Tests for UserRepository.get_by_id()."""

    async def test_returns_user_when_found(self, mock_mongodb, sample_user_doc):
        """get_by_id returns UserInDB when found."""
        mock_mongodb["users"].find_one.return_value = sample_user_doc

        user = await UserRepository.get_by_id("507f1f77bcf86cd799439011")

        assert user is not None
        assert str(user.id) == "507f1f77bcf86cd799439011"

    async def test_returns_none_when_not_found(self, mock_mongodb):
        """get_by_id returns None when user not found."""
        mock_mongodb["users"].find_one.return_value = None

        user = await UserRepository.get_by_id("507f1f77bcf86cd799439011")

        assert user is None

    async def test_returns_none_for_invalid_id(self, mock_mongodb):
        """get_by_id returns None for invalid ObjectId."""
        user = await UserRepository.get_by_id("invalid-id")

        assert user is None
        mock_mongodb["users"].find_one.assert_not_called()
