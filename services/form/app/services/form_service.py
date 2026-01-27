"""Form service layer for managing forms."""

from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from app.models.common import PyObjectId
from app.models.form import FormCreate, FormInDB, FormUpdate
from app.utils.logger import logger


class FormService:
    """
    Service layer for Form operations.
    Handles business logic and database interactions for forms.
    """

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db["forms"]

    def _to_object_id(self, obj_id: PyObjectId) -> ObjectId:
        """
        Convert PyObjectId to ObjectId for MongoDB queries.

        Args:
            obj_id: PyObjectId (which is Annotated[ObjectId, ...])

        Returns:
            ObjectId for MongoDB operations

        Raises:
            ValueError: If invalid ObjectId string is provided
            TypeError: If obj_id is not ObjectId or str
        """
        if isinstance(obj_id, ObjectId):
            return obj_id
        if isinstance(obj_id, str):
            if not ObjectId.is_valid(obj_id):
                raise ValueError(f"Invalid ObjectId: {obj_id}")
            return ObjectId(obj_id)
        raise TypeError(
            f"Expected ObjectId or str, got {type(obj_id).__name__}"
        )

    def _document_to_form(self, doc: dict | None) -> FormInDB | None:
        """
        Convert MongoDB document to FormInDB model.

        Args:
            doc: MongoDB document dict or None

        Returns:
            FormInDB instance or None
        """
        if doc is None:
            return None

        try:
            return FormInDB.model_validate(doc)
        except Exception as e:
            logger.error(f"Error converting document to FormInDB: {e}")
            raise

    async def create_form(self, form_data: FormCreate) -> FormInDB:
        """
        Create a new form.

        Args:
            form_data: Form data to create

        Returns:
            Created FormInDB instance

        Raises:
            PyMongoError: For database errors
        """
        logger.info(f"Creating form: {form_data.title}")

        # Prepare form document
        form_doc = form_data.model_dump(by_alias=True, exclude={"id"})
        form_doc["_id"] = ObjectId()
        form_doc["created_at"] = datetime.now(timezone.utc)
        form_doc["updated_at"] = None
        form_doc["view_count"] = 0
        form_doc["submission_count"] = 0

        try:
            await self.collection.insert_one(form_doc)
            logger.info(
                f"Successfully created form {form_doc['_id']}: {form_data.title}"
            )
            return self._document_to_form(form_doc)

        except PyMongoError as e:
            logger.error(f"Database error while creating form: {e}")
            raise

    async def get_form_by_id(self, form_id: PyObjectId) -> FormInDB | None:
        """
        Get form by ID.

        Args:
            form_id: Form ID

        Returns:
            FormInDB instance if found, None otherwise

        Raises:
            PyMongoError: For database errors
        """
        object_id = self._to_object_id(form_id)

        try:
            doc = await self.collection.find_one({"_id": object_id})
            return self._document_to_form(doc)
        except PyMongoError as e:
            logger.error(f"Database error while getting form {form_id}: {e}")
            raise

    async def get_all_forms(
        self, skip: int = 0, limit: int = 10, active_only: bool = False
    ) -> tuple[list[FormInDB], int]:
        """
        Get all forms with pagination.

        Args:
            skip: Number of documents to skip (default: 0)
            limit: Maximum number of documents to return (default: 10, max: 100)
            active_only: If True, only return active forms (default: False)

        Returns:
            Tuple of (list of FormInDB, total count)

        Raises:
            ValueError: For invalid pagination parameters
            PyMongoError: For database errors
        """
        # Validate pagination parameters
        if skip < 0:
            raise ValueError("skip must be >= 0")
        if limit < 1 or limit > 100:
            raise ValueError("limit must be between 1 and 100")

        # Build query filter
        query_filter = {}
        if active_only:
            query_filter["is_active"] = True

        try:
            # Count total forms
            total_count = await self.collection.count_documents(query_filter)

            # Query with pagination
            cursor = (
                self.collection.find(query_filter)
                .sort("created_at", -1)
                .skip(skip)
                .limit(limit)
            )

            docs = await cursor.to_list(length=limit)

            forms = []
            for doc in docs:
                if doc is not None:
                    form = self._document_to_form(doc)
                    if form is not None:
                        forms.append(form)

            return forms, total_count

        except PyMongoError as e:
            logger.error(f"Database error while getting forms: {e}")
            raise

    async def update_form(
        self, form_id: PyObjectId, form_data: FormUpdate
    ) -> FormInDB | None:
        """
        Update an existing form.

        Args:
            form_id: Form ID to update
            form_data: Updated form data (only fields that are not None will be updated)

        Returns:
            Updated FormInDB instance if found, None otherwise

        Raises:
            PyMongoError: For database errors
        """
        object_id = self._to_object_id(form_id)

        # Only include fields that are not None
        update_data = form_data.model_dump(exclude_unset=True)

        if not update_data:
            logger.warning(f"No fields to update for form {form_id}")
            return await self.get_form_by_id(form_id)

        # Add updated_at timestamp
        update_data["updated_at"] = datetime.now(timezone.utc)

        try:
            result = await self.collection.find_one_and_update(
                {"_id": object_id},
                {"$set": update_data},
                return_document=True,  # Return the updated document
            )

            if result is None:
                logger.warning(f"Form not found for update: {form_id}")
                return None

            logger.info(f"Successfully updated form {form_id}")
            return self._document_to_form(result)

        except PyMongoError as e:
            logger.error(f"Database error while updating form {form_id}: {e}")
            raise

    async def delete_form(self, form_id: PyObjectId) -> bool:
        """
        Delete a form by ID.

        Args:
            form_id: Form ID to delete

        Returns:
            True if form was deleted, False if not found

        Raises:
            PyMongoError: For database errors
        """
        object_id = self._to_object_id(form_id)

        try:
            result = await self.collection.delete_one({"_id": object_id})

            if result.deleted_count > 0:
                logger.info(f"Successfully deleted form {form_id}")
                return True
            else:
                logger.warning(f"Form not found for deletion: {form_id}")
                return False

        except PyMongoError as e:
            logger.error(f"Database error while deleting form {form_id}: {e}")
            raise

    async def increment_view_count(self, form_id: PyObjectId) -> bool:
        """
        Increment the view count for a form.

        Args:
            form_id: Form ID to increment view count for

        Returns:
            True if successful, False if form not found

        Raises:
            PyMongoError: For database errors
        """
        object_id = self._to_object_id(form_id)

        try:
            result = await self.collection.update_one(
                {"_id": object_id}, {"$inc": {"view_count": 1}}
            )

            if result.matched_count > 0:
                logger.debug(f"Incremented view count for form {form_id}")
                return True
            else:
                logger.warning(f"Form not found for view count increment: {form_id}")
                return False

        except PyMongoError as e:
            logger.error(
                f"Database error while incrementing view count for form {form_id}: {e}"
            )
            raise
