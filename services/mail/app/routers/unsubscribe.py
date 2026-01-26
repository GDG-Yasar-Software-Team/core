from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

from app.clients.user_client import UserNotFoundError
from app.config import settings
from app.services.unsubscribe_service import InvalidTokenError, UnsubscribeService

router = APIRouter(prefix="/unsubscribe", tags=["unsubscribe"])

# Template cache
_template_cache: dict[str, str] = {}


def _get_template(template_name: str) -> str:
    """Load and cache a template."""
    if template_name not in _template_cache:
        _template_cache[template_name] = settings.load_template(template_name)
    return _template_cache[template_name]


@router.get("/{token}", response_class=HTMLResponse)
async def unsubscribe_page(token: str) -> str:
    """Show unsubscribe confirmation page."""
    try:
        email = UnsubscribeService.get_user_email_from_token(token)
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid or expired link")
        template = _get_template("unsubscribe_page.html")
        return template.replace("{email}", email)
    except InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid or expired link")


@router.post("/{token}", response_class=HTMLResponse)
async def process_unsubscribe(token: str) -> str:
    """Process unsubscribe request."""
    try:
        email = await UnsubscribeService.unsubscribe_by_token(token)
        template = _get_template("unsubscribe_success.html")
        return template.replace("{email}", email)
    except InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid or expired link")
    except UserNotFoundError:
        raise HTTPException(status_code=400, detail="User not found")
