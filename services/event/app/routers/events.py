from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.api_key import verify_api_key
from app.models.event import EventCreate, EventResponse, EventUpdate
from app.repositories.event_repository import EventNotFoundError
from app.services.event_service import EventService

router = APIRouter(
    prefix="/events",
    tags=["events"],
)


@router.post("/", status_code=201, dependencies=[Depends(verify_api_key)])
async def create_event(event: EventCreate) -> dict[str, str]:
    """Create a new event."""
    try:
        event_id = await EventService.create_event(event)
        return {"id": event_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{event_id}")
async def get_event_by_id(event_id: str) -> EventResponse:
    """Get an event by ID."""
    event = await EventService.get_event_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail=f"Event not found: {event_id}")
    return event


@router.put("/{event_id}", dependencies=[Depends(verify_api_key)])
async def update_event(event_id: str, update: EventUpdate) -> EventResponse:
    """Update an event by ID. Only updates provided fields."""
    try:
        return await EventService.update_event(event_id, update)
    except EventNotFoundError:
        raise HTTPException(status_code=404, detail=f"Event not found: {event_id}")


@router.delete("/{event_id}", status_code=204, dependencies=[Depends(verify_api_key)])
async def delete_event(event_id: str) -> None:
    """Delete an event by ID."""
    try:
        await EventService.delete_event(event_id)
    except EventNotFoundError:
        raise HTTPException(status_code=404, detail=f"Event not found: {event_id}")


@router.get("/")
async def list_events(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[EventResponse]:
    """List events with pagination."""
    return await EventService.list_events(limit=limit, offset=offset)
