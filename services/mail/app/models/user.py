from pydantic import BaseModel, EmailStr, Field

from app.models.common import PyObjectId


class UserEmailInfo(BaseModel):
    """Minimal interface for external users collection."""

    id: PyObjectId = Field(alias="_id")
    email: EmailStr
    is_subscribed: bool = Field(alias="isSubscribed")

    model_config = {"populate_by_name": True, "arbitrary_types_allowed": True}
