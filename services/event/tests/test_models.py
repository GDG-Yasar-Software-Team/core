"""Tests for event models."""

from datetime import datetime, timezone

import pytest
from bson import ObjectId
from pydantic import ValidationError

from app.models.event import EventCreate, EventInDB, EventResponse, EventUpdate, Speaker


class TestSpeaker:
    """Tests for Speaker sub-model."""

    def test_valid_speaker_accepted(self):
        """Valid speaker with all fields accepted."""
        speaker = Speaker(name="Jane Doe", title="Software Engineer", company="Google")
        assert speaker.name == "Jane Doe"
        assert speaker.title == "Software Engineer"
        assert speaker.company == "Google"

    def test_empty_name_rejected(self):
        """Empty name raises ValidationError."""
        with pytest.raises(ValidationError):
            Speaker(name="", title="Engineer", company="Google")

    def test_empty_title_rejected(self):
        """Empty title raises ValidationError."""
        with pytest.raises(ValidationError):
            Speaker(name="Jane Doe", title="", company="Google")

    def test_empty_company_rejected(self):
        """Empty company raises ValidationError."""
        with pytest.raises(ValidationError):
            Speaker(name="Jane Doe", title="Engineer", company="")

    def test_name_max_length_exceeded_rejected(self):
        """Name over 100 characters raises ValidationError."""
        with pytest.raises(ValidationError):
            Speaker(name="x" * 101, title="Engineer", company="Google")

    def test_title_max_length_exceeded_rejected(self):
        """Title over 100 characters raises ValidationError."""
        with pytest.raises(ValidationError):
            Speaker(name="Jane Doe", title="x" * 101, company="Google")

    def test_company_max_length_exceeded_rejected(self):
        """Company over 100 characters raises ValidationError."""
        with pytest.raises(ValidationError):
            Speaker(name="Jane Doe", title="Engineer", company="x" * 101)

    def test_missing_field_rejected(self):
        """Missing required field raises ValidationError."""
        with pytest.raises(ValidationError):
            Speaker(name="Jane Doe", title="Engineer")


class TestEventCreate:
    """Tests for EventCreate model."""

    def _valid_data(self) -> dict:
        return {
            "title": "GDG DevFest 2025",
            "description": "Annual developer festival.",
            "date": datetime(2025, 11, 15, 10, 0, 0, tzinfo=timezone.utc),
            "place": "Yaşar University",
        }

    def test_valid_event_accepted(self):
        """Valid event with required fields is accepted."""
        event = EventCreate(**self._valid_data())
        assert event.title == "GDG DevFest 2025"
        assert event.description == "Annual developer festival."
        assert event.place == "Yaşar University"
        assert event.speakers == []
        assert event.image_url is None

    def test_valid_event_with_all_fields(self):
        """Valid event with all fields including speakers and image_url is accepted."""
        data = self._valid_data()
        data["speakers"] = [
            Speaker(name="Jane Doe", title="Engineer", company="Google")
        ]
        data["image_url"] = "https://example.com/image.jpg"
        event = EventCreate(**data)
        assert len(event.speakers) == 1
        assert event.image_url == "https://example.com/image.jpg"

    def test_empty_title_rejected(self):
        """Empty title raises ValidationError."""
        data = self._valid_data()
        data["title"] = ""
        with pytest.raises(ValidationError):
            EventCreate(**data)

    def test_title_max_length_exceeded_rejected(self):
        """Title over 200 characters raises ValidationError."""
        data = self._valid_data()
        data["title"] = "x" * 201
        with pytest.raises(ValidationError):
            EventCreate(**data)

    def test_empty_description_rejected(self):
        """Empty description raises ValidationError."""
        data = self._valid_data()
        data["description"] = ""
        with pytest.raises(ValidationError):
            EventCreate(**data)

    def test_empty_place_rejected(self):
        """Empty place raises ValidationError."""
        data = self._valid_data()
        data["place"] = ""
        with pytest.raises(ValidationError):
            EventCreate(**data)

    def test_place_max_length_exceeded_rejected(self):
        """Place over 200 characters raises ValidationError."""
        data = self._valid_data()
        data["place"] = "x" * 201
        with pytest.raises(ValidationError):
            EventCreate(**data)

    def test_speakers_defaults_to_empty_list(self):
        """speakers field defaults to empty list."""
        event = EventCreate(**self._valid_data())
        assert event.speakers == []

    def test_image_url_defaults_to_none(self):
        """image_url field defaults to None."""
        event = EventCreate(**self._valid_data())
        assert event.image_url is None

    def test_invalid_speaker_in_list_rejected(self):
        """Invalid speaker inside speakers list raises ValidationError."""
        data = self._valid_data()
        data["speakers"] = [{"name": "", "title": "Engineer", "company": "Google"}]
        with pytest.raises(ValidationError):
            EventCreate(**data)

    def test_missing_required_field_rejected(self):
        """Missing required field raises ValidationError."""
        with pytest.raises(ValidationError):
            EventCreate(title="GDG DevFest")


