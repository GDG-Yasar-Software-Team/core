from datetime import datetime, timezone

from app.models.campaign import (
    CampaignCreate,
    CampaignInDB,
    CampaignResponse,
    CampaignStatus,
    CampaignUpdate,
    ExecutionRecord,
    TriggerResult,
)
from app.repositories.campaign_repository import (
    CampaignNotFoundError,
    CampaignRepository,
)
from app.repositories.user_repository import UserRepository
from app.services.email_service import EmailService
from app.services.unsubscribe_service import UnsubscribeService
from app.utils.logger import logger


class CampaignService:
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
    async def update_campaign(
        cls, campaign_id: str, data: CampaignUpdate
    ) -> CampaignResponse:
        """Update a campaign."""
        # Check if campaign exists and is not completed
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
    ) -> TriggerResult:
        """
        Execute a campaign, sending emails to all subscribed users.

        Args:
            campaign_id: The campaign to execute
            scheduled_time: The scheduled time being executed (None for manual triggers)
            unsubscribe_url_base: Base URL for unsubscribe links

        Returns:
            TriggerResult with sent/failed counts
        """
        campaign = await CampaignRepository.get_by_id(campaign_id)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        # Check if this scheduled time was already executed
        if scheduled_time and scheduled_time in campaign.executed_times:
            logger.warning(
                "Scheduled time already executed",
                campaign_id=campaign_id,
                scheduled_time=scheduled_time,
            )
            return TriggerResult(
                campaign_id=campaign_id,
                sent_count=0,
                failed_count=0,
                subject_used=campaign.subject,
            )

        # Determine which subject to use
        subject = campaign.subject
        if scheduled_time and campaign.use_custom_subjects:
            for send in campaign.scheduled_sends:
                if send.time == scheduled_time and send.subject:
                    subject = send.subject
                    break

        # Update status to in_progress
        await CampaignRepository.update_status(campaign_id, CampaignStatus.IN_PROGRESS)

        started_at = datetime.now(timezone.utc)

        try:
            # Fetch subscribed users
            users = await UserRepository.get_subscribed_users()

            if not users:
                logger.info("No subscribed users found", campaign_id=campaign_id)
                execution = ExecutionRecord(
                    scheduled_time=scheduled_time,
                    subject_used=subject,
                    started_at=started_at,
                    completed_at=datetime.now(timezone.utc),
                    sent_count=0,
                    failed_count=0,
                    recipient_user_ids=[],
                    failed_user_ids=[],
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

            # Prepare recipients
            recipients = [(str(u.id), u.email) for u in users]

            # Send emails
            results = await EmailService.send_bulk(
                recipients=recipients,
                subject=subject,
                body_html=campaign.body_html,
                unsubscribe_url_base=unsubscribe_url_base,
                generate_token_func=UnsubscribeService.generate_token,
            )

            # Count results
            sent_count = sum(1 for r in results if r.success)
            failed_count = sum(1 for r in results if not r.success)
            recipient_ids = [r.user_id for r in results if r.success]
            failed_ids = [r.user_id for r in results if not r.success]

            # Record execution
            execution = ExecutionRecord(
                scheduled_time=scheduled_time,
                subject_used=subject,
                started_at=started_at,
                completed_at=datetime.now(timezone.utc),
                sent_count=sent_count,
                failed_count=failed_count,
                recipient_user_ids=recipient_ids,
                failed_user_ids=failed_ids,
                is_manual_trigger=scheduled_time is None,
            )
            await CampaignRepository.add_execution(
                campaign_id, execution, scheduled_time
            )

            # Update final status
            campaign = await CampaignRepository.get_by_id(campaign_id)
            await cls._update_final_status(campaign)

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
            raise

    @classmethod
    async def trigger_now(
        cls, campaign_id: str, unsubscribe_url_base: str = ""
    ) -> TriggerResult:
        """Trigger a campaign immediately, ignoring scheduled times."""
        return await cls.execute_campaign(
            campaign_id=campaign_id,
            scheduled_time=None,  # Manual trigger
            unsubscribe_url_base=unsubscribe_url_base,
        )

    @classmethod
    async def _update_final_status(cls, campaign: CampaignInDB) -> None:
        """Update campaign status based on executions and scheduled sends."""
        # Refresh campaign data
        campaign = await CampaignRepository.get_by_id(str(campaign.id))

        # Check if all scheduled sends have been executed
        all_executed = all(
            send.time in campaign.executed_times for send in campaign.scheduled_sends
        )

        # Check if any execution had failures
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
            # More scheduled sends remaining
            status = CampaignStatus.SCHEDULED

        await CampaignRepository.update_status(str(campaign.id), status)
