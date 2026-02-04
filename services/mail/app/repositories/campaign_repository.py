from datetime import datetime, timezone

from bson import ObjectId

from app.config import settings
from app.db.mongodb import MongoDB
from app.models.campaign import (
    CampaignCreate,
    CampaignInDB,
    CampaignStatus,
    CampaignUpdate,
    ExecutionRecord,
)
from app.utils.logger import logger


class CampaignNotFoundError(Exception):
    """Raised when a campaign is not found."""

    pass


class CampaignRepository:
    @classmethod
    def _get_collection(cls):
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
            update_ops["$addToSet"] = {"executed_times": scheduled_time}

        result = await collection.update_one(
            {"_id": ObjectId(campaign_id)},
            update_ops,
        )

        if result.matched_count == 0:
            raise CampaignNotFoundError(f"Campaign not found: {campaign_id}")

        logger.info("Execution record added", campaign_id=campaign_id)

    @classmethod
    async def list_recent(cls, limit: int = 20, offset: int = 0) -> list[CampaignInDB]:
        """List recent campaigns, sorted by created_at descending."""
        collection = cls._get_collection()

        cursor = collection.find().sort("created_at", -1).skip(offset).limit(limit)

        campaigns = []
        async for doc in cursor:
            campaigns.append(CampaignInDB.model_validate(doc))

        return campaigns

    @classmethod
    async def get_due_campaigns(cls, before_time: datetime) -> list[CampaignInDB]:
        """Get campaigns with scheduled sends due before the given time."""
        collection = cls._get_collection()

        # Find campaigns that:
        # 1. Have status SCHEDULED
        # 2. Have scheduled_sends with time <= before_time
        # 3. The scheduled time hasn't been executed yet
        cursor = collection.find(
            {
                "status": CampaignStatus.SCHEDULED.value,
                "scheduled_sends": {
                    "$elemMatch": {
                        "time": {"$lte": before_time},
                    }
                },
            }
        )

        campaigns = []
        async for doc in cursor:
            campaign = CampaignInDB.model_validate(doc)
            # Filter out campaigns where all due times have been executed
            has_unexecuted_due_time = False
            for send in campaign.scheduled_sends:
                if (
                    send.time <= before_time
                    and send.time not in campaign.executed_times
                ):
                    has_unexecuted_due_time = True
                    break
            if has_unexecuted_due_time:
                campaigns.append(campaign)

        return campaigns
