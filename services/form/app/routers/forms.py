"""Router layer for form CRUD operations."""

from typing import Annotated

from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import PyMongoError

from app.db.mongodb import get_database
from app.models.form import (
    FormCreate,
    FormPreview,
    FormResponse,
    FormUpdate,
)
from app.services.form_service import FormService
from app.utils.logger import logger

router = APIRouter(prefix="/forms", tags=["forms"])


async def get_form_service(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> FormService:
    """Dependency to get FormService instance."""
    return FormService(db)


@router.post("/", status_code=201)
async def create_form(
    form_data: FormCreate,
    service: FormService = Depends(get_form_service),
) -> FormResponse:
    """
    Create a new form.

    Args:
        form_data: Form data to create

    Returns:
        Created form response
    """
    logger.info(f"Received request to create form: {form_data.title}")

    try:
        form = await service.create_form(form_data)
        logger.success(f"Form created successfully: {form.id}")

        return FormResponse(
            id=str(form.id),
            title=form.title,
            description=form.description,
            questions=form.questions,
            start_date=form.start_date,
            deadline=form.deadline,
            is_active=form.is_active,
            created_at=form.created_at,
            updated_at=form.updated_at,
            view_count=form.view_count,
            submission_count=form.submission_count,
        )

    except PyMongoError as e:
        logger.error(f"Database error while creating form: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")


@router.get("/{form_id}")
async def get_form(
    form_id: str,
    service: FormService = Depends(get_form_service),
) -> FormResponse:
    """
    Get a form by ID.

    Args:
        form_id: Form ID

    Returns:
        Form response if found
    """
    logger.info(f"Received request to get form: {form_id}")

    try:
        form = await service.get_form_by_id(form_id)

        if form is None:
            logger.warning(f"Form not found: {form_id}")
            raise HTTPException(status_code=404, detail="Form not found")

        logger.debug(f"Form retrieved successfully: {form_id}")

        return FormResponse(
            id=str(form.id),
            title=form.title,
            description=form.description,
            questions=form.questions,
            start_date=form.start_date,
            deadline=form.deadline,
            is_active=form.is_active,
            created_at=form.created_at,
            updated_at=form.updated_at,
            view_count=form.view_count,
            submission_count=form.submission_count,
        )

    except (ValueError, InvalidId) as e:
        logger.warning(f"Invalid form ID format: {form_id} - {e}")
        raise HTTPException(status_code=400, detail="Invalid form ID format")
    except PyMongoError as e:
        logger.error(f"Database error while getting form {form_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")


@router.get("/")
async def list_forms(
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    active_only: Annotated[bool, Query()] = False,
    service: FormService = Depends(get_form_service),
) -> dict:
    """
    List all forms with pagination.

    Args:
        skip: Number of forms to skip (default: 0)
        limit: Maximum number of forms to return (default: 10, max: 100)
        active_only: If True, only return active forms

    Returns:
        Dictionary with forms list and pagination info
    """
    logger.info(f"Received request to list forms: skip={skip}, limit={limit}, active_only={active_only}")

    try:
        forms, total_count = await service.get_all_forms(
            skip=skip, limit=limit, active_only=active_only
        )

        logger.debug(f"Retrieved {len(forms)} forms out of {total_count} total")

        form_previews = [
            FormPreview(
                id=str(form.id),
                title=form.title,
                description=form.description,
                start_date=form.start_date,
                deadline=form.deadline,
                is_active=form.is_active,
            )
            for form in forms
        ]

        return {
            "forms": form_previews,
            "total": total_count,
            "skip": skip,
            "limit": limit,
        }

    except ValueError as e:
        logger.warning(f"Invalid pagination parameters: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except PyMongoError as e:
        logger.error(f"Database error while listing forms: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")


@router.put("/{form_id}")
async def update_form(
    form_id: str,
    form_data: FormUpdate,
    service: FormService = Depends(get_form_service),
) -> FormResponse:
    """
    Update an existing form.

    Args:
        form_id: Form ID to update
        form_data: Updated form data (only non-None fields will be updated)

    Returns:
        Updated form response
    """
    logger.info(f"Received request to update form: {form_id}")

    try:
        form = await service.update_form(form_id, form_data)

        if form is None:
            logger.warning(f"Form not found for update: {form_id}")
            raise HTTPException(status_code=404, detail="Form not found")

        logger.success(f"Form updated successfully: {form_id}")

        return FormResponse(
            id=str(form.id),
            title=form.title,
            description=form.description,
            questions=form.questions,
            start_date=form.start_date,
            deadline=form.deadline,
            is_active=form.is_active,
            created_at=form.created_at,
            updated_at=form.updated_at,
            view_count=form.view_count,
            submission_count=form.submission_count,
        )

    except (ValueError, InvalidId) as e:
        logger.warning(f"Invalid form ID format: {form_id} - {e}")
        raise HTTPException(status_code=400, detail="Invalid form ID format")
    except PyMongoError as e:
        logger.error(f"Database error while updating form {form_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")


@router.delete("/{form_id}", status_code=204)
async def delete_form(
    form_id: str,
    service: FormService = Depends(get_form_service),
) -> None:
    """
    Delete a form by ID.

    Args:
        form_id: Form ID to delete

    Returns:
        None (204 No Content on success)
    """
    logger.info(f"Received request to delete form: {form_id}")

    try:
        deleted = await service.delete_form(form_id)

        if not deleted:
            logger.warning(f"Form not found for deletion: {form_id}")
            raise HTTPException(status_code=404, detail="Form not found")

        logger.success(f"Form deleted successfully: {form_id}")

    except (ValueError, InvalidId) as e:
        logger.warning(f"Invalid form ID format: {form_id} - {e}")
        raise HTTPException(status_code=400, detail="Invalid form ID format")
    except PyMongoError as e:
        logger.error(f"Database error while deleting form {form_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error occurred")
