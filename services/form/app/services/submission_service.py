"""Submission service layer for managing form submissions."""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from app.db.mongodb import MongoDB
from app.models.common import PyObjectId
from app.models.form import FieldType, FormFieldSchema, FormInDB
from app.models.submission import SubmissionCreate, SubmissionInDB
from app.utils.logger import logger


class SubmissionNotFoundError(Exception):
    """Raised when a submission is not found."""

    pass


class FormNotFoundError(Exception):
    """Raised when a form is not found."""

    pass


class FormValidationError(Exception):
    """Raised when form or submission answer validation fails.

    `code` is a stable machine-readable identifier returned to public clients.
    `internal_note` is for server logs only (may contain field_id, etc.).
    """

    __slots__ = ("code", "internal_note")

    def __init__(self, code: str, *, internal_note: str | None = None) -> None:
        self.code = code
        self.internal_note = internal_note
        super().__init__(internal_note or code)


class InvalidObjectIdError(Exception):
    """Raised when an invalid ObjectId string is provided."""

    pass


class SubmissionService:
    """
    Service layer for Submission operations.
    Handles business logic and database interactions for submissions.
    """

    @classmethod
    def _get_submissions_collection(cls):
        return MongoDB.get_db()["submissions"]

    @classmethod
    def _get_forms_collection(cls):
        return MongoDB.get_db()["forms"]

    @classmethod
    def _to_object_id(cls, obj_id: PyObjectId) -> ObjectId:
        """
        Convert PyObjectId to ObjectId for MongoDB queries.

        Args:
            obj_id: PyObjectId (which is Annotated[ObjectId, ...])

        Returns:
            ObjectId for MongoDB operations

        Raises:
            InvalidObjectIdError: If invalid ObjectId string is provided
        """
        if isinstance(obj_id, ObjectId):
            return obj_id
        if isinstance(obj_id, str):
            if not ObjectId.is_valid(obj_id):
                raise InvalidObjectIdError(f"Invalid ObjectId: {obj_id}")
            return ObjectId(obj_id)
        return obj_id

    @classmethod
    def _document_to_submission(cls, doc: dict | None) -> SubmissionInDB | None:
        """
        Convert MongoDB document to SubmissionInDB model.

        Args:
            doc: MongoDB document dict or None

        Returns:
            SubmissionInDB instance or None
        """
        if doc is None:
            return None

        try:
            return SubmissionInDB.model_validate(doc)
        except Exception as e:
            logger.error(f"Error converting document to SubmissionInDB: {e}")
            raise

    @classmethod
    async def _validate_form(cls, form_id: PyObjectId) -> FormInDB:
        """
        Validate form exists, is active, and within date range.

        Args:
            form_id: Form ID to validate

        Returns:
            FormInDB instance if valid

        Raises:
            ValueError: If form not found, inactive, not started yet, or deadline passed
        """
        object_id = cls._to_object_id(form_id)
        forms_collection = cls._get_forms_collection()

        form_doc = await forms_collection.find_one({"_id": object_id})

        if form_doc is None:
            raise FormNotFoundError(f"Form not found with id: {form_id}")

        try:
            form = FormInDB.model_validate(form_doc)
        except Exception as e:
            logger.error(f"Error converting form document to FormInDB: {e}")
            raise FormValidationError("invalid_form_schema", internal_note=str(form_id))

        if not form.is_active:
            raise FormValidationError("form_not_active")

        now = datetime.now(timezone.utc)

        # Handle timezone-naive datetimes from MongoDB
        if form.start_date is not None:
            start_date = form.start_date
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            if start_date > now:
                raise FormValidationError("form_not_started")

        if form.deadline is not None:
            deadline = form.deadline
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            if deadline < now:
                raise FormValidationError("form_deadline_passed")

        return form

    @classmethod
    def _values_match(cls, left: Any, right: Any) -> bool:
        if isinstance(left, str) and isinstance(right, str):
            return left.strip().casefold() == right.strip().casefold()
        return left == right

    @classmethod
    def _is_field_visible(cls, field: FormFieldSchema, answers: dict[str, Any]) -> bool:
        condition = field.condition
        if condition is None:
            return True

        parent_value = answers.get(condition.depends_on)
        if parent_value is None:
            return False

        if isinstance(parent_value, list):
            for item in parent_value:
                if any(cls._values_match(item, value) for value in condition.values):
                    return True
            return False

        return any(cls._values_match(parent_value, value) for value in condition.values)

    @classmethod
    def _is_answer_provided(cls, field: FormFieldSchema, value: Any) -> bool:
        if value is None:
            return False

        if field.field_type == FieldType.CHECKBOX and not field.options:
            return value is True

        if field.field_type in {FieldType.CHECKBOX, FieldType.MULTISELECT}:
            return isinstance(value, list) and len(value) > 0

        if field.field_type == FieldType.NUMBER:
            if isinstance(value, bool):
                return False
            if isinstance(value, (int, float)):
                return True
            if isinstance(value, str):
                return value.strip() != ""
            return False

        if isinstance(value, str):
            return value.strip() != ""

        if isinstance(value, list):
            return len(value) > 0

        return True

    @classmethod
    def _validate_required_answers(
        cls, form: FormInDB, answers: dict[str, Any]
    ) -> None:
        for field in form.questions:
            if not field.required:
                continue
            if not cls._is_field_visible(field, answers):
                continue

            if not cls._is_answer_provided(field, answers.get(field.field_id)):
                raise FormValidationError(
                    "required_answer_incomplete",
                    internal_note=field.field_id,
                )

    @classmethod
    async def create_submission(
        cls, submission_data: SubmissionCreate, *, dry_run: bool = False
    ) -> SubmissionInDB:
        """
        Create a new submission.

        Args:
            submission_data: Submission data to create
            dry_run: If True, validate only — skip DB insert and submission_count increment.

        Returns:
            Created SubmissionInDB instance

        Raises:
            ValueError: For validation errors (form not found, inactive, not started, deadline passed)
            PyMongoError: For database errors
        """
        # Validate form and required answers (including conditional questions)
        form = await cls._validate_form(submission_data.form_id)
        cls._validate_required_answers(form, submission_data.answers)

        # Prepare submission document
        submission_doc = submission_data.model_dump(by_alias=True, exclude={"id"})
        submission_doc["_id"] = ObjectId()
        submission_doc["submitted_at"] = datetime.now(timezone.utc)
        # Ensure form_id is stored as ObjectId, not string
        submission_doc["form_id"] = cls._to_object_id(submission_data.form_id)

        if dry_run:
            logger.info(
                "Dry-run submission validated (not persisted)",
                form_id=str(submission_data.form_id),
            )
            return cls._document_to_submission(submission_doc)

        object_id = cls._to_object_id(submission_data.form_id)
        submissions_collection = cls._get_submissions_collection()
        forms_collection = cls._get_forms_collection()

        # Insert submission
        await submissions_collection.insert_one(submission_doc)

        # Atomically increment form's submission_count
        await forms_collection.update_one(
            {"_id": object_id}, {"$inc": {"submission_count": 1}}
        )

        logger.info(
            "Submission created",
            submission_id=str(submission_doc["_id"]),
            form_id=str(submission_data.form_id),
        )

        return cls._document_to_submission(submission_doc)

    @classmethod
    async def get_submission_by_id(
        cls, submission_id: PyObjectId
    ) -> SubmissionInDB | None:
        """
        Get submission by ID.

        Args:
            submission_id: Submission ID

        Returns:
            SubmissionInDB instance if found, None otherwise

        Raises:
            PyMongoError: For database errors
        """
        object_id = cls._to_object_id(submission_id)
        submissions_collection = cls._get_submissions_collection()

        doc = await submissions_collection.find_one({"_id": object_id})
        return cls._document_to_submission(doc)

    @classmethod
    async def get_submissions_by_form_id(
        cls, form_id: PyObjectId, skip: int = 0, limit: int = 10
    ) -> tuple[list[SubmissionInDB], int]:
        """
        Get submissions by form ID with pagination.

        Args:
            form_id: Form ID
            skip: Number of documents to skip (default: 0)
            limit: Maximum number of documents to return (default: 10, max: 100)

        Returns:
            Tuple of (list of SubmissionInDB, total count)

        Raises:
            ValueError: For invalid pagination parameters
            PyMongoError: For database errors
        """
        # Validate pagination parameters
        if skip < 0:
            raise ValueError("skip must be >= 0")
        if limit < 1 or limit > 100:
            raise ValueError("limit must be between 1 and 100")

        object_id = cls._to_object_id(form_id)
        submissions_collection = cls._get_submissions_collection()

        # Count total submissions
        total_count = await submissions_collection.count_documents(
            {"form_id": object_id}
        )

        # Query with pagination
        cursor = (
            submissions_collection.find({"form_id": object_id})
            .sort("submitted_at", -1)
            .skip(skip)
            .limit(limit)
        )

        docs = await cursor.to_list(length=limit)

        submissions = []
        for doc in docs:
            if doc is not None:
                submission = cls._document_to_submission(doc)
                if submission is not None:
                    submissions.append(submission)

        return submissions, total_count
