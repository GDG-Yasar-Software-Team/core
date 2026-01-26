"""Tests for user repository."""

from unittest.mock import AsyncMock, MagicMock

import pytest
from bson import ObjectId

from app.repositories.user_repository import UserNotFoundError, UserRepository
from tests.conftest import create_async_cursor


class TestGetSubscribedUsers:
    """Tests for get_subscribed_users method."""

    async def test_returns_only_subscribed(self, mock_mongodb, sample_users):
        """Should return only users with isSubscribed=true."""
        subscribed = [u for u in sample_users if u["isSubscribed"]]
        mock_mongodb["users"].find.return_value = create_async_cursor(subscribed)

        users = await UserRepository.get_subscribed_users()

        assert len(users) == 2
        assert all(u.is_subscribed for u in users)
        mock_mongodb["users"].find.assert_called_once_with({"isSubscribed": True})

    async def test_returns_all_fields(self, mock_mongodb, sample_users):
        """Should return id and email for each user."""
        subscribed = [sample_users[0]]
        mock_mongodb["users"].find.return_value = create_async_cursor(subscribed)

        users = await UserRepository.get_subscribed_users()

        assert len(users) == 1
        assert users[0].email == "user1@example.com"
        assert str(users[0].id) == "507f1f77bcf86cd799439011"

    async def test_empty_collection(self, mock_mongodb):
        """Should return empty list when no users exist."""
        mock_mongodb["users"].find.return_value = create_async_cursor([])

        users = await UserRepository.get_subscribed_users()

        assert users == []

    async def test_all_unsubscribed(self, mock_mongodb):
        """Should return empty list when all users are unsubscribed."""
        mock_mongodb["users"].find.return_value = create_async_cursor([])

        users = await UserRepository.get_subscribed_users()

        assert users == []

    async def test_skips_invalid_documents(self, mock_mongodb):
        """Should skip documents missing required fields."""
        docs = [
            {"_id": ObjectId(), "email": "valid@example.com", "isSubscribed": True},
            {"_id": ObjectId(), "isSubscribed": True},  # Missing email
            {"email": "no_id@example.com", "isSubscribed": True},  # Missing _id
        ]
        mock_mongodb["users"].find.return_value = create_async_cursor(docs)

        users = await UserRepository.get_subscribed_users()

        assert len(users) == 1
        assert users[0].email == "valid@example.com"


class TestUnsubscribe:
    """Tests for unsubscribe methods."""

    async def test_unsubscribe_by_id_sets_flag(self, mock_mongodb):
        """Should set isSubscribed=false for user by ID."""
        mock_mongodb["users"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        await UserRepository.unsubscribe_by_id("507f1f77bcf86cd799439011")

        mock_mongodb["users"].update_one.assert_called_once_with(
            {"_id": ObjectId("507f1f77bcf86cd799439011")},
            {"$set": {"isSubscribed": False}},
        )

    async def test_unsubscribe_nonexistent_user_raises(self, mock_mongodb):
        """Should raise UserNotFoundError for nonexistent user."""
        mock_mongodb["users"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=0)
        )

        with pytest.raises(UserNotFoundError):
            await UserRepository.unsubscribe_by_id("507f1f77bcf86cd799439099")

    async def test_unsubscribe_invalid_id_raises(self, mock_mongodb):
        """Should raise UserNotFoundError for invalid ObjectId."""
        with pytest.raises(UserNotFoundError, match="Invalid user ID"):
            await UserRepository.unsubscribe_by_id("invalid-id")

    async def test_unsubscribe_by_email(self, mock_mongodb):
        """Should set isSubscribed=false for user by email."""
        mock_mongodb["users"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=1)
        )

        await UserRepository.unsubscribe_by_email("user@example.com")

        mock_mongodb["users"].update_one.assert_called_once_with(
            {"email": "user@example.com"},
            {"$set": {"isSubscribed": False}},
        )

    async def test_unsubscribe_by_email_nonexistent_raises(self, mock_mongodb):
        """Should raise UserNotFoundError when email not found."""
        mock_mongodb["users"].update_one = AsyncMock(
            return_value=MagicMock(matched_count=0)
        )

        with pytest.raises(UserNotFoundError):
            await UserRepository.unsubscribe_by_email("nonexistent@example.com")


class TestGetUser:
    """Tests for get_user_by_id and get_user_by_email."""

    async def test_get_user_by_id_returns_user(self, mock_mongodb, sample_users):
        """Should return user when found."""
        mock_mongodb["users"].find_one = AsyncMock(return_value=sample_users[0])

        user = await UserRepository.get_user_by_id("507f1f77bcf86cd799439011")

        assert user is not None
        assert user.email == "user1@example.com"

    async def test_get_user_by_id_returns_none_when_not_found(self, mock_mongodb):
        """Should return None when user not found."""
        mock_mongodb["users"].find_one = AsyncMock(return_value=None)

        user = await UserRepository.get_user_by_id("507f1f77bcf86cd799439099")

        assert user is None

    async def test_get_user_by_id_returns_none_for_invalid_id(self, mock_mongodb):
        """Should return None for invalid ObjectId."""
        user = await UserRepository.get_user_by_id("invalid-id")

        assert user is None

    async def test_get_user_by_email_returns_user(self, mock_mongodb, sample_users):
        """Should return user when found by email."""
        mock_mongodb["users"].find_one = AsyncMock(return_value=sample_users[0])

        user = await UserRepository.get_user_by_email("user1@example.com")

        assert user is not None
        assert user.email == "user1@example.com"

    async def test_get_user_by_email_returns_none_when_not_found(self, mock_mongodb):
        """Should return None when email not found."""
        mock_mongodb["users"].find_one = AsyncMock(return_value=None)

        user = await UserRepository.get_user_by_email("nonexistent@example.com")

        assert user is None
