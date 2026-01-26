from fastapi import APIRouter, Depends, HTTPException

from app.auth.api_key import verify_api_key
from app.models.user import SubscribedEmailsResponse, User, UserResponse
from app.repositories.user_repository import DuplicateEmailError, UserNotFoundError
from app.services.user_service import UserService

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(verify_api_key)],
)


@router.post("/", status_code=201)
async def create_user(user: User) -> dict[str, str]:
    """Create a new user."""
    try:
        user_id = await UserService.create_user(user)
        return {"id": user_id, "email": user.email}
    except DuplicateEmailError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.get("/by-email/{email}")
async def get_user_by_email(email: str) -> UserResponse:
    """Get a user by email."""
    user = await UserService.get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=404, detail=f"User not found: {email}")
    return user


@router.put("/by-email/{email}")
async def update_user(email: str, update: User) -> UserResponse:
    """Update a user by email. Only updates non-None fields."""
    try:
        return await UserService.update_user(email, update)
    except UserNotFoundError:
        raise HTTPException(status_code=404, detail=f"User not found: {email}")


@router.get("/subscribed-emails")
async def get_subscribed_emails() -> SubscribedEmailsResponse:
    """Get all subscribed users' emails."""
    return await UserService.get_subscribed_emails()


@router.post("/by-email/{email}/forms/{form_id}")
async def record_form_submission(email: str, form_id: str) -> dict[str, str]:
    """Record a form submission for a user."""
    try:
        await UserService.record_form_submission(email, form_id)
        return {"status": "ok"}
    except UserNotFoundError:
        raise HTTPException(status_code=404, detail=f"User not found: {email}")


@router.post("/by-email/{email}/mails/{mail_id}")
async def record_mail_received(email: str, mail_id: str) -> dict[str, str]:
    """Record a mail received for a user."""
    try:
        await UserService.record_mail_received(email, mail_id)
        return {"status": "ok"}
    except UserNotFoundError:
        raise HTTPException(status_code=404, detail=f"User not found: {email}")
