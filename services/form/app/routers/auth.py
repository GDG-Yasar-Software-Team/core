"""Authentication endpoints for admin access."""

from fastapi import APIRouter, Depends, Response, status

from app.auth import verify_api_key

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get(
    "/verify",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(verify_api_key)],
)
async def verify_admin_token() -> Response:
    """Verify the admin API token without touching the database."""
    return Response(status_code=status.HTTP_204_NO_CONTENT)
