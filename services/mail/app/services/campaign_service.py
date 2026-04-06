import asyncio
from datetime import datetime, timezone

from app.clients.user_client import UserServiceClient
from app.config import settings
from app.models.campaign import (
    CampaignCreate,
    CampaignInDB,
    CampaignResponse,
    CampaignStatus,
    CampaignUpdate,
    ExecutionProgress,
    ExecutionRecord,
    RecipientPreviewResponse,
    TriggerResult,
    TriggerStartResponse,
)
from app.repositories.campaign_repository import (
    CampaignNotFoundError,
    CampaignRepository,
)
from app.services.email_service import EmailService
from app.services.unsubscribe_service import UnsubscribeService
from app.utils.logger import logger


class CampaignConflictError(Exception):
    """Raised when campaign state conflicts with requested operation."""

    pass


class CampaignService:
    _background_tasks: set[asyncio.Task] = set()

    @staticmethod
    def _estimate_rate_per_second() -> float:
        avg_delay = (settings.RATE_LIMIT_MIN_DELAY + settings.RATE_LIMIT_MAX_DELAY) / 2
        if avg_delay <= 0:
            return 0
        return 1 / avg_delay

    @classmethod
    def _estimate_delivery_seconds(cls, total_recipients: int) -> int:
        if total_recipients <= 0:
            return 0
        rate_per_second = cls._estimate_rate_per_second()
        if rate_per_second <= 0:
            return 0
        return int((total_recipients / rate_per_second) + 0.999)

    @classmethod
    async def create_campaign(cls, data: CampaignCreate) -> str:
        """Create a new campaign and return its ID."""
        campaign_id = await CampaignRepository.create(data)
        logger.info(
            "Campaign created",
            campaign_id=campaign_id,
            scheduled_sends=len(data.scheduled_sends),
        )
        return campaign_id

    @classmethod
    async def get_campaign(cls, campaign_id: str) -> CampaignResponse | None:
        """Get a campaign by ID."""
        campaign = await CampaignRepository.get_by_id(campaign_id)
        if campaign is None:
            return None
        return CampaignResponse.from_db(campaign)

    @classmethod
    async def get_campaign_progress(cls, campaign_id: str) -> ExecutionProgress:
        """Get execution progress for a campaign."""
        campaign = await CampaignRepository.get_by_id(campaign_id)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        response = CampaignResponse.from_db(campaign)

        if response.current_progress:
            return response.current_progress

        if response.executions:
            last = response.executions[-1]
            return ExecutionProgress(
                total_recipients=last.sent_count + last.failed_count,
                sent_count=last.sent_count,
                failed_count=last.failed_count,
                started_at=last.started_at,
                is_complete=True,
            )

        return ExecutionProgress(
            total_recipients=0,
            sent_count=0,
            failed_count=0,
            started_at=response.created_at,
            is_complete=True,
        )

    @classmethod
    async def update_campaign(
        cls, campaign_id: str, data: CampaignUpdate
    ) -> CampaignResponse:
        """Update a campaign."""
        campaign = await CampaignRepository.get_by_id(campaign_id)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        if campaign.status in (
            CampaignStatus.COMPLETED,
            CampaignStatus.PARTIALLY_COMPLETED,
        ):
            raise ValueError("Cannot update a completed campaign")

        updated = await CampaignRepository.update(campaign_id, data)
        return CampaignResponse.from_db(updated)

    @classmethod
    async def list_campaigns(
        cls, limit: int = 20, offset: int = 0
    ) -> list[CampaignResponse]:
        """List recent campaigns."""
        campaigns = await CampaignRepository.list_recent(limit=limit, offset=offset)
        return [CampaignResponse.from_db(c) for c in campaigns]

    @classmethod
    async def execute_campaign(
        cls,
        campaign_id: str,
        scheduled_time: datetime | None = None,
        unsubscribe_url_base: str = "",
        prefetched_emails: list[str] | None = None,
    ) -> TriggerResult:
        """Execute a campaign, sending emails to all subscribed users."""
        campaign = await CampaignRepository.get_by_id(campaign_id)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        if scheduled_time and scheduled_time in campaign.executed_times:
            raise CampaignConflictError(
                "Scheduled send already executed",
            )

        subject = campaign.subject
        if scheduled_time and campaign.use_custom_subjects:
            for send in campaign.scheduled_sends:
                if send.time == scheduled_time and send.subject:
                    subject = send.subject
                    break

        switched_to_in_progress = await CampaignRepository.mark_in_progress_if_allowed(
            campaign_id
        )
        if not switched_to_in_progress:
            raise CampaignConflictError("Campaign is already in progress")
        started_at = datetime.now(timezone.utc)

        if not unsubscribe_url_base:
            unsubscribe_url_base = (
                f"{settings.BASE_URL.rstrip('/')}/unsubscribe"
            )

        try:
            emails = prefetched_emails
            if emails is None:
                emails = await UserServiceClient.get_subscribed_emails()
            total = len(emails)

            progress = ExecutionProgress(
                total_recipients=total,
                started_at=started_at,
            )
            await CampaignRepository.update_progress(campaign_id, progress)

            if not emails:
                logger.info("No subscribed users found", campaign_id=campaign_id)
                progress.is_complete = True
                await CampaignRepository.update_progress(campaign_id, progress)

                execution = ExecutionRecord(
                    scheduled_time=scheduled_time,
                    subject_used=subject,
                    started_at=started_at,
                    completed_at=datetime.now(timezone.utc),
                    sent_count=0,
                    failed_count=0,
                    recipient_emails=[],
                    failed_emails=[],
                    is_manual_trigger=scheduled_time is None,
                )
                await CampaignRepository.add_execution(
                    campaign_id, execution, scheduled_time
                )
                await cls._update_final_status(campaign)
                return TriggerResult(
                    campaign_id=campaign_id,
                    sent_count=0,
                    failed_count=0,
                    subject_used=subject,
                )

            update_interval = settings.PROGRESS_UPDATE_INTERVAL

            async def on_progress(sent: int, failed: int) -> None:
                if (sent + failed) % update_interval == 0 or (
                    sent + failed
                ) == total:
                    progress.sent_count = sent
                    progress.failed_count = failed
                    await CampaignRepository.update_progress(campaign_id, progress)

            results = await EmailService.send_bulk(
                recipients=emails,
                subject=subject,
                body_html=campaign.body_html,
                unsubscribe_url_base=unsubscribe_url_base,
                generate_token_func=UnsubscribeService.generate_token,
                progress_callback=on_progress,
            )

            sent_count = sum(1 for r in results if r.success)
            failed_count = sum(1 for r in results if not r.success)
            recipient_emails = [r.email for r in results if r.success]
            failed_emails = [r.email for r in results if not r.success]

            record_tasks = [
                UserServiceClient.record_mail_received(email, campaign_id)
                for email in recipient_emails
            ]
            if record_tasks:
                await asyncio.gather(*record_tasks, return_exceptions=True)

            execution = ExecutionRecord(
                scheduled_time=scheduled_time,
                subject_used=subject,
                started_at=started_at,
                completed_at=datetime.now(timezone.utc),
                sent_count=sent_count,
                failed_count=failed_count,
                recipient_emails=recipient_emails,
                failed_emails=failed_emails,
                is_manual_trigger=scheduled_time is None,
            )
            await CampaignRepository.add_execution(
                campaign_id, execution, scheduled_time
            )

            campaign = await CampaignRepository.get_by_id(campaign_id)
            await cls._update_final_status(campaign)

            progress.sent_count = sent_count
            progress.failed_count = failed_count
            progress.is_complete = True
            await CampaignRepository.update_progress(campaign_id, progress)

            logger.info(
                "Campaign execution completed",
                campaign_id=campaign_id,
                sent=sent_count,
                failed=failed_count,
            )

            return TriggerResult(
                campaign_id=campaign_id,
                sent_count=sent_count,
                failed_count=failed_count,
                subject_used=subject,
            )

        except Exception as e:
            logger.error(
                "Campaign execution failed", campaign_id=campaign_id, error=str(e)
            )
            await CampaignRepository.update_status(campaign_id, CampaignStatus.FAILED)
            await CampaignRepository.clear_progress(campaign_id)
            raise

    @classmethod
    async def trigger_now(
        cls, campaign_id: str, unsubscribe_url_base: str = ""
    ) -> TriggerStartResponse:
        """Trigger a campaign immediately in the background."""
        campaign = await CampaignRepository.get_by_id(campaign_id)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")
        if campaign.status == CampaignStatus.IN_PROGRESS:
            raise CampaignConflictError("Campaign is already in progress")
        if campaign.status not in (CampaignStatus.SCHEDULED, CampaignStatus.FAILED):
            raise ValueError("Campaign can only be triggered when scheduled or failed")

        emails = await UserServiceClient.get_subscribed_emails()
        total = len(emails)

        progress = ExecutionProgress(
            total_recipients=total,
            started_at=datetime.now(timezone.utc),
        )
        await CampaignRepository.update_progress(campaign_id, progress)
        switched_to_in_progress = await CampaignRepository.mark_in_progress_if_allowed(
            campaign_id
        )
        if not switched_to_in_progress:
            raise CampaignConflictError("Campaign is already in progress")

        if not unsubscribe_url_base:
            unsubscribe_url_base = (
                f"{settings.BASE_URL.rstrip('/')}/unsubscribe"
            )

        task = asyncio.create_task(
            cls._execute_in_background(
                campaign_id, unsubscribe_url_base, emails
            )
        )
        cls._background_tasks.add(task)
        task.add_done_callback(cls._background_tasks.discard)

        return TriggerStartResponse(
            campaign_id=campaign_id,
            total_recipients=total,
            status="in_progress",
        )

    @classmethod
    async def get_recipient_preview(cls) -> RecipientPreviewResponse:
        """Get recipient count and estimated delivery duration."""
        emails = await UserServiceClient.get_subscribed_emails()
        total_recipients = len(emails)
        estimated_seconds = cls._estimate_delivery_seconds(total_recipients)
        estimated_minutes = int((estimated_seconds / 60) + 0.999) if estimated_seconds else 0

        return RecipientPreviewResponse(
            total_recipients=total_recipients,
            estimated_seconds=estimated_seconds,
            estimated_minutes=estimated_minutes,
            rate_per_second=round(cls._estimate_rate_per_second(), 2),
        )

    @classmethod
    async def _execute_in_background(
        cls,
        campaign_id: str,
        unsubscribe_url_base: str,
        prefetched_emails: list[str],
    ) -> None:
        """Wrapper for background execution with error logging."""
        try:
            await cls.execute_campaign(
                campaign_id=campaign_id,
                scheduled_time=None,
                unsubscribe_url_base=unsubscribe_url_base,
                prefetched_emails=prefetched_emails,
            )
        except Exception as e:
            logger.error(
                "Background campaign execution failed",
                campaign_id=campaign_id,
                error=str(e),
            )

    @classmethod
    async def _update_final_status(cls, campaign: CampaignInDB) -> None:
        """Update campaign status based on executions and scheduled sends."""
        campaign = await CampaignRepository.get_by_id(str(campaign.id))

        all_executed = all(
            send.time in campaign.executed_times for send in campaign.scheduled_sends
        )

        has_failures = any(e.failed_count > 0 for e in campaign.executions)
        all_failed = (
            all(e.sent_count == 0 and e.failed_count > 0 for e in campaign.executions)
            if campaign.executions
            else False
        )

        if all_failed:
            status = CampaignStatus.FAILED
        elif all_executed or not campaign.scheduled_sends:
            status = (
                CampaignStatus.PARTIALLY_COMPLETED
                if has_failures
                else CampaignStatus.COMPLETED
            )
        else:
            status = CampaignStatus.SCHEDULED

        await CampaignRepository.update_status(str(campaign.id), status)
