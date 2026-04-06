from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field

from app.models.common import PyObjectId


class CampaignStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PARTIALLY_COMPLETED = "partially_completed"
    FAILED = "failed"


class ScheduledSend(BaseModel):
    """Model for each scheduled send."""

    time: datetime
    subject: str | None = None  # Optional custom subject for this send


class ExecutionRecord(BaseModel):
    """Record of a single campaign execution."""

    scheduled_time: datetime | None = None  # None for manual triggers
    subject_used: str
    started_at: datetime
    completed_at: datetime | None = None
    sent_count: int = 0
    failed_count: int = 0
    recipient_emails: list[str] = Field(default_factory=list)
    failed_emails: list[str] = Field(default_factory=list)
    is_manual_trigger: bool = False


class ExecutionProgress(BaseModel):
    """Tracks real-time progress of an ongoing campaign execution."""

    total_recipients: int
    sent_count: int = 0
    failed_count: int = 0
    started_at: datetime
    is_complete: bool = False


class CampaignCreate(BaseModel):
    """Input model for creating a campaign."""

    subject: str = Field(min_length=1, max_length=200)
    body_html: str = Field(min_length=1, max_length=512_000)
    scheduled_sends: list[ScheduledSend] = Field(default_factory=list)
    use_custom_subjects: bool = False


class CampaignUpdate(BaseModel):
    """Input model for updating a campaign."""

    subject: str | None = Field(default=None, min_length=1, max_length=200)
    body_html: str | None = Field(default=None, min_length=1, max_length=512_000)
    scheduled_sends: list[ScheduledSend] | None = None
    use_custom_subjects: bool | None = None


class CampaignInDB(BaseModel):
    """Database model for a campaign."""

    id: PyObjectId = Field(alias="_id")
    subject: str
    body_html: str
    scheduled_sends: list[ScheduledSend] = Field(default_factory=list)
    use_custom_subjects: bool = False
    status: CampaignStatus = CampaignStatus.SCHEDULED
    executions: list[ExecutionRecord] = Field(default_factory=list)
    executed_times: list[datetime] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None
    current_progress: ExecutionProgress | None = None

    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}


class CampaignResponse(BaseModel):
    """API response model for a campaign."""

    id: str
    subject: str
    body_html: str
    scheduled_sends: list[ScheduledSend]
    use_custom_subjects: bool
    status: CampaignStatus
    executions: list[ExecutionRecord]
    executed_times: list[datetime]
    created_at: datetime
    updated_at: datetime | None = None
    current_progress: ExecutionProgress | None = None

    @classmethod
    def from_db(cls, campaign: CampaignInDB) -> "CampaignResponse":
        return cls(
            id=str(campaign.id),
            subject=campaign.subject,
            body_html=campaign.body_html,
            scheduled_sends=campaign.scheduled_sends,
            use_custom_subjects=campaign.use_custom_subjects,
            status=campaign.status,
            executions=campaign.executions,
            executed_times=campaign.executed_times,
            created_at=campaign.created_at,
            updated_at=campaign.updated_at,
            current_progress=campaign.current_progress,
        )


class CampaignListItem(BaseModel):
    """Lightweight model for campaign listing."""

    id: str
    subject: str
    status: CampaignStatus
    scheduled_sends_count: int
    executions_count: int
    created_at: datetime

    @classmethod
    def from_db(cls, campaign: CampaignInDB) -> "CampaignListItem":
        return cls(
            id=str(campaign.id),
            subject=campaign.subject,
            status=campaign.status,
            scheduled_sends_count=len(campaign.scheduled_sends),
            executions_count=len(campaign.executions),
            created_at=campaign.created_at,
        )


class TriggerResult(BaseModel):
    """Result of triggering a campaign."""

    campaign_id: str
    sent_count: int
    failed_count: int
    subject_used: str


class TriggerStartResponse(BaseModel):
    """Immediate response when a campaign trigger is accepted."""

    campaign_id: str
    total_recipients: int
    status: str


class TestMailRequest(BaseModel):
    """Input model for sending a test email. Never persisted to DB."""

    emails: list[str] = Field(min_length=1, max_length=10)
    subject: str = Field(min_length=1, max_length=200)
    body_html: str = Field(min_length=1)


class TestMailResult(BaseModel):
    """Result of a single test email send."""

    email: str
    success: bool
    error: str | None = None


class TestMailResponse(BaseModel):
    """Response from the test-send endpoint."""

    results: list[TestMailResult]
    sent_count: int
    failed_count: int
