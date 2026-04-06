import json
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from pydantic import ValidationError

from app.config import settings
from app.models.campaign import (
    CampaignCreate,
    CampaignListItem,
    CampaignResponse,
    CampaignUpdate,
    ExecutionProgress,
    RecipientPreviewResponse,
    ScheduledSend,
    TestMailRequest,
    TestMailResponse,
    TestMailResult,
    TriggerStartResponse,
)
from app.clients.user_client import (
    UserServiceAuthError,
    UserServiceError,
    UserServiceTimeoutError,
)
from app.repositories.campaign_repository import CampaignNotFoundError
from app.services.campaign_service import CampaignConflictError, CampaignService
from app.services.email_service import EmailService


async def verify_admin_token(
    x_admin_token: Annotated[str, Header()] = "",
) -> None:
    """Validate admin API token when ADMIN_API_TOKEN is set (any environment)."""
    if not settings.ADMIN_API_TOKEN:
        return
    if x_admin_token != settings.ADMIN_API_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")


def _http_from_user_service(exc: UserServiceError) -> HTTPException:
    """Map user-service failures to HTTP errors with stable JSON detail."""
    if isinstance(exc, UserServiceAuthError):
        return HTTPException(
            status_code=502,
            detail={
                "code": "user_service_auth",
                "message": str(exc),
            },
        )
    if isinstance(exc, UserServiceTimeoutError):
        return HTTPException(
            status_code=504,
            detail={
                "code": "user_service_timeout",
                "message": str(exc),
            },
        )
    return HTTPException(
        status_code=502,
        detail={"code": "user_service_error", "message": str(exc)},
    )


router = APIRouter(
    prefix="/campaigns",
    tags=["campaigns"],
    dependencies=[Depends(verify_admin_token)],
)


@router.post("/", status_code=201)
async def create_campaign(
    request: Request,
    subject: Annotated[str | None, Form()] = None,
    body_html: Annotated[str | None, Form()] = None,
    body_file: Annotated[UploadFile | None, File()] = None,
    scheduled_sends: Annotated[str, Form()] = "[]",
    use_custom_subjects: Annotated[bool, Form()] = False,
) -> dict[str, str]:
    """
    Create a new scheduled campaign.

    For JSON requests: Send entire CampaignCreate as body
    For form requests: subject is required, plus either body_html or body_file
    """
    # Check if this is a JSON request
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        body = await request.json()
        try:
            campaign_data = CampaignCreate.model_validate(body)
        except ValidationError as e:
            raise HTTPException(status_code=422, detail=e.errors())
    else:
        # Form data request
        if not subject:
            raise HTTPException(status_code=422, detail="Subject is required")

        # Get body HTML from file or form field
        if body_file:
            content = await body_file.read()
            html_content = content.decode("utf-8")
        elif body_html:
            html_content = body_html
        else:
            raise HTTPException(
                status_code=422, detail="Either body_html or body_file is required"
            )

        # Parse scheduled_sends JSON
        try:
            sends_data = json.loads(scheduled_sends)
            sends = [ScheduledSend.model_validate(s) for s in sends_data]
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(
                status_code=422, detail=f"Invalid scheduled_sends format: {e}"
            )

        campaign_data = CampaignCreate(
            subject=subject,
            body_html=html_content,
            scheduled_sends=sends,
            use_custom_subjects=use_custom_subjects,
        )

    campaign_id = await CampaignService.create_campaign(campaign_data)
    return {"id": campaign_id, "status": "scheduled"}


@router.put("/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    update: CampaignUpdate,
) -> CampaignResponse:
    """Update a campaign."""
    try:
        return await CampaignService.update_campaign(campaign_id, update)
    except CampaignNotFoundError:
        raise HTTPException(status_code=404, detail="Campaign not found")
    except CampaignConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/{campaign_id}/trigger", status_code=202)
async def trigger_campaign(
    campaign_id: str,
) -> TriggerStartResponse:
    """Trigger a campaign immediately. Execution runs in background."""
    try:
        return await CampaignService.trigger_now(campaign_id=campaign_id)
    except CampaignNotFoundError:
        raise HTTPException(status_code=404, detail="Campaign not found")
    except CampaignConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except UserServiceError as e:
        raise _http_from_user_service(e) from e


@router.get("/recipient-preview")
async def get_recipient_preview() -> RecipientPreviewResponse:
    """Return recipient count and estimated delivery duration for manual trigger."""
    try:
        return await CampaignService.get_recipient_preview()
    except UserServiceError as e:
        raise _http_from_user_service(e) from e


@router.get("/{campaign_id}/progress")
async def get_campaign_progress(campaign_id: str) -> ExecutionProgress:
    """Get real-time execution progress for a campaign."""
    try:
        return await CampaignService.get_campaign_progress(campaign_id)
    except CampaignNotFoundError:
        raise HTTPException(status_code=404, detail="Campaign not found")


@router.get("/{campaign_id}")
async def get_campaign(campaign_id: str) -> CampaignResponse:
    """Get campaign details with execution history."""
    campaign = await CampaignService.get_campaign(campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.get("/")
async def list_campaigns(
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[CampaignListItem]:
    """List recent campaigns."""
    campaigns = await CampaignService.list_campaigns(limit=limit, offset=offset)
    return [
        CampaignListItem(
            id=c.id,
            subject=c.subject,
            status=c.status,
            scheduled_sends_count=len(c.scheduled_sends),
            executions_count=len(c.executions),
            created_at=c.created_at,
        )
        for c in campaigns
    ]


@router.post("/test-send", status_code=200)
async def test_send(
    data: TestMailRequest,
) -> TestMailResponse:
    """
    Send a test email to one or more addresses.

    Does NOT persist anything to the database.
    Does NOT call the user service.
    Does NOT inject unsubscribe links.
    Subject is prefixed with [TEST].
    Maximum 10 recipients.
    """
    results = await EmailService.send_test(
        recipients=data.emails,
        subject=data.subject,
        body_html=data.body_html,
    )
    sent_count = sum(1 for r in results if r.success)
    failed_count = sum(1 for r in results if not r.success)
    return TestMailResponse(
        results=[
            TestMailResult(email=r.email, success=r.success, error=r.error)
            for r in results
        ],
        sent_count=sent_count,
        failed_count=failed_count,
    )
