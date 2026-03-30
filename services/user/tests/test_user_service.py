"""Tests for user service."""

from datetime import datetime
from unittest.mock import AsyncMock, patch

import pytest
from bson import ObjectId

from app.models.user import User, UserInDB
from app.repositories.user_repository import DuplicateEmailError, UserNotFoundError
from app.services.user_service import UserService


class TestCreateUser:
    """Tests for UserService.create_user()."""

    async def test_creates_user(self, mock_mongodb):
        """create_user delegates to repository."""
        with patch(
            "app.services.user_service.UserRepository.create",
            new_callable=AsyncMock,
            return_value="507f1f77bcf86cd799439011",
        ):
            user = User(email="test@example.com", name="Test User")
            user_id = await UserService.create_user(user)

            assert user_id == "507f1f77bcf86cd799439011"

    async def test_auto_detects_yasar_student_by_email(self, mock_mongodb):
        """create_user auto-sets is_yasar_student for stu.yasar.edu.tr emails."""
        captured_user = None

        async def capture_create(user: User):
            nonlocal captured_user
            captured_user = user
            return "507f1f77bcf86cd799439011"

        with patch(
            "app.services.user_service.UserRepository.create",
            side_effect=capture_create,
        ):
            user = User(email="student@stu.yasar.edu.tr")
            await UserService.create_user(user)

            assert captured_user is not None
            assert captured_user.is_yasar_student is True

    async def test_auto_detect_keeps_turkish_identity_number(self, mock_mongodb):
        """create_user keeps turkish_identity_number while auto-detecting student flag."""
        captured_user = None

        async def capture_create(user: User):
            nonlocal captured_user
            captured_user = user
            return "507f1f77bcf86cd799439011"

        with patch(
            "app.services.user_service.UserRepository.create",
            side_effect=capture_create,
        ):
            user = User(
                email="student@stu.yasar.edu.tr",
                turkish_identity_number="12345678901",
            )
            await UserService.create_user(user)

            assert captured_user is not None
            assert captured_user.is_yasar_student is True
            assert captured_user.turkish_identity_number == "12345678901"

    async def test_does_not_override_explicit_yasar_student(self, mock_mongodb):
        """create_user respects explicit is_yasar_student=False."""
        captured_user = None

        async def capture_create(user: User):
            nonlocal captured_user
            captured_user = user
            return "507f1f77bcf86cd799439011"

        with patch(
            "app.services.user_service.UserRepository.create",
            side_effect=capture_create,
        ):
            user = User(email="student@stu.yasar.edu.tr", is_yasar_student=False)
            await UserService.create_user(user)

            assert captured_user is not None
            assert captured_user.is_yasar_student is False

    async def test_non_yasar_email_not_auto_detected(self, mock_mongodb):
        """create_user does not auto-set is_yasar_student for non-Yasar emails."""
        captured_user = None

        async def capture_create(user: User):
            nonlocal captured_user
            captured_user = user
            return "507f1f77bcf86cd799439011"

        with patch(
            "app.services.user_service.UserRepository.create",
            side_effect=capture_create,
        ):
            user = User(email="test@example.com")
            await UserService.create_user(user)

            assert captured_user is not None
            # Should remain None (not auto-detected)
            assert captured_user.is_yasar_student is None

    async def test_raises_duplicate_email_error(self, mock_mongodb):
        """create_user propagates DuplicateEmailError."""
        with patch(
            "app.services.user_service.UserRepository.create",
            new_callable=AsyncMock,
            side_effect=DuplicateEmailError("User exists"),
        ):
            user = User(email="existing@example.com")
            with pytest.raises(DuplicateEmailError):
                await UserService.create_user(user)

    async def test_normalizes_email_before_create(self, mock_mongodb):
        """create_user normalizes email before delegating to repository."""
        captured_user = None

        async def capture_create(user: User):
            nonlocal captured_user
            captured_user = user
            return "507f1f77bcf86cd799439011"

        with patch(
            "app.services.user_service.UserRepository.create",
            side_effect=capture_create,
        ):
            await UserService.create_user(User(email=" Test@Example.com "))

            assert captured_user is not None
            assert str(captured_user.email) == "test@example.com"


