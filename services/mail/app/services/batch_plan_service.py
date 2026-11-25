import asyncio
from datetime import datetime, timedelta, timezone

from app.clients.user_client import UserServiceClient
from app.config import settings
from app.models.campaign import (
    BatchPlanResponse,
    BatchStatus,
    BatchTriggerStartResponse,
    ExecutionProgress,
)
from app.repositories.batch_plan_repository import BatchPlanRepository
from app.repositories.campaign_repository import CampaignNotFoundError
from app.repositories.campaign_repository import CampaignRepository
from app.services.campaign_service import CampaignConflictError
from app.services.email_service import EmailService, SendResult
from app.services.unsubscribe_service import UnsubscribeService
from app.utils.logger import logger


class BatchPlanNotFoundError(Exception):
    """Raised when a batch plan is not found."""

    pass


class BatchNotFoundError(Exception):
    """Raised when a batch number does not exist in a plan."""

    pass


class BatchPlanService:
    _background_tasks: set[asyncio.Task] = set()

    @staticmethod
    def _normalize_datetime(value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    @staticmethod
    def _default_unsubscribe_url_base(unsubscribe_url_base: str) -> str:
        if unsubscribe_url_base:
            return unsubscribe_url_base
        return f"{settings.BASE_URL.rstrip('/')}/unsubscribe"

    @classmethod
    async def create_plan(cls, campaign_id: str) -> BatchPlanResponse:
        """Snapshot the current audience and persist a balanced batch plan."""
        campaign = await CampaignRepository.get_by_id(campaign_id)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        emails = await UserServiceClient.get_subscribed_emails()
        # Dedupe and sort deterministically so ranges are stable
        audience = sorted(set(emails), key=str.casefold)

        plan = await BatchPlanRepository.create(
            campaign_id, audience, settings.MAX_BATCH_SIZE
        )
        return BatchPlanResponse.from_db(plan)

    @classmethod
    async def get_plan(cls, campaign_id: str, plan_id: str) -> BatchPlanResponse:
        """Get a batch plan with batch states and results."""
        plan = await BatchPlanRepository.get(plan_id, campaign_id)
        if plan is None:
            raise BatchPlanNotFoundError(f"Batch plan not found: {plan_id}")
        return BatchPlanResponse.from_db(plan)

    @classmethod
    def _is_stale(cls, started_at: datetime | None, is_complete: bool) -> bool:
        """True when an in_progress batch should be recovered."""
        minutes = settings.STALE_IN_PROGRESS_MINUTES
        if minutes <= 0:
            return False
        if started_at is None or is_complete:
            return True
        age = datetime.now(timezone.utc) - cls._normalize_datetime(started_at)
        return age > timedelta(minutes=minutes)

    @classmethod
    async def trigger_batch(
        cls,
        campaign_id: str,
        plan_id: str,
        batch_number: int,
        unsubscribe_url_base: str = "",
    ) -> BatchTriggerStartResponse:
        """Trigger a single batch in the background; other batches stay put."""
        campaign = await CampaignRepository.get_by_id(campaign_id)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        plan = await BatchPlanRepository.get(plan_id, campaign_id)
        if plan is None:
            raise BatchPlanNotFoundError(f"Batch plan not found: {plan_id}")

        batch = next((b for b in plan.batches if b.number == batch_number), None)
        if batch is None:
            raise BatchNotFoundError(f"Batch not found: {batch_number}")

        if batch.status == BatchStatus.COMPLETED:
            raise CampaignConflictError("Batch already completed")

        if batch.status == BatchStatus.IN_PROGRESS:
            progress = batch.current_progress
            if cls._is_stale(
                progress.started_at if progress else None,
                progress.is_complete if progress else True,
            ):
                logger.warning(
                    "Recovering stale in_progress batch",
                    plan_id=plan_id,
                    batch_number=batch_number,
                )
                await BatchPlanRepository.finish_batch(
                    plan_id, campaign_id, batch_number, BatchStatus.FAILED
                )
            else:
                raise CampaignConflictError("Batch is already in progress")

        claimed = await BatchPlanRepository.claim_batch(
            plan_id, campaign_id, batch_number, datetime.now(timezone.utc)
        )
        if not claimed:
            raise CampaignConflictError("Batch is already in progress or completed")

        previous_status = campaign.status
        switched_to_in_progress = await CampaignRepository.mark_in_progress_if_allowed(
            campaign_id
        )
        if not switched_to_in_progress:
            await BatchPlanRepository.release_batch(plan_id, campaign_id, batch_number)
            raise CampaignConflictError("Campaign is already in progress")

        try:
            task = asyncio.create_task(
                cls._execute_batch_in_background(
                    campaign_id,
                    plan_id,
                    batch_number,
                    unsubscribe_url_base,
                    previous_status,
                )
            )
            cls._background_tasks.add(task)
            task.add_done_callback(cls._background_tasks.discard)
        except Exception:
            await BatchPlanRepository.release_batch(plan_id, campaign_id, batch_number)
            await CampaignRepository.update_status(campaign_id, previous_status)
            raise

        return BatchTriggerStartResponse(
            plan_id=plan_id,
            campaign_id=campaign_id,
            batch_number=batch_number,
            recipient_count=batch.recipient_count,
            status="in_progress",
        )

    @classmethod
    async def _run_batch(
        cls,
        campaign_id: str,
        plan_id: str,
        batch_number: int,
        unsubscribe_url_base: str,
    ) -> None:
        """Send one batch to currently subscribed, not-yet-sent recipients."""
        plan = await BatchPlanRepository.get(plan_id, campaign_id)
        if plan is None:
            raise BatchPlanNotFoundError(f"Batch plan not found: {plan_id}")

        batch = next((b for b in plan.batches if b.number == batch_number), None)
        if batch is None:
            raise BatchNotFoundError(f"Batch not found: {batch_number}")

        campaign = await CampaignRepository.get_by_id(campaign_id)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        if not unsubscribe_url_base:
            unsubscribe_url_base = f"{settings.BASE_URL.rstrip('/')}/unsubscribe"

        started_at = datetime.now(timezone.utc)
        # Plan audience is fixed; only subscription status is re-checked
        subscribed = set(await UserServiceClient.get_subscribed_emails())
        audience_slice = plan.audience[batch.start - 1 : batch.end]
        sent_before = set(batch.sent_emails)
        targets = [
            email
            for email in audience_slice
            if email not in sent_before and email in subscribed
        ]

        counters = {"sent": 0, "failed": 0}

        async def on_result(result: SendResult) -> None:
            if result.success:
                counters["sent"] += 1
            else:
                counters["failed"] += 1
            progress = ExecutionProgress(
                total_recipients=len(targets),
                sent_count=counters["sent"],
                failed_count=counters["failed"],
                started_at=started_at,
            )
            await BatchPlanRepository.record_result(
                plan_id,
                campaign_id,
                batch_number,
                result.email,
                result.success,
                progress,
            )

        if not targets:
            final = (
                BatchStatus.COMPLETED
                if len(sent_before) >= len(audience_slice)
                else BatchStatus.FAILED
            )
            logger.info(
                "No sendable recipients in batch",
                plan_id=plan_id,
                batch_number=batch_number,
                final_status=final,
            )
            await BatchPlanRepository.finish_batch(
                plan_id, campaign_id, batch_number, final
            )
            return

        results = await EmailService.send_bulk(
            recipients=targets,
            subject=campaign.subject,
            body_html=campaign.body_html,
            unsubscribe_url_base=unsubscribe_url_base,
            generate_token_func=UnsubscribeService.generate_token,
            result_callback=on_result,
        )

        record_tasks = [
            UserServiceClient.record_mail_received(r.email, campaign_id)
            for r in results
            if r.success
        ]
        if record_tasks:
            await asyncio.gather(*record_tasks, return_exceptions=True)

        total_sent = len(sent_before) + counters["sent"]
        if total_sent >= len(audience_slice):
            final = BatchStatus.COMPLETED
        elif counters["sent"] == 0:
            final = BatchStatus.FAILED
        else:
            final = BatchStatus.PARTIALLY_FAILED

        await BatchPlanRepository.finish_batch(
            plan_id, campaign_id, batch_number, final
        )
        logger.info(
            "Batch execution completed",
            campaign_id=campaign_id,
            plan_id=plan_id,
            batch_number=batch_number,
            sent=counters["sent"],
            failed=counters["failed"],
        )

    @classmethod
    async def _execute_batch_in_background(
        cls,
        campaign_id: str,
        plan_id: str,
        batch_number: int,
        unsubscribe_url_base: str,
        previous_status: str,
    ) -> None:
        """Background wrapper: restore campaign status and mark batch failed on error."""
        try:
            await cls._run_batch(
                campaign_id, plan_id, batch_number, unsubscribe_url_base
            )
            await CampaignRepository.update_status(campaign_id, previous_status)
        except Exception as e:
            logger.error(
                "Background batch execution failed",
                campaign_id=campaign_id,
                plan_id=plan_id,
                batch_number=batch_number,
                error=str(e),
            )
            try:
                await BatchPlanRepository.finish_batch(
                    plan_id,
                    campaign_id,
                    batch_number,
                    BatchStatus.FAILED,
                    error=str(e),
                )
                await CampaignRepository.update_status(campaign_id, previous_status)
            except Exception as cleanup_error:
                logger.error(
                    "Failed to clean up after batch failure",
                    campaign_id=campaign_id,
                    error=str(cleanup_error),
                )
