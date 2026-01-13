"""Service layer for submission operations."""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException

from app.db.mongodb import MongoDB
from app.models.submission import (
    SubmissionCreate,
    SubmissionInDB,
    SubmissionListResponse,
    SubmissionResponse,
)


COLLECTION_NAME = "submissions"
FORMS_COLLECTION_NAME = "forms"
MAX_PAGINATION_LIMIT = 100
DEFAULT_PAGINATION_LIMIT = 10


async def get_collection():
    """Get the submissions collection from the database."""
    db = MongoDB.get_db()
    return db[COLLECTION_NAME]


async def get_forms_collection():
    """Get the forms collection from the database."""
    db = MongoDB.get_db()
    return db[FORMS_COLLECTION_NAME]


async def create_submission(submission: SubmissionCreate) -> SubmissionResponse:
    
    
    forms_collection = await get_forms_collection()
    submissions_collection = await get_collection()
    
    
    try:
        f_id = ObjectId(submission.form_id)
        form_exists = await forms_collection.find_one({"_id": f_id})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid form_id format")
        
    if not form_exists:
        raise HTTPException(status_code=404, detail="Form not found in database")

    
    submission_data = {
        "form_id": f_id, 
        "answers": submission.answers,
        "respondent_email": submission.respondent_email,
        "respondent_name": submission.respondent_name,
        "submitted_at": datetime.now(timezone.utc)
    }


    result = await submissions_collection.insert_one(submission_data)

    
    created_doc = await submissions_collection.find_one({"_id": result.inserted_id})

    
    return SubmissionResponse(
        id=str(created_doc["_id"]),
        form_id=str(created_doc["form_id"]),
        answers=created_doc["answers"],
        respondent_email=created_doc.get("respondent_email"),
        respondent_name=created_doc.get("respondent_name"),
        submitted_at=created_doc["submitted_at"]
    
    )


async def get_submission_by_id(submission_id: str) -> SubmissionResponse:
    """
    Get a submission by its ID.

    Args:
        submission_id: The submission ID.

    Returns:
        SubmissionResponse if found.

    Raises:
        HTTPException: If submission_id is invalid or submission not found.
    """
    collection = await get_collection()

    # Validate and convert to ObjectId
    if not ObjectId.is_valid(submission_id):
        raise HTTPException(status_code=400, detail="Invalid submission_id")

    object_id = ObjectId(submission_id)

    # Find the document
    doc = await collection.find_one({"_id": object_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Convert to SubmissionInDB model
    submission_in_db = SubmissionInDB(**doc)

    # Convert to SubmissionResponse
    return SubmissionResponse(
        id=str(submission_in_db.id),
        form_id=str(submission_in_db.form_id),
        answers=submission_in_db.answers,
        respondent_email=submission_in_db.respondent_email,
        respondent_name=submission_in_db.respondent_name,
        submitted_at=submission_in_db.submitted_at,
    )


async def get_submissions_by_form_id(
    form_id: str,
    skip: int = 0,
    limit: int = DEFAULT_PAGINATION_LIMIT,
) -> SubmissionListResponse:
    """
    Get paginated submissions for a specific form.

    Args:
        form_id: The form ID to filter submissions.
        skip: Number of documents to skip (for pagination).
        limit: Maximum number of documents to return.

    Returns:
        SubmissionListResponse containing paginated submissions.

    Raises:
        HTTPException: If form_id is invalid or pagination parameters are invalid.
    """
    # Validate pagination parameters
    if skip < 0:
        raise HTTPException(status_code=400, detail="skip must be >= 0")

    if limit <= 0 or limit > MAX_PAGINATION_LIMIT:
        raise HTTPException(
            status_code=400,
            detail=f"limit must be between 1 and {MAX_PAGINATION_LIMIT}",
        )

    # Validate and convert to ObjectId
    if not ObjectId.is_valid(form_id):
        raise HTTPException(status_code=400, detail="Invalid form_id")

    collection = await get_collection()
    object_id = ObjectId(form_id)

    # Count total submissions for the form
    total = await collection.count_documents({"form_id": object_id})

    # Find documents with pagination
    cursor = (
        collection.find({"form_id": object_id})
        .skip(skip)
        .limit(limit)
        .sort("submitted_at", -1)
    )
    docs = await cursor.to_list(length=limit)

    # Convert documents to SubmissionResponse models
    submissions = []
    for doc in docs:
        submission_in_db = SubmissionInDB(**doc)
        submissions.append(
            SubmissionResponse(
                id=str(submission_in_db.id),
                form_id=str(submission_in_db.form_id),
                answers=submission_in_db.answers,
                respondent_email=submission_in_db.respondent_email,
                respondent_name=submission_in_db.respondent_name,
                submitted_at=submission_in_db.submitted_at,
            )
        )

    return SubmissionListResponse(
        submissions=submissions,
        total=total,
        skip=skip,
        limit=limit,
    )
