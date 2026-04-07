from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection

from app.config import settings
from app.db.mongodb import MongoDB
from app.models.campaign import (
    CampaignCreate,
    CampaignInDB,
    CampaignStatus,
    CampaignUpdate,
    ExecutionProgress,
    ExecutionRecord,
)
from app.utils.logger import logger


class CampaignNotFoundError(Exception):
    """Raised when a campaign is not found."""

    pass


class CampaignRepository:
    @staticmethod
    def _normalize_datetime(value: datetime) -> datetime:
        """Normalize datetimes to timezone-aware UTC."""
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    @classmethod
    def _get_collection(cls) -> AsyncIOMotorCollection:
        return MongoDB.get_db()[settings.CAMPAIGNS_COLLECTION]

    @classmethod
    async def create(cls, campaign: CampaignCreate) -> str:
        """Create a new campaign and return its ID."""
        collection = cls._get_collection()

        doc = {
            "subject": campaign.subject,
            "body_html": campaign.body_html,
            "scheduled_sends": [send.model_dump() for send in campaign.scheduled_sends],
            "use_custom_subjects": campaign.use_custom_subjects,
            "status": CampaignStatus.SCHEDULED.value,
            "executions": [],
            "executed_times": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": None,
        }

        result = await collection.insert_one(doc)
        campaign_id = str(result.inserted_id)

        logger.info("Campaign created", campaign_id=campaign_id)
        return campaign_id

    @classmethod
    async def get_by_id(cls, campaign_id: str) -> CampaignInDB | None:
        """Fetch a campaign by ID."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(campaign_id):
            return None

        doc = await collection.find_one({"_id": ObjectId(campaign_id)})
        if doc is None:
            return None

        return CampaignInDB.model_validate(doc)

    @classmethod
    async def update(cls, campaign_id: str, update: CampaignUpdate) -> CampaignInDB:
        """Update a campaign with partial data."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(campaign_id):
            raise CampaignNotFoundError(f"Invalid campaign ID: {campaign_id}")

        update_data = update.model_dump(exclude_unset=True)
        if not update_data:
            # No fields to update, just return the current campaign
            campaign = await cls.get_by_id(campaign_id)
            if campaign is None:
                raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")
            return campaign

        # Convert scheduled_sends to dict format
        if "scheduled_sends" in update_data and update_data["scheduled_sends"]:
            update_data["scheduled_sends"] = [
                send.model_dump() if hasattr(send, "model_dump") else send
                for send in update_data["scheduled_sends"]
            ]

        update_data["updated_at"] = datetime.now(timezone.utc)

        result = await collection.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": update_data},
        )

        if result.matched_count == 0:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        campaign = await cls.get_by_id(campaign_id)
        logger.info("Campaign updated", campaign_id=campaign_id)
        return campaign

    @classmethod
    async def update_status(
        cls,
        campaign_id: str,
        status: CampaignStatus,
    ) -> None:
        """Update campaign status."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(campaign_id):
            raise CampaignNotFoundError(f"Invalid campaign ID: {campaign_id}")

        result = await collection.update_one(
            {"_id": ObjectId(campaign_id)},
            {
                "$set": {
                    "status": status.value,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        if result.matched_count == 0:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        logger.info("Campaign status updated", campaign_id=campaign_id, status=status)

    @classmethod
    async def mark_in_progress_if_allowed(cls, campaign_id: str) -> bool:
        """Atomically set status to in_progress if currently not in_progress."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(campaign_id):
            raise CampaignNotFoundError(f"Invalid campaign ID: {campaign_id}")

        result = await collection.update_one(
            {
                "_id": ObjectId(campaign_id),
                "status": {"$ne": CampaignStatus.IN_PROGRESS.value},
            },
            {
                "$set": {
                    "status": CampaignStatus.IN_PROGRESS.value,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
        )

        if result.matched_count == 0:
            campaign = await cls.get_by_id(campaign_id)
            if campaign is None:
                raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")
            return False

        modified = int(getattr(result, "modified_count", 0) or 0)
        return modified > 0

    @classmethod
    async def add_execution(
        cls,
        campaign_id: str,
        execution: ExecutionRecord,
        scheduled_time: datetime | None = None,
    ) -> None:
        """Add an execution record to the campaign."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(campaign_id):
            raise CampaignNotFoundError(f"Invalid campaign ID: {campaign_id}")

        update_ops = {
            "$push": {"executions": execution.model_dump()},
            "$set": {"updated_at": datetime.now(timezone.utc)},
        }

        # Mark the scheduled time as executed if provided
        if scheduled_time:
            update_ops["$addToSet"] = {
                "executed_times": cls._normalize_datetime(scheduled_time)
            }

        result = await collection.update_one(
            {"_id": ObjectId(campaign_id)},
            update_ops,
        )

        if result.matched_count == 0:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        logger.info("Execution record added", campaign_id=campaign_id)

    @classmethod
    async def update_progress(
        cls, campaign_id: str, progress: ExecutionProgress
    ) -> None:
        """Update the real-time execution progress for a campaign."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(campaign_id):
            raise CampaignNotFoundError(f"Invalid campaign ID: {campaign_id}")

        await collection.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": {"current_progress": progress.model_dump()}},
        )

    @classmethod
    async def clear_progress(cls, campaign_id: str) -> None:
        """Clear the execution progress after completion."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(campaign_id):
            raise CampaignNotFoundError(f"Invalid campaign ID: {campaign_id}")

        await collection.update_one(
            {"_id": ObjectId(campaign_id)},
            {"$set": {"current_progress": None}},
        )

    @classmethod
    async def list_recent(cls, limit: int = 20, offset: int = 0) -> list[CampaignInDB]:
        """List recent campaigns, sorted by created_at descending."""
        collection = cls._get_collection()

        projection = {
            "executions.recipient_emails": 0,
            "executions.failed_emails": 0,
        }
        cursor = (
            collection.find({}, projection)
            .sort("created_at", -1)
            .skip(offset)
            .limit(limit)
        )

        campaigns = []
        async for doc in cursor:
            campaigns.append(CampaignInDB.model_validate(doc))

        return campaigns

    @classmethod
    async def get_due_campaigns(cls, before_time: datetime) -> list[CampaignInDB]:
        """Get campaigns with scheduled sends due before the given time."""
        collection = cls._get_collection()
        before_time_utc = cls._normalize_datetime(before_time)

        # Find campaigns that:
        # 1. Have status SCHEDULED
        # 2. Have scheduled_sends with time <= before_time
        # 3. The scheduled time hasn't been executed yet
        cursor = collection.find(
            {
                "status": CampaignStatus.SCHEDULED.value,
                "scheduled_sends": {
                    "$elemMatch": {
                        "time": {"$lte": before_time_utc},
                    }
                },
            }
        )

        campaigns = []
        async for doc in cursor:
            campaign = CampaignInDB.model_validate(doc)
            executed_times_utc = {
                cls._normalize_datetime(executed)
                for executed in campaign.executed_times
            }
            # Filter out campaigns where all due times have been executed
            has_unexecuted_due_time = False
            for send in campaign.scheduled_sends:
                send_time_utc = cls._normalize_datetime(send.time)
                if (
                    send_time_utc <= before_time_utc
                    and send_time_utc not in executed_times_utc
                ):
                    has_unexecuted_due_time = True
                    break
            if has_unexecuted_due_time:
                campaigns.append(campaign)

        return campaigns
