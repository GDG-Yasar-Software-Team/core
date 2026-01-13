from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime, timezone
from typing import Any, Optional, Annotated
from bson import ObjectId
from pydantic.functional_validators import AfterValidator


def validate_object_id(v: Any) -> str:
    if not ObjectId.is_valid(v):
        raise ValueError("Geçersiz ObjectId")
    return str(v)


PyObjectId = Annotated[str, AfterValidator(validate_object_id)]


class SubmissionCreate(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    form_id: str
    answers: dict[str, Any]
    respondent_email: Optional[EmailStr] = None
    respondent_name: Optional[str] = None


class SubmissionInDB(SubmissionCreate):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)
    id: PyObjectId = Field(alias="_id")
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    id: str
    form_id: str
    answers: dict[str, Any]
    respondent_email: Optional[EmailStr] = None
    respondent_name: Optional[str] = None
    submitted_at: datetime


class SubmissionListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    submissions: list[SubmissionResponse]
    total: int
    skip: int
    limit: int
