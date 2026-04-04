from datetime import datetime, timezone

from bson import ObjectId

from app.config import settings
from app.db.mongodb import MongoDB
from app.models.event import EventCreate, EventInDB, EventUpdate
from app.utils.logger import logger


class EventNotFoundError(Exception):
    """Raised when an event is not found."""

    pass


class EventRepository:
    @classmethod
    def _get_collection(cls):
        return MongoDB.get_db()[settings.EVENTS_COLLECTION]

    @classmethod
    async def create(cls, event: EventCreate) -> str:
        """Create a new event. Returns the inserted ID as string."""
        collection = cls._get_collection()

        doc = {
            "title": event.title,
            "description": event.description,
            "date": event.date,
            "place": event.place,
            "speakers": [speaker.model_dump() for speaker in event.speakers],
            "image_url": event.image_url,
            "tags": event.tags,
            "registration_form_url": event.registration_form_url,
            "event_type": event.event_type,
            "created_at": datetime.now(timezone.utc),
            "updated_at": None,
        }

        result = await collection.insert_one(doc)
        event_id = str(result.inserted_id)

        logger.info("Event created", event_id=event_id, title=event.title)
        return event_id

    @classmethod
    async def get_by_id(cls, event_id: str) -> EventInDB | None:
        """Fetch an event by ID. Returns None for invalid or missing IDs."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(event_id):
            return None

        doc = await collection.find_one({"_id": ObjectId(event_id)})
        if doc is None:
            return None

        return EventInDB.model_validate(doc)

    @classmethod
    async def update(cls, event_id: str, update: EventUpdate) -> EventInDB:
        """Update an event with partial data. Raises EventNotFoundError if not found."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(event_id):
            raise EventNotFoundError(f"Invalid event ID: {event_id}")

        update_data = update.model_dump(exclude_unset=True)
        if not update_data:
            event = await cls.get_by_id(event_id)
            if event is None:
                raise EventNotFoundError(f"Event not found: {event_id}")
            return event

        if "speakers" in update_data and update_data["speakers"] is not None:
            update_data["speakers"] = [
                speaker.model_dump() if hasattr(speaker, "model_dump") else speaker
                for speaker in update_data["speakers"]
            ]

        update_data["updated_at"] = datetime.now(timezone.utc)

        result = await collection.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": update_data},
        )

        if result.matched_count == 0:
            raise EventNotFoundError(f"Event not found: {event_id}")

        updated_event = await cls.get_by_id(event_id)
        logger.info("Event updated", event_id=event_id)
        return updated_event

    @classmethod
    async def delete(cls, event_id: str) -> None:
        """Delete an event by ID. Raises EventNotFoundError if not found."""
        collection = cls._get_collection()

        if not ObjectId.is_valid(event_id):
            raise EventNotFoundError(f"Invalid event ID: {event_id}")

        result = await collection.delete_one({"_id": ObjectId(event_id)})

        if result.deleted_count == 0:
            raise EventNotFoundError(f"Event not found: {event_id}")

        logger.info("Event deleted", event_id=event_id)

    @classmethod
    async def list_events(cls, limit: int = 20, offset: int = 0) -> list[EventInDB]:
        """List events sorted by created_at descending."""
        collection = cls._get_collection()

        cursor = collection.find().sort("created_at", -1).skip(offset).limit(limit)

        events = []
        async for doc in cursor:
            events.append(EventInDB.model_validate(doc))

        return events
