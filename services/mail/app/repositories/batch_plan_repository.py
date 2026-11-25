import math
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorCollection

from app.config import settings
from app.db.mongodb import MongoDB
from app.models.campaign import (
    BatchInfo,
    BatchPlanInDB,
    BatchStatus,
    ExecutionProgress,
)
from app.utils.logger import logger


def build_batches(audience: list[str], batch_size: int) -> list[BatchInfo]:
    """Divide a sorted audience into the fewest batches within batch_size,
    balanced so sizes differ by at most 1, with contiguous 1-based ranges."""
    total = len(audience)
    if total == 0:
        return []

    batch_count = math.ceil(total / batch_size)
    base, remainder = divmod(total, batch_count)

    batches: list[BatchInfo] = []
    start = 1
    for i in range(batch_count):
        size = base + (1 if i < remainder else 0)
        batches.append(
            BatchInfo(
                number=i + 1, start=start, end=start + size - 1, recipient_count=size
            )
        )
        start += size
    return batches


class BatchPlanRepository:
    @staticmethod
    def _normalize_datetime(value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    @classmethod
    def _get_collection(cls) -> AsyncIOMotorCollection:
        return MongoDB.get_db()[settings.BATCH_PLANS_COLLECTION]

    @classmethod
    async def create(
        cls, campaign_id: str, audience: list[str], batch_size: int
    ) -> BatchPlanInDB:
        """Create a batch plan with a frozen audience snapshot."""
        collection = cls._get_collection()

        result = await collection.insert_one(
            {
                "campaign_id": ObjectId(campaign_id),
                "batch_size": batch_size,
                "audience": audience,
                "batches": [
                    b.model_dump() for b in build_batches(audience, batch_size)
                ],
                "created_at": datetime.now(timezone.utc),
                "updated_at": None,
            }
        )

        plan = BatchPlanInDB(
            _id=result.inserted_id,
            campaign_id=ObjectId(campaign_id),
            batch_size=batch_size,
            audience=audience,
            batches=build_batches(audience, batch_size),
        )
        logger.info(
            "Batch plan created",
            plan_id=str(plan.id),
            campaign_id=campaign_id,
            batches=len(plan.batches),
        )
        return plan

    @classmethod
    async def get(cls, plan_id: str, campaign_id: str) -> BatchPlanInDB | None:
        """Fetch a batch plan scoped to its campaign."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(plan_id) or not ObjectId.is_valid(campaign_id):
            return None

        doc = await collection.find_one(
            {"_id": ObjectId(plan_id), "campaign_id": ObjectId(campaign_id)}
        )
        if doc is None:
            return None

        return BatchPlanInDB.model_validate(doc)

    @classmethod
    async def claim_batch(
        cls, plan_id: str, campaign_id: str, batch_number: int, started_at: datetime
    ) -> bool:
        """Atomically mark a batch in_progress unless it is already in progress
        or completed."""
        collection = cls._get_collection()

        result = await collection.update_one(
            {
                "_id": ObjectId(plan_id),
                "campaign_id": ObjectId(campaign_id),
                "batches": {
                    "$elemMatch": {
                        "number": batch_number,
                        "status": {
                            "$nin": [
                                BatchStatus.IN_PROGRESS.value,
                                BatchStatus.COMPLETED.value,
                            ]
                        },
                    }
                },
            },
            {
                "$set": {
                    "batches.$[b].status": BatchStatus.IN_PROGRESS.value,
                    "batches.$[b].current_progress": ExecutionProgress(
                        total_recipients=0, started_at=started_at
                    ).model_dump(),
                    "updated_at": datetime.now(timezone.utc),
                }
            },
            arrayFilters=[{"b.number": batch_number}],
        )
        return result.modified_count > 0

    @classmethod
    async def release_batch(
        cls, plan_id: str, campaign_id: str, batch_number: int
    ) -> None:
        """Return a claimed batch to pending without counting an attempt."""
        collection = cls._get_collection()

        await collection.update_one(
            {
                "_id": ObjectId(plan_id),
                "campaign_id": ObjectId(campaign_id),
                "batches.number": batch_number,
            },
            {
                "$set": {
                    "batches.$[b].status": BatchStatus.PENDING.value,
                    "batches.$[b].current_progress": None,
                    "updated_at": datetime.now(timezone.utc),
                }
            },
            arrayFilters=[{"b.number": batch_number}],
        )

    @classmethod
    async def record_result(
        cls,
        plan_id: str,
        campaign_id: str,
        batch_number: int,
        email: str,
        success: bool,
        progress: ExecutionProgress,
    ) -> None:
        """Persist one per-recipient outcome plus current progress."""
        collection = cls._get_collection()

        update: dict = {
            "$set": {
                "batches.$[b].current_progress": progress.model_dump(),
                "updated_at": datetime.now(timezone.utc),
            }
        }
        if success:
            update["$addToSet"] = {"batches.$[b].sent_emails": email}
            update["$pull"] = {"batches.$[b].failed_emails": email}
        else:
            update["$addToSet"] = {"batches.$[b].failed_emails": email}
            update["$pull"] = {"batches.$[b].sent_emails": email}

        await collection.update_one(
            {
                "_id": ObjectId(plan_id),
                "campaign_id": ObjectId(campaign_id),
                "batches.number": batch_number,
            },
            update,
            arrayFilters=[{"b.number": batch_number}],
        )

    @classmethod
    async def finish_batch(
        cls,
        plan_id: str,
        campaign_id: str,
        batch_number: int,
        status: BatchStatus,
        error: str | None = None,
    ) -> None:
        """Mark a batch run finished and count the attempt."""
        collection = cls._get_collection()

        await collection.update_one(
            {
                "_id": ObjectId(plan_id),
                "campaign_id": ObjectId(campaign_id),
                "batches.number": batch_number,
            },
            {
                "$set": {
                    "batches.$[b].status": status.value,
                    "batches.$[b].current_progress": None,
                    "batches.$[b].last_error": error,
                    "updated_at": datetime.now(timezone.utc),
                },
                "$inc": {"batches.$[b].attempts": 1},
            },
            arrayFilters=[{"b.number": batch_number}],
        )
        logger.info(
            "Batch finished",
            plan_id=plan_id,
            campaign_id=campaign_id,
            batch_number=batch_number,
            status=status,
        )
