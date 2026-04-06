from datetime import datetime, timezone

from pydantic import BaseModel, Field, field_validator

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
    tags: list[str] = Field(default_factory=list)
    event_type: str | None = None
    registration_form_url: str | None = None
    image_url: str | None = None
    tags: list[str] = Field(default_factory=list)
    registration_form_url: str | None = None
    event_type: str = Field(min_length=1, max_length=100)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str]) -> list[str]:
        for tag in v:
            if not tag or len(tag) > 50:
                msg = "Each tag must be a non-empty string of at most 50 characters"
                raise ValueError(msg)
        return v


class EventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1)
    date: datetime | None = None
    place: str | None = Field(default=None, min_length=1, max_length=200)
    speakers: list[Speaker] | None = None
    tags: list[str] | None = None
    event_type: str | None = None
    registration_form_url: str | None = None
    image_url: str | None = None
    tags: list[str] = Field(default_factory=list)
    registration_form_url: str | None = None
    event_type: str = Field(min_length=1, max_length=100)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return v
        for tag in v:
            if not tag or len(tag) > 50:
                msg = "Each tag must be a non-empty string of at most 50 characters"
                raise ValueError(msg)
        return v


class EventInDB(BaseModel):
    id: PyObjectId = Field(alias="_id")
    title: str
    description: str
    date: datetime
    place: str
    speakers: list[Speaker] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    event_type: str | None = None
    registration_form_url: str | None = None
    image_url: str | None = None
    tags: list[str] = Field(default_factory=list)
    registration_form_url: str | None = None
    event_type: str = "general"
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
    tags: list[str]
    event_type: str | None = None
    registration_form_url: str | None = None
    image_url: str | None
    tags: list[str]
    registration_form_url: str | None
    event_type: str = Field(serialization_alias="type")
    created_at: datetime
    updated_at: datetime | None

    model_config = {"populate_by_name": True}

    @classmethod
    def from_db(cls, event: EventInDB) -> "EventResponse":
        return cls(
            id=str(event.id),
            title=event.title,
            description=event.description,
            date=event.date,
            place=event.place,
            speakers=event.speakers,
            tags=event.tags,
            event_type=event.event_type,
            registration_form_url=event.registration_form_url,
            image_url=event.image_url,
            created_at=event.created_at,
            updated_at=event.updated_at,
        )
