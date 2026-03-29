"""HTTP client for proxying requests to the user service."""

import httpx

from app.config import settings
from app.utils.logger import logger

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    """Lazy-initialize a module-level async HTTP client."""
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            base_url=settings.USER_SERVICE_URL,
            headers={"X-API-Token": settings.USER_SERVICE_TOKEN},
            timeout=httpx.Timeout(10.0),
        )
    return _client


async def forward_get(path: str) -> httpx.Response:
    """Forward a GET request to the user service."""
    client = _get_client()
    logger.debug(f"Proxying GET {path} to user service")
    return await client.get(path)


async def forward_post(path: str, body: bytes | None = None) -> httpx.Response:
    """Forward a POST request to the user service."""
    client = _get_client()
    logger.debug(f"Proxying POST {path} to user service")
    return await client.post(
        path,
        content=body,
        headers={"Content-Type": "application/json"},
    )


async def forward_put(path: str, body: bytes | None = None) -> httpx.Response:
    """Forward a PUT request to the user service."""
    client = _get_client()
    logger.debug(f"Proxying PUT {path} to user service")
    return await client.put(
        path,
        content=body,
        headers={"Content-Type": "application/json"},
    )


async def close() -> None:
    """Close the HTTP client if open."""
    global _client
    if _client is not None and not _client.is_closed:
        await _client.aclose()
        _client = None
