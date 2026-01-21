"""Submission service layer for managing form submissions."""

from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from app.models.common import PyObjectId
from app.models.form import FormInDB
from app.models.submission import SubmissionCreate, SubmissionInDB
from app.utils.logger import logger


class SubmissionService:
    """
    Service layer for Submission operations.
    Handles business logic and database interactions for submissions.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["submissions"]
        self.forms_collection = db["forms"]

    def _to_object_id(self, obj_id: PyObjectId) -> ObjectId:
        """
        Convert PyObjectId to ObjectId for MongoDB queries.

        Args:
            obj_id: PyObjectId (which is Annotated[ObjectId, ...])

        Returns:
            ObjectId for MongoDB operations

        Raises:
            ValueError: If invalid ObjectId string is provided
        """
        if isinstance(obj_id, ObjectId):
            return obj_id
        if isinstance(obj_id, str):
            if not ObjectId.is_valid(obj_id):
                raise ValueError(f"Invalid ObjectId: {obj_id}")
            return ObjectId(obj_id)
        return obj_id

    def _document_to_submission(self, doc: dict | None) -> SubmissionInDB | None:
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

    async def _validate_form(self, form_id: PyObjectId) -> FormInDB:
        """
        Validate form exists, is active, and within date range.

        Args:
            form_id: Form ID to validate

        Returns:
            FormInDB instance if valid

        Raises:
            ValueError: If form not found, inactive, not started yet, or deadline passed
        """
        object_id = self._to_object_id(form_id)

        try:
            form_doc = await self.forms_collection.find_one({"_id": object_id})
        except PyMongoError as e:
            logger.error(f"Database error while validating form {form_id}: {e}")
            raise

        if form_doc is None:
            raise ValueError(f"Form not found with id: {form_id}")

        try:
            form = FormInDB.model_validate(form_doc)
        except Exception as e:
            logger.error(f"Error converting form document to FormInDB: {e}")
            raise ValueError(f"Invalid form data for id: {form_id}")

        if not form.is_active:
            raise ValueError("Form is not active")

        now = datetime.now(timezone.utc)

        # Handle timezone-naive datetimes from MongoDB
        if form.start_date is not None:
            start_date = form.start_date
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            if start_date > now:
                raise ValueError("Form has not started yet")

        if form.deadline is not None:
            deadline = form.deadline
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            if deadline < now:
                raise ValueError("Form deadline has passed")

        return form

    async def create_submission(
        self, submission_data: SubmissionCreate
    ) -> SubmissionInDB:
        """
        Create a new submission.

        Args:
            submission_data: Submission data to create

        Returns:
            Created SubmissionInDB instance

        Raises:
            ValueError: For validation errors (form not found, inactive, not started, deadline passed)
            PyMongoError: For database errors
        """
        logger.info(f"Creating submission for form {submission_data.form_id}")

        # Validate form
        await self._validate_form(submission_data.form_id)

        # Prepare submission document
        submission_doc = submission_data.model_dump(by_alias=True, exclude={"id"})
        submission_doc["_id"] = ObjectId()
        submission_doc["submitted_at"] = datetime.now(timezone.utc)
        # Ensure form_id is stored as ObjectId, not string
        submission_doc["form_id"] = self._to_object_id(submission_data.form_id)

        object_id = self._to_object_id(submission_data.form_id)

        try:
            # Insert submission
            await self.collection.insert_one(submission_doc)

            # Atomically increment form's submission_count
            await self.forms_collection.update_one(
                {"_id": object_id}, {"$inc": {"submission_count": 1}}
            )

            logger.info(
                f"Successfully created submission {submission_doc['_id']} "
                f"for form {submission_data.form_id}"
            )

            return self._document_to_submission(submission_doc)

        except PyMongoError as e:
            logger.error(f"Database error while creating submission: {e}")
            raise

    async def get_submission_by_id(
        self, submission_id: PyObjectId
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
        object_id = self._to_object_id(submission_id)

        try:
            doc = await self.collection.find_one({"_id": object_id})
            return self._document_to_submission(doc)
        except PyMongoError as e:
            logger.error(
                f"Database error while getting submission {submission_id}: {e}"
            )
            raise

    async def get_submissions_by_form_id(
        self, form_id: PyObjectId, skip: int = 0, limit: int = 10
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

        object_id = self._to_object_id(form_id)

        try:
            # Count total submissions
            total_count = await self.collection.count_documents({"form_id": object_id})

            # Query with pagination
            cursor = (
                self.collection.find({"form_id": object_id})
                .sort("submitted_at", -1)
                .skip(skip)
                .limit(limit)
            )

            docs = await cursor.to_list(length=limit)

            submissions = []
            for doc in docs:
                if doc is not None:
                    submission = self._document_to_submission(doc)
                    if submission is not None:
                        submissions.append(submission)

            return submissions, total_count

        except PyMongoError as e:
            logger.error(
                f"Database error while getting submissions for form {form_id}: {e}"
            )
            raise