class TestUpdateUser:
    """Tests for UserService.update_user()."""

    async def test_updates_user(self, mock_mongodb, sample_user_doc):
        """update_user delegates to repository and returns response."""
        updated_user = UserInDB(
            _id=ObjectId("507f1f77bcf86cd799439011"),
            email="user1@example.com",
            name="Updated Name",
            is_yasar_student=False,
            submitted_form_ids=[],
            submitted_form_count=0,
            received_mail_ids=[],
            received_mail_count=0,
            is_subscribed=True,
            created_at=datetime(2025, 1, 15, 12, 0, 0),
            updated_at=datetime.now(),
        )

        with patch(
            "app.services.user_service.UserRepository.update",
            new_callable=AsyncMock,
            return_value=updated_user,
        ):
            update = User(email="user1@example.com", name="Updated Name")
            response = await UserService.update_user("user1@example.com", update)

            assert response.name == "Updated Name"
            assert response.email == "user1@example.com"

    async def test_raises_user_not_found(self, mock_mongodb):
        """update_user propagates UserNotFoundError."""
        with patch(
            "app.services.user_service.UserRepository.update",
            new_callable=AsyncMock,
            side_effect=UserNotFoundError("User not found"),
        ):
            update = User(email="nonexistent@example.com", name="New Name")
            with pytest.raises(UserNotFoundError):
                await UserService.update_user("nonexistent@example.com", update)

    async def test_normalizes_emails_before_update(self, mock_mongodb, sample_user_doc):
        """update_user normalizes both route and payload emails."""
        updated_user = UserInDB(
            _id=ObjectId("507f1f77bcf86cd799439011"),
            email="newemail@example.com",
            name="Updated Name",
            is_yasar_student=False,
            submitted_form_ids=[],
            submitted_form_count=0,
            received_mail_ids=[],
            received_mail_count=0,
            is_subscribed=True,
            created_at=datetime(2025, 1, 15, 12, 0, 0),
            updated_at=datetime.now(),
        )

        with patch(
            "app.services.user_service.UserRepository.update",
            new_callable=AsyncMock,
            return_value=updated_user,
        ) as mock_update:
            await UserService.update_user(
                " User1@Example.com ",
                User(email=" NewEmail@Example.com ", name="Updated Name"),
            )

            mock_update.assert_called_once()
            call_args = mock_update.call_args[0]
            assert call_args[0] == "user1@example.com"
            assert str(call_args[1].email) == "newemail@example.com"


class TestGetUserByEmail:
    """Tests for UserService.get_user_by_email()."""

    async def test_returns_user_response(self, mock_mongodb, sample_user_doc):
        """get_user_by_email returns UserResponse when found."""
        db_user = UserInDB.model_validate(sample_user_doc)

        with patch(
            "app.services.user_service.UserRepository.get_by_email",
            new_callable=AsyncMock,
            return_value=db_user,
        ):
            response = await UserService.get_user_by_email("user1@example.com")

            assert response is not None
            assert response.email == "user1@example.com"

    async def test_returns_none_when_not_found(self, mock_mongodb):
        """get_user_by_email returns None when user not found."""
        with patch(
            "app.services.user_service.UserRepository.get_by_email",
            new_callable=AsyncMock,
            return_value=None,
        ):
            response = await UserService.get_user_by_email("nonexistent@example.com")

            assert response is None

    async def test_normalizes_email_before_lookup(self, mock_mongodb):
        """get_user_by_email normalizes email before delegating to repository."""
        with patch(
            "app.services.user_service.UserRepository.get_by_email",
            new_callable=AsyncMock,
            return_value=None,
        ) as mock_get:
            await UserService.get_user_by_email(" User1@Example.com ")

            mock_get.assert_called_once_with("user1@example.com")


class TestGetSubscribedEmails:
    """Tests for UserService.get_subscribed_emails()."""

    async def test_returns_emails_with_count(self, mock_mongodb):
        """get_subscribed_emails returns SubscribedEmailsResponse."""
        mock_emails = ["user1@example.com", "user2@example.com"]

        with patch(
            "app.services.user_service.UserRepository.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=mock_emails,
        ):
            response = await UserService.get_subscribed_emails()

            assert response.emails == mock_emails
            assert response.count == 2

    async def test_returns_empty_list_when_none(self, mock_mongodb):
        """get_subscribed_emails returns empty list when no subscribers."""
        with patch(
            "app.services.user_service.UserRepository.get_subscribed_emails",
            new_callable=AsyncMock,
            return_value=[],
        ):
            response = await UserService.get_subscribed_emails()

            assert response.emails == []
            assert response.count == 0


class TestRecordFormSubmission:
    """Tests for UserService.record_form_submission()."""

    async def test_records_form_submission(self, mock_mongodb):
        """record_form_submission delegates to repository."""
        with patch(
            "app.services.user_service.UserRepository.add_submitted_form",
            new_callable=AsyncMock,
        ) as mock_add:
            await UserService.record_form_submission(
                "user1@example.com", "507f1f77bcf86cd799439030"
            )

            mock_add.assert_called_once_with(
                "user1@example.com", "507f1f77bcf86cd799439030"
            )

    async def test_raises_user_not_found(self, mock_mongodb):
        """record_form_submission propagates UserNotFoundError."""
        with patch(
            "app.services.user_service.UserRepository.add_submitted_form",
            new_callable=AsyncMock,
            side_effect=UserNotFoundError("User not found"),
        ):
            with pytest.raises(UserNotFoundError):
                await UserService.record_form_submission(
                    "nonexistent@example.com", "507f1f77bcf86cd799439030"
                )


class TestRecordMailReceived:
    """Tests for UserService.record_mail_received()."""

    async def test_records_mail_received(self, mock_mongodb):
        """record_mail_received delegates to repository."""
        with patch(
            "app.services.user_service.UserRepository.add_received_mail",
            new_callable=AsyncMock,
        ) as mock_add:
            await UserService.record_mail_received(
                "user1@example.com", "507f1f77bcf86cd799439040"
            )

            mock_add.assert_called_once_with(
                "user1@example.com", "507f1f77bcf86cd799439040"
            )

    async def test_raises_user_not_found(self, mock_mongodb):
        """record_mail_received propagates UserNotFoundError."""
        with patch(
            "app.services.user_service.UserRepository.add_received_mail",
            new_callable=AsyncMock,
            side_effect=UserNotFoundError("User not found"),
        ):
            with pytest.raises(UserNotFoundError):
                await UserService.record_mail_received(
                    "nonexistent@example.com", "507f1f77bcf86cd799439040"
                )
