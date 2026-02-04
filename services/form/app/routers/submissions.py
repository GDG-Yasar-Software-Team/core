"""Submissions router for handling form submission operations."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.errors import PyMongoError

from app.db.mongodb import get_database
from app.models.submission import (
    PaginatedSubmissionsResponse,
    SubmissionCreate,
    SubmissionResponse,
)
from app.services.submission_service import SubmissionService
from app.utils.logger import logger

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/", status_code=201)
async def create_submission(
    submission_data: SubmissionCreate,
    db=Depends(get_database),
) -> SubmissionResponse:
    """
    Create a new form submission.

    Validates that the form exists, is active, has started, and deadline has not passed.
    """
    logger.info(f"Creating submission for form {submission_data.form_id}")

    service = SubmissionService(db)

    try:
        submission = await service.create_submission(submission_data)
        logger.success(
            f"Created submission {submission.id} for form {submission_data.form_id}"
        )
        return SubmissionResponse.from_db(submission)

    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            logger.warning(f"Form not found: {error_msg}")
            raise HTTPException(status_code=404, detail="Form not found")
        elif "Invalid ObjectId" in error_msg:
            logger.warning(f"Invalid ID format: {error_msg}")
            raise HTTPException(status_code=400, detail="Invalid form ID format")
        else:
            logger.warning(f"Validation error: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)

    except PyMongoError as e:
        logger.error(f"Database error while creating submission: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{submission_id}")
async def get_submission_by_id(
    submission_id: str,
    db=Depends(get_database),
) -> SubmissionResponse:
    """Get a submission by its ID."""
    logger.info(f"Getting submission {submission_id}")

    service = SubmissionService(db)

    try:
        submission = await service.get_submission_by_id(submission_id)

        if submission is None:
            logger.warning(f"Submission not found: {submission_id}")
            raise HTTPException(status_code=404, detail="Submission not found")

        logger.success(f"Retrieved submission {submission_id}")
        return SubmissionResponse.from_db(submission)

    except ValueError as e:
        error_msg = str(e)
        if "Invalid ObjectId" in error_msg:
            logger.warning(f"Invalid submission ID format: {submission_id}")
            raise HTTPException(status_code=400, detail="Invalid submission ID format")
        raise HTTPException(status_code=400, detail=error_msg)

    except PyMongoError as e:
        logger.error(f"Database error while getting submission {submission_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/by-form/{form_id}")
async def get_submissions_by_form(
    form_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    db=Depends(get_database),
) -> PaginatedSubmissionsResponse:
    """
    Get all submissions for a form with pagination.

    - **skip**: Number of submissions to skip (default: 0)
    - **limit**: Maximum number of submissions to return (default: 10, max: 100)
    """
    logger.info(f"Getting submissions for form {form_id} (skip={skip}, limit={limit})")

    service = SubmissionService(db)

    try:
        submissions, total = await service.get_submissions_by_form_id(
            form_id=form_id,
            skip=skip,
            limit=limit,
        )

        logger.success(
            f"Retrieved {len(submissions)} submissions for form {form_id} (total: {total})"
        )

        return PaginatedSubmissionsResponse(
            submissions=[SubmissionResponse.from_db(s) for s in submissions],
            total=total,
            skip=skip,
            limit=limit,
        )

    except ValueError as e:
        error_msg = str(e)
        if "Invalid ObjectId" in error_msg:
            logger.warning(f"Invalid form ID format: {form_id}")
            raise HTTPException(status_code=400, detail="Invalid form ID format")
        raise HTTPException(status_code=400, detail=error_msg)

    except PyMongoError as e:
        logger.error(
            f"Database error while getting submissions for form {form_id}: {e}"
        )
        raise HTTPException(status_code=500, detail="Internal server error")
