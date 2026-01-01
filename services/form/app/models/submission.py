from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, EmailStr, ConfigDict

from services.form.app.models.common import PyObjectId


class SubmissionCreate(BaseModel):
    form: PyObjectId
    answers: dict[str, Any] = Field(...,min_length=1)
    respondent_email: EmailStr
    respondent_name: str | None = Field(default=None, max_length=100)


class SubmissionInDB(SubmissionCreate):
    id: PyObjectId = Field(alias="_id")
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )


class SubmissionResponse(BaseModel):
    id: str
    form_id: str
    answers: dict[str, Any]
    respondent_email: EmailStr | None
    respondent_name: str | None
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