class TestEventUpdate:
    """Tests for EventUpdate model."""

    def test_all_fields_optional(self):
        """Empty EventUpdate is valid — all fields optional."""
        update = EventUpdate()
        assert update.title is None
        assert update.description is None
        assert update.date is None
        assert update.place is None
        assert update.speakers is None
        assert update.image_url is None

    def test_partial_update_single_field(self):
        """Update with only one field provided is valid."""
        update = EventUpdate(title="Updated Title")
        assert update.title == "Updated Title"
        assert update.description is None

    def test_partial_update_speakers(self):
        """Update with speakers list is valid."""
        update = EventUpdate(
            speakers=[Speaker(name="Jane Doe", title="Engineer", company="Google")]
        )
        assert update.speakers is not None
        assert len(update.speakers) == 1

    def test_empty_title_rejected_even_when_optional(self):
        """Empty string for title violates min_length even when field is optional."""
        with pytest.raises(ValidationError):
            EventUpdate(title="")

    def test_empty_place_rejected_even_when_optional(self):
        """Empty string for place violates min_length even when field is optional."""
        with pytest.raises(ValidationError):
            EventUpdate(place="")

    def test_title_max_length_exceeded_rejected(self):
        """Title over 200 characters raises ValidationError."""
        with pytest.raises(ValidationError):
            EventUpdate(title="x" * 201)


class TestEventInDB:
    """Tests for EventInDB model."""

    def _valid_doc(self) -> dict:
        return {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "title": "GDG DevFest 2025",
            "description": "Annual developer festival.",
            "date": datetime(2025, 11, 15, 10, 0, 0, tzinfo=timezone.utc),
            "place": "Yaşar University",
            "speakers": [],
            "image_url": None,
            "created_at": datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
            "updated_at": None,
        }

    def test_valid_document_accepted(self):
        """Full valid DB document is accepted."""
        event = EventInDB(**self._valid_doc())
        assert str(event.id) == "507f1f77bcf86cd799439011"
        assert event.title == "GDG DevFest 2025"
        assert event.speakers == []
        assert event.updated_at is None

    def test_string_id_converted_to_objectid(self):
        """String _id is converted to ObjectId."""
        doc = self._valid_doc()
        doc["_id"] = "507f1f77bcf86cd799439011"
        event = EventInDB(**doc)
        assert isinstance(event.id, ObjectId)
        assert str(event.id) == "507f1f77bcf86cd799439011"

    def test_created_at_auto_set(self):
        """created_at is auto-set to UTC now when not provided."""
        doc = self._valid_doc()
        del doc["created_at"]
        before = datetime.now(timezone.utc)
        event = EventInDB(**doc)
        after = datetime.now(timezone.utc)
        assert before <= event.created_at <= after

    def test_updated_at_defaults_to_none(self):
        """updated_at defaults to None."""
        event = EventInDB(**self._valid_doc())
        assert event.updated_at is None

    def test_populate_by_name_with_alias(self):
        """Model accepts _id alias directly."""
        doc = self._valid_doc()
        event = EventInDB(**doc)
        assert event.id is not None

    def test_speakers_list_stored(self):
        """Speakers list with Speaker objects stored correctly."""
        doc = self._valid_doc()
        doc["speakers"] = [
            {"name": "Jane Doe", "title": "Engineer", "company": "Google"}
        ]
        event = EventInDB(**doc)
        assert len(event.speakers) == 1
        assert event.speakers[0].name == "Jane Doe"


class TestEventResponse:
    """Tests for EventResponse model."""

    def _make_db_event(self, **kwargs) -> EventInDB:
        defaults = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "title": "GDG DevFest 2025",
            "description": "Annual developer festival.",
            "date": datetime(2025, 11, 15, 10, 0, 0, tzinfo=timezone.utc),
            "place": "Yaşar University",
            "speakers": [],
            "image_url": None,
            "created_at": datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc),
            "updated_at": None,
        }
        defaults.update(kwargs)
        return EventInDB(**defaults)

    def test_from_db_maps_all_fields(self):
        """from_db() correctly maps all fields from EventInDB."""
        db_event = self._make_db_event(
            updated_at=datetime(2025, 2, 1, 0, 0, 0, tzinfo=timezone.utc)
        )
        response = EventResponse.from_db(db_event)
        assert response.id == "507f1f77bcf86cd799439011"
        assert response.title == "GDG DevFest 2025"
        assert response.description == "Annual developer festival."
        assert response.place == "Yaşar University"
        assert response.speakers == []
        assert response.image_url is None
        assert response.created_at == datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        assert response.updated_at == datetime(2025, 2, 1, 0, 0, 0, tzinfo=timezone.utc)

    def test_id_is_string(self):
        """Response id is a string, not ObjectId."""
        response = EventResponse.from_db(self._make_db_event())
        assert isinstance(response.id, str)
        assert response.id == "507f1f77bcf86cd799439011"

    def test_speakers_list_preserved(self):
        """Speakers list is preserved in response."""
        db_event = self._make_db_event(
            speakers=[{"name": "Jane Doe", "title": "Engineer", "company": "Google"}]
        )
        response = EventResponse.from_db(db_event)
        assert len(response.speakers) == 1
        assert response.speakers[0].name == "Jane Doe"
        assert response.speakers[0].title == "Engineer"
        assert response.speakers[0].company == "Google"

    def test_image_url_none_handled(self):
        """image_url=None is preserved in response."""
        response = EventResponse.from_db(self._make_db_event(image_url=None))
        assert response.image_url is None

    def test_json_serialization(self):
        """Response serializes to JSON without errors."""
        db_event = self._make_db_event(
            speakers=[{"name": "Jane Doe", "title": "Engineer", "company": "Google"}]
        )
        response = EventResponse.from_db(db_event)
        json_data = response.model_dump_json()
        assert "507f1f77bcf86cd799439011" in json_data
        assert "GDG DevFest 2025" in json_data
        assert "Jane Doe" in json_data
