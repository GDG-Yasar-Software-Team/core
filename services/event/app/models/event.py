from datetime import datetime, timezone

from pydantic import BaseModel, Field

from app.models.common import PyObjectId


class Speaker(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    title: str = Field(min_length=1, max_length=100)
    company: str = Field(min_length=1, max_length=100)


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    date: datetime
    place: str = Field(min_length=1, max_length=200)
    speakers: list[Speaker] = Field(default_factory=list)
    image_url: str | None = None


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1)
    date: datetime | None = None
    place: str | None = Field(default=None, min_length=1, max_length=200)
    speakers: list[Speaker] | None = None
    image_url: str | None = None


class EventInDB(BaseModel):
    id: PyObjectId = Field(alias="_id")
    title: str
    description: str
    date: datetime
    place: str
    speakers: list[Speaker] = Field(default_factory=list)
    image_url: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None

    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}


class EventResponse(BaseModel):
    id: str
    title: str
    description: str
    date: datetime
    place: str
    speakers: list[Speaker]
    image_url: str | None
    created_at: datetime
    updated_at: datetime | None

    @classmethod
    def from_db(cls, event: EventInDB) -> "EventResponse":
        return cls(
            id=str(event.id),
            title=event.title,
            description=event.description,
            date=event.date,
            place=event.place,
            speakers=event.speakers,
            image_url=event.image_url,
            created_at=event.created_at,
            updated_at=event.updated_at,
        )
