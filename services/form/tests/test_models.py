"""Tests for Pydantic models."""

import pytest
from bson import ObjectId
from pydantic import ValidationError

from app.models.common import validate_object_id
from app.models.form import (
    FieldType,
    FormCreate,
    FormFieldSchema,
    FormInDB,
    FormUpdate,
)
from app.models.submission import SubmissionCreate, SubmissionInDB, SubmissionResponse


class TestPyObjectId:
    """Test PyObjectId validation."""

    def test_valid_object_id_string(self):
        """Valid 24-char hex string is accepted."""
        result = validate_object_id("507f1f77bcf86cd799439011")
        assert isinstance(result, ObjectId)

    def test_valid_object_id_instance(self):
        """ObjectId instance passes through."""
        oid = ObjectId()
        result = validate_object_id(oid)
        assert result is oid

    def test_invalid_object_id_string(self):
        """Invalid string raises ValueError."""
        with pytest.raises(ValueError, match="Invalid ObjectId"):
            validate_object_id("not-a-valid-id")

    def test_invalid_type(self):
        """Non-string, non-ObjectId raises ValueError."""
        with pytest.raises(ValueError, match="Invalid ObjectId"):
            validate_object_id(12345)


class TestFormFieldSchema:
    """Test FormFieldSchema validation."""

    def test_valid_text_field(self):
        """Text field with required attributes is valid."""
        field = FormFieldSchema(
            field_id="name",
            field_type=FieldType.TEXT,
            label="Full Name",
        )
        assert field.field_id == "name"
        assert field.required is True

    def test_select_field_requires_options(self):
        """Select field without options raises ValidationError."""
        with pytest.raises(ValidationError, match="requires non-empty options"):
            FormFieldSchema(
                field_id="dept",
                field_type=FieldType.SELECT,
                label="Department",
                options=None,
            )

    def test_multiselect_field_requires_options(self):
        """Multiselect field without options raises ValidationError."""
        with pytest.raises(ValidationError, match="requires non-empty options"):
            FormFieldSchema(
                field_id="tags",
                field_type=FieldType.MULTISELECT,
                label="Tags",
                options=[],
            )

    def test_radio_field_requires_options(self):
        """Radio field without options raises ValidationError."""
        with pytest.raises(ValidationError, match="requires non-empty options"):
            FormFieldSchema(
                field_id="choice",
                field_type=FieldType.RADIO,
                label="Choice",
                options=[],
            )

    def test_select_field_with_options_valid(self):
        """Select field with options is valid."""
        field = FormFieldSchema(
            field_id="dept",
            field_type=FieldType.SELECT,
            label="Department",
            options=["A", "B"],
        )
        assert field.options == ["A", "B"]

    def test_field_id_min_length(self):
        """Empty field_id raises ValidationError."""
        with pytest.raises(ValidationError):
            FormFieldSchema(
                field_id="",
                field_type=FieldType.TEXT,
                label="Name",
            )


class TestFormCreate:
    """Test FormCreate validation."""

    def test_valid_form_create(self, sample_form_data):
        """Valid FormCreate passes validation."""
        assert sample_form_data.title == "Test Form"
        assert len(sample_form_data.questions) == 2
        assert sample_form_data.is_active is True

    def test_empty_title_rejected(self):
        """Empty title raises ValidationError."""
        with pytest.raises(ValidationError):
            FormCreate(
                title="",
                description="desc",
                questions=[
                    FormFieldSchema(field_id="q1", field_type="text", label="Question")
                ],
            )

    def test_empty_questions_rejected(self):
        """Empty questions list raises ValidationError."""
        with pytest.raises(ValidationError):
            FormCreate(
                title="Form",
                description="desc",
                questions=[],
            )

    def test_deadline_before_start_date_rejected(self):
        """Deadline before start_date raises ValidationError."""
        from datetime import datetime

        with pytest.raises(ValidationError, match="Deadline must be after start date"):
            FormCreate(
                title="Form",
                description="desc",
                questions=[
                    FormFieldSchema(field_id="q1", field_type="text", label="Question")
                ],
                start_date=datetime(2025, 6, 20),
                deadline=datetime(2025, 6, 10),
            )

    def test_valid_date_range(self):
        """Valid start_date < deadline is accepted."""
        from datetime import datetime

        form = FormCreate(
            title="Form",
            description="desc",
            questions=[
                FormFieldSchema(field_id="q1", field_type="text", label="Question")
            ],
            start_date=datetime(2025, 6, 10),
            deadline=datetime(2025, 6, 20),
        )
        assert form.start_date < form.deadline


class TestFormUpdate:
    """Test FormUpdate validation."""

    def test_all_none_is_valid(self):
        """FormUpdate with no fields set is valid."""
        update = FormUpdate()
        assert update.title is None
        assert update.is_active is None

    def test_partial_update(self):
        """FormUpdate with partial fields is valid."""
        update = FormUpdate(title="New Title", is_active=False)
        assert update.title == "New Title"
        assert update.is_active is False


class TestFormInDB:
    """Test FormInDB model."""

    def test_to_response(self, sample_form_doc):
        """to_response converts FormInDB to FormResponse."""
        form = FormInDB.model_validate(sample_form_doc)
        response = form.to_response()

        assert response.id == str(sample_form_doc["_id"])
        assert response.title == "Test Form"
        assert response.view_count == 0
        assert response.submission_count == 0

    def test_to_preview(self, sample_form_doc):
        """to_preview converts FormInDB to FormPreview."""
        form = FormInDB.model_validate(sample_form_doc)
        preview = form.to_preview()

        assert preview.id == str(sample_form_doc["_id"])
        assert preview.title == "Test Form"
        assert preview.is_active is True


class TestSubmissionCreate:
    """Test SubmissionCreate validation."""

    def test_valid_submission(self, sample_submission_data):
        """Valid SubmissionCreate passes validation."""
        assert sample_submission_data.respondent_email == "john@example.com"
        assert len(sample_submission_data.answers) == 2

    def test_invalid_email_rejected(self):
        """Invalid email raises ValidationError."""
        with pytest.raises(ValidationError):
            SubmissionCreate(
                form_id=ObjectId(),
                answers={"q1": "answer"},
                respondent_email="not-an-email",
            )

    def test_empty_answers_rejected(self):
        """Empty answers dict raises ValidationError."""
        with pytest.raises(ValidationError):
            SubmissionCreate(
                form_id=ObjectId(),
                answers={},
                respondent_email="test@example.com",
            )


class TestSubmissionResponse:
    """Test SubmissionResponse model."""

    def test_from_db(self, sample_submission_doc):
        """from_db converts SubmissionInDB to SubmissionResponse."""
        submission = SubmissionInDB.model_validate(sample_submission_doc)
        response = SubmissionResponse.from_db(submission)

        assert response.id == str(sample_submission_doc["_id"])
        assert response.form_id == str(sample_submission_doc["form_id"])
        assert response.respondent_email == "john@example.com"
