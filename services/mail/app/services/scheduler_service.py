from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.repositories.campaign_repository import CampaignRepository
from app.services.campaign_service import CampaignService
from app.utils.logger import logger


class SchedulerService:
    _scheduler: AsyncIOScheduler | None = None
    _unsubscribe_url_base: str = ""

    @staticmethod
    def _normalize_datetime(value: datetime) -> datetime:
        """Normalize datetimes to timezone-aware UTC."""
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    @classmethod
    def configure(cls, unsubscribe_url_base: str) -> None:
        """Configure the scheduler with the unsubscribe URL base."""
        cls._unsubscribe_url_base = unsubscribe_url_base

    @classmethod
    def start(cls) -> None:
        """Start the scheduler."""
        if cls._scheduler is not None:
            logger.warning("Scheduler already running")
            return

        cls._scheduler = AsyncIOScheduler()
        cls._scheduler.add_job(
            cls._check_and_execute_campaigns,
            "interval",
            minutes=settings.SCHEDULER_CHECK_INTERVAL_MINUTES,
            id="check_campaigns",
            replace_existing=True,
        )
        cls._scheduler.start()
        logger.info("Scheduler started")

    @classmethod
    def stop(cls) -> None:
        """Stop the scheduler gracefully."""
        if cls._scheduler is not None:
            cls._scheduler.shutdown(wait=True)
            cls._scheduler = None
            logger.info("Scheduler stopped")

    @classmethod
    async def _check_and_execute_campaigns(cls) -> None:
        """Check for due campaigns and execute them."""
        try:
            now_utc = datetime.now(timezone.utc)
            campaigns = await CampaignRepository.get_due_campaigns(before_time=now_utc)

            if not campaigns:
                return

            logger.info("Found due campaigns", count=len(campaigns))

            for campaign in campaigns:
                executed_times_utc = {
                    cls._normalize_datetime(t) for t in campaign.executed_times
                }
                # Find due times that haven't been executed
                due_times = {
                    cls._normalize_datetime(send.time)
                    for send in campaign.scheduled_sends
                    if cls._normalize_datetime(send.time) <= now_utc
                    and cls._normalize_datetime(send.time) not in executed_times_utc
                }

                # Execute for each due time
                for scheduled_time in sorted(due_times):
                    try:
                        logger.info(
                            "Executing scheduled campaign",
                            campaign_id=str(campaign.id),
                            scheduled_time=scheduled_time,
                        )
                        await CampaignService.execute_campaign(
                            campaign_id=str(campaign.id),
                            scheduled_time=scheduled_time,
                            unsubscribe_url_base=cls._unsubscribe_url_base,
                        )
                    except Exception as e:
                        logger.error(
                            "Failed to execute scheduled campaign",
                            campaign_id=str(campaign.id),
                            scheduled_time=scheduled_time,
                            error=str(e),
                        )
                        # Continue with other campaigns

        except Exception as e:
            logger.error("Error checking for due campaigns", error=str(e))
