from datetime import datetime, timezone

from app.models.event import EventCreate, EventResponse, EventUpdate
from app.repositories.event_repository import EventRepository
from app.utils.logger import logger


class EventService:
    @classmethod
    async def create_event(cls, data: EventCreate) -> str:
        """Create a new event after validating the event date is in the future."""
        if data.date <= datetime.now(timezone.utc):
            raise ValueError("Event date must be in the future")

        logger.info("Creating event", title=data.title, date=str(data.date))
        return await EventRepository.create(data)

    @classmethod
    async def get_event_by_id(cls, event_id: str) -> EventResponse | None:
        """Get an event by ID. Returns None if not found."""
        db_event = await EventRepository.get_by_id(event_id)
        if db_event is None:
            return None
        return EventResponse.from_db(db_event)

    @classmethod
    async def update_event(cls, event_id: str, update: EventUpdate) -> EventResponse:
        """Update an event. Raises EventNotFoundError if not found."""
        db_event = await EventRepository.update(event_id, update)
        logger.info("Event updated via service", event_id=event_id)
        return EventResponse.from_db(db_event)

    @classmethod
    async def delete_event(cls, event_id: str) -> None:
        """Delete an event. Raises EventNotFoundError if not found."""
        await EventRepository.delete(event_id)
        logger.info("Event deleted via service", event_id=event_id)

    @classmethod
    async def list_events(cls, limit: int = 20, offset: int = 0) -> list[EventResponse]:
        """List events sorted by most recent first."""
        db_events = await EventRepository.list_events(limit=limit, offset=offset)
        return [EventResponse.from_db(event) for event in db_events]
