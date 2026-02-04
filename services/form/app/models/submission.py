from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, EmailStr, ConfigDict

from .common import PyObjectId


class SubmissionCreate(BaseModel):
    form_id: PyObjectId
    answers: dict[str, Any] = Field(..., min_length=1)
    respondent_email: EmailStr
    respondent_name: str | None = Field(default=None, max_length=100)

    model_config = ConfigDict(arbitrary_types_allowed=True)


class SubmissionInDB(SubmissionCreate):
    id: PyObjectId = Field(alias="_id")
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)


class SubmissionResponse(BaseModel):
    id: str
    form_id: str
    answers: dict[str, Any]
    respondent_email: EmailStr | None
    respondent_name: str | None
    submitted_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )

    @classmethod
    def from_db(cls, submission: "SubmissionInDB") -> "SubmissionResponse":
        """Convert SubmissionInDB to SubmissionResponse."""
        return cls(
            id=str(submission.id),
            form_id=str(submission.form_id),
            answers=submission.answers,
            respondent_email=submission.respondent_email,
            respondent_name=submission.respondent_name,
            submitted_at=submission.submitted_at,
        )


class PaginatedSubmissionsResponse(BaseModel):
    """Paginated response for submissions list."""

    submissions: list[SubmissionResponse]
    total: int
    skip: int
    limit: int
