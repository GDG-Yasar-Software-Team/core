"""Tests for user models."""

from datetime import datetime

import pytest
from bson import ObjectId
from pydantic import ValidationError

from app.models.user import User, UserInDB, UserResponse


class TestUser:
    """Tests for User model (create/update input)."""

    def test_email_required(self):
        """Email is the only required field."""
        user = User(email="test@example.com")
        assert user.email == "test@example.com"
        assert user.name is None
        assert user.is_yasar_student is None
        assert user.section is None
        assert user.turkish_identity_number is None
        assert user.is_subscribed is None

    def test_email_validated(self):
        """Invalid email raises ValidationError."""
        with pytest.raises(ValidationError):
            User(email="not-an-email")

    def test_all_fields_optional_except_email(self):
        """All fields except email are optional."""
        user = User(
            email="test@example.com",
            name="Test User",
            is_yasar_student=True,
            section="Engineering",
            turkish_identity_number="12345678901",
            is_subscribed=False,
        )
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.is_yasar_student is True
        assert user.section == "Engineering"
        assert user.turkish_identity_number == "12345678901"
        assert user.is_subscribed is False

    def test_invalid_turkish_identity_number_rejected(self):
        """Invalid TC Kimlik Number raises ValidationError."""
        with pytest.raises(ValidationError):
            User(
                email="test@example.com",
                turkish_identity_number="12345",
            )

    def test_missing_email_raises_error(self):
        """Missing email raises ValidationError."""
        with pytest.raises(ValidationError):
            User()


class TestUserInDB:
    """Tests for UserInDB model (database document)."""

    def test_validates_all_fields(self):
        """UserInDB correctly validates all fields from DB document."""
        doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "email": "test@example.com",
            "name": "Test User",
            "is_yasar_student": True,
            "section": "Engineering",
            "turkish_identity_number": "12345678901",
            "submitted_form_ids": [ObjectId("507f1f77bcf86cd799439020")],
            "submitted_form_count": 1,
            "received_mail_ids": [],
            "received_mail_count": 0,
            "is_subscribed": True,
            "unsubscribed_at": None,
            "created_at": datetime(2025, 1, 15, 12, 0, 0),
            "updated_at": None,
        }
        user = UserInDB(**doc)
        assert str(user.id) == "507f1f77bcf86cd799439011"
        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.is_yasar_student is True
        assert user.section == "Engineering"
        assert user.turkish_identity_number == "12345678901"
        assert len(user.submitted_form_ids) == 1
        assert user.submitted_form_count == 1
        assert user.received_mail_ids == []
        assert user.received_mail_count == 0
        assert user.is_subscribed is True
        assert user.unsubscribed_at is None
        assert user.created_at == datetime(2025, 1, 15, 12, 0, 0)
        assert user.updated_at is None

    def test_validates_object_id(self):
        """ObjectId fields are properly validated."""
        doc = {
            "_id": "507f1f77bcf86cd799439011",  # String, should be converted
            "email": "test@example.com",
            "is_yasar_student": False,
            "submitted_form_ids": ["507f1f77bcf86cd799439020"],  # String array
            "submitted_form_count": 0,
            "received_mail_ids": [],
            "received_mail_count": 0,
            "is_subscribed": True,
            "created_at": datetime.now(),
        }
        user = UserInDB(**doc)
        assert isinstance(user.id, ObjectId)
        assert len(user.submitted_form_ids) == 1
        assert isinstance(user.submitted_form_ids[0], ObjectId)

    def test_validates_datetime_fields(self):
        """Datetime fields are properly handled."""
        now = datetime.now()
        doc = {
            "_id": ObjectId(),
            "email": "test@example.com",
            "is_yasar_student": False,
            "submitted_form_ids": [],
            "submitted_form_count": 0,
            "received_mail_ids": [],
            "received_mail_count": 0,
            "is_subscribed": False,
            "unsubscribed_at": now,
            "created_at": now,
            "updated_at": now,
        }
        user = UserInDB(**doc)
        assert user.created_at == now
        assert user.updated_at == now
        assert user.unsubscribed_at == now

    def test_default_values(self):
        """Default values are applied correctly."""
        doc = {
            "_id": ObjectId(),
            "email": "test@example.com",
            "created_at": datetime.now(),
        }
        user = UserInDB(**doc)
        assert user.name is None
        assert user.is_yasar_student is False
        assert user.section is None
        assert user.turkish_identity_number is None
        assert user.submitted_form_ids == []
        assert user.submitted_form_count == 0
        assert user.received_mail_ids == []
        assert user.received_mail_count == 0
        assert user.is_subscribed is True
        assert user.unsubscribed_at is None
        assert user.updated_at is None


class TestUserResponse:
    """Tests for UserResponse model (API response)."""

    def test_serializes_from_db_model(self):
        """UserResponse correctly serializes from UserInDB."""
        db_user = UserInDB(
            _id=ObjectId("507f1f77bcf86cd799439011"),
            email="test@example.com",
            name="Test User",
            is_yasar_student=True,
            section="Engineering",
            turkish_identity_number="12345678901",
            submitted_form_ids=[ObjectId()],
            submitted_form_count=1,
            received_mail_ids=[ObjectId(), ObjectId()],
            received_mail_count=2,
            is_subscribed=True,
            unsubscribed_at=None,
            created_at=datetime(2025, 1, 15, 12, 0, 0),
            updated_at=datetime(2025, 1, 16, 10, 0, 0),
        )
        response = UserResponse.from_db(db_user)
        assert response.id == "507f1f77bcf86cd799439011"
        assert response.email == "test@example.com"
        assert response.name == "Test User"
        assert response.is_yasar_student is True
        assert response.section == "Engineering"
        assert response.turkish_identity_number == "12345678901"
        assert response.submitted_form_count == 1
        assert response.received_mail_count == 2
        assert response.is_subscribed is True
        assert response.unsubscribed_at is None
        assert response.created_at == datetime(2025, 1, 15, 12, 0, 0)
        assert response.updated_at == datetime(2025, 1, 16, 10, 0, 0)

    def test_id_is_string(self):
        """Response ID is serialized as string."""
        db_user = UserInDB(
            _id=ObjectId("507f1f77bcf86cd799439011"),
            email="test@example.com",
            is_yasar_student=False,
            submitted_form_ids=[],
            submitted_form_count=0,
            received_mail_ids=[],
            received_mail_count=0,
            is_subscribed=True,
            created_at=datetime.now(),
        )
        response = UserResponse.from_db(db_user)
        assert isinstance(response.id, str)
        assert response.id == "507f1f77bcf86cd799439011"

    def test_json_serialization(self):
        """Response can be serialized to JSON."""
        db_user = UserInDB(
            _id=ObjectId("507f1f77bcf86cd799439011"),
            email="test@example.com",
            name=None,
            is_yasar_student=False,
            section=None,
            turkish_identity_number=None,
            submitted_form_ids=[],
            submitted_form_count=0,
            received_mail_ids=[],
            received_mail_count=0,
            is_subscribed=True,
            unsubscribed_at=None,
            created_at=datetime(2025, 1, 15, 12, 0, 0),
            updated_at=None,
        )
        response = UserResponse.from_db(db_user)
        json_data = response.model_dump_json()
        assert "507f1f77bcf86cd799439011" in json_data
        assert "test@example.com" in json_data
