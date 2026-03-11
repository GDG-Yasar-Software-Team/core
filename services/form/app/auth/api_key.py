"""API key authentication for admin endpoints."""

from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

from app.config import settings
from app.utils.logger import logger

api_key_header = APIKeyHeader(name="X-API-Token", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    """Verify the API key from X-API-Token header.

    Args:
        api_key: The API key from the request header.

    Returns:
        The validated API key.

    Raises:
        HTTPException: If the API key is missing or invalid.
    """
    if not api_key:
        logger.warning("API request without authentication token")
        raise HTTPException(status_code=401, detail="Missing API token")

    if api_key != settings.ADMIN_API_TOKEN:
        logger.warning("API request with invalid authentication token")
        raise HTTPException(status_code=401, detail="Invalid API token")

    logger.debug("API request authenticated successfully")
    return api_key
