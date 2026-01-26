import json
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, Query, Request, UploadFile
from pydantic import ValidationError

from app.models.campaign import (
    CampaignCreate,
    CampaignListItem,
    CampaignResponse,
    CampaignUpdate,
    ScheduledSend,
    TriggerResult,
)
from app.repositories.campaign_repository import CampaignNotFoundError
from app.services.campaign_service import CampaignService

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


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
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{campaign_id}/trigger")
async def trigger_campaign(
    campaign_id: str,
    request: Request,
) -> TriggerResult:
    """Trigger a campaign immediately, ignoring scheduled times."""
    try:
        # Build unsubscribe URL base from request
        base_url = str(request.base_url).rstrip("/")
        unsubscribe_url_base = f"{base_url}/unsubscribe"

        return await CampaignService.trigger_now(
            campaign_id=campaign_id,
            unsubscribe_url_base=unsubscribe_url_base,
        )
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
