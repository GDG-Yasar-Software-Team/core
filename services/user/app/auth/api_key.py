from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

from app.config import settings

api_key_header = APIKeyHeader(name="X-API-Token", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    """Verify the API key from X-API-Token header."""
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing API token")

    valid_tokens = settings.get_valid_tokens()
    if api_key not in valid_tokens:
        raise HTTPException(status_code=401, detail="Invalid API token")

    return api_key
