"""Submissions router for handling form submission operations."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth import verify_api_key
from app.models.submission import (
    PaginatedSubmissionsResponse,
    SubmissionCreate,
    SubmissionResponse,
)
from app.services.submission_service import (
    FormNotFoundError,
    FormValidationError,
    InvalidObjectIdError,
    SubmissionService,
)
from app.utils.logger import logger

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/", response_model=SubmissionResponse, status_code=201)
async def create_submission(
    submission_data: SubmissionCreate,
    dry_run: Annotated[bool, Query(alias="dry_run")] = False,
) -> SubmissionResponse:
    """
    Create a new form submission.

    Validates that the form exists, is active, has started, and deadline has not passed.

    When `dry_run=true`, the payload is fully validated but nothing is
    persisted to the database.
    """
    try:
        submission = await SubmissionService.create_submission(
            submission_data, dry_run=dry_run
        )
        return SubmissionResponse.from_db(submission)
    except FormNotFoundError:
        raise HTTPException(status_code=404, detail={"code": "form_not_found"})
    except FormValidationError as e:
        logger.warning(
            f"Submission rejected: code={e.code} internal={e.internal_note!r}"
        )
        raise HTTPException(status_code=400, detail={"code": e.code})
    except InvalidObjectIdError:
        raise HTTPException(status_code=400, detail={"code": "invalid_form_id"})


@router.get(
    "/{submission_id}",
    response_model=SubmissionResponse,
    dependencies=[Depends(verify_api_key)],
)
async def get_submission_by_id(
    submission_id: str,
) -> SubmissionResponse:
    """Get a submission by its ID."""
    try:
        submission = await SubmissionService.get_submission_by_id(submission_id)
        if submission is None:
            raise HTTPException(status_code=404, detail="Submission not found")
        return SubmissionResponse.from_db(submission)
    except InvalidObjectIdError:
        raise HTTPException(status_code=400, detail="Invalid submission ID format")


@router.get(
    "/by-form/{form_id}",
    response_model=PaginatedSubmissionsResponse,
    dependencies=[Depends(verify_api_key)],
)
async def get_submissions_by_form(
    form_id: str,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
) -> PaginatedSubmissionsResponse:
    """
    Get all submissions for a form with pagination.

    - **skip**: Number of submissions to skip (default: 0)
    - **limit**: Maximum number of submissions to return (default: 10, max: 100)
    """
    try:
        submissions, total = await SubmissionService.get_submissions_by_form_id(
            form_id=form_id,
            skip=skip,
            limit=limit,
        )

        return PaginatedSubmissionsResponse(
            submissions=[SubmissionResponse.from_db(s) for s in submissions],
            total=total,
            skip=skip,
            limit=limit,
        )
    except InvalidObjectIdError:
        raise HTTPException(status_code=400, detail="Invalid form ID format")
