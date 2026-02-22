from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.common import PyObjectId


class User(BaseModel):
    """Single flexible model - only email required, all else optional.
    Used for both create and update operations."""

    email: EmailStr
    name: str | None = None
    is_yasar_student: bool | None = None  # Auto-set from email domain if None on create
    section: str | None = None  # Faculty/Department
    is_subscribed: bool | None = None  # Default True on create


class UserInDB(BaseModel):
    """Full database model with all fields (snake_case, no aliases)."""

    id: PyObjectId = Field(alias="_id")
    email: EmailStr
    name: str | None = None
    is_yasar_student: bool = False
    section: str | None = None
    submitted_form_ids: list[PyObjectId] = Field(default_factory=list)
    submitted_form_count: int = 0
    received_mail_ids: list[PyObjectId] = Field(default_factory=list)
    received_mail_count: int = 0
    is_subscribed: bool = True
    unsubscribed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}


class UserResponse(BaseModel):
    """API response model."""

    id: str
    email: EmailStr
    name: str | None
    is_yasar_student: bool
    section: str | None
    submitted_form_count: int
    received_mail_count: int
    is_subscribed: bool
    unsubscribed_at: datetime | None
    created_at: datetime
    updated_at: datetime | None

    @classmethod
    def from_db(cls, user: UserInDB) -> "UserResponse":
        """Create a UserResponse from a UserInDB instance."""
        return cls(
            id=str(user.id),
            email=user.email,
            name=user.name,
            is_yasar_student=user.is_yasar_student,
            section=user.section,
            submitted_form_count=user.submitted_form_count,
            received_mail_count=user.received_mail_count,
            is_subscribed=user.is_subscribed,
            unsubscribed_at=user.unsubscribed_at,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )


class SubscribedEmailsResponse(BaseModel):
    """Response model for subscribed emails list."""

    emails: list[str]
    count: int
