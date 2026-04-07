"""Proxy router that forwards user-related requests to the user service.

Keeps the user-service API token server-side instead of exposing it
in the frontend JavaScript bundle.
"""

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from app.clients import user_client
from app.utils.logger import logger

router = APIRouter(prefix="/users", tags=["users"])


def _map_response(resp: httpx.Response) -> JSONResponse:
    """Convert an httpx response into a FastAPI JSONResponse."""
    if resp.status_code >= 500:
        logger.error(f"User service returned {resp.status_code}")
        raise HTTPException(status_code=502, detail="User service unavailable")
    return JSONResponse(content=resp.json(), status_code=resp.status_code)


@router.get("/by-email/{email}")
async def get_user_by_email(email: str) -> JSONResponse:
    """Proxy: look up a user by email."""
    resp = await user_client.forward_get(f"/users/by-email/{email}")
    return _map_response(resp)


@router.post("/", status_code=201)
async def create_user(request: Request) -> JSONResponse:
    """Proxy: create a new user."""
    body = await request.body()
    resp = await user_client.forward_post("/users/", body)
    return _map_response(resp)


@router.put("/by-email/{email}")
async def update_user(email: str, request: Request) -> JSONResponse:
    """Proxy: update user by email."""
    body = await request.body()
    resp = await user_client.forward_put(f"/users/by-email/{email}", body)
    return _map_response(resp)


@router.post("/by-email/{email}/forms/{form_id}")
async def record_form_submission(email: str, form_id: str) -> JSONResponse:
    """Proxy: record a form submission for a user."""
    resp = await user_client.forward_post(f"/users/by-email/{email}/forms/{form_id}")
    return _map_response(resp)
