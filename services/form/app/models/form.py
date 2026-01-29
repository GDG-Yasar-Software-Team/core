from datetime import datetime, timezone
from enum import Enum
from typing import Self

from pydantic import BaseModel, Field, model_validator, ConfigDict

from .common import PyObjectId


class FieldType(str, Enum):
    TEXT = "text"
    TEXTAREA = "textarea"
    NUMBER = "number"
    SELECT = "select"
    MULTISELECT = "multiselect"
    CHECKBOX = "checkbox"
    RADIO = "radio"
    DATE = "date"


class FieldValidation(BaseModel):
    min_length: int | None = None
    max_length: int | None = None
    min_value: int | None = None
    max_value: int | None = None
    pattern: str | None = None  # Regex pattern


class FormFieldSchema(BaseModel):
    field_id: str = Field(..., min_length=1, max_length=32)
    field_type: FieldType
    label: str = Field(..., min_length=1, max_length=200)
    placeholder: str | None = Field(default=None, max_length=200)
    required: bool = True  # default true for now
    options: list[str] | None = None
    validation: FieldValidation | None = None

    @model_validator(mode="after")
    def validate_options_for_choice_fields(self) -> Self:
        choice_types = {FieldType.SELECT, FieldType.MULTISELECT, FieldType.RADIO}
        if self.field_type in choice_types:
            if not self.options:
                raise ValueError(f"{self.field_type} requires non-empty options")
        return self


class FormCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    questions: list[FormFieldSchema] = Field(..., min_length=1)
    start_date: datetime | None = None
    deadline: datetime | None = None
    is_active: bool = True

    @model_validator(mode="after")
    def validate_dates(self) -> Self:
        if self.start_date and self.deadline:
            if self.deadline <= self.start_date:
                raise ValueError("Deadline must be after start date")
        return self


class FormUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1, max_length=2000)
    questions: list[FormFieldSchema] | None = Field(default=None, min_length=1)
    start_date: datetime | None = None
    deadline: datetime | None = None
    is_active: bool | None = None


class FormResponse(BaseModel):
    id: str
    title: str
    description: str | None
    questions: list[FormFieldSchema]
    start_date: datetime | None
    deadline: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None
    view_count: int
    submission_count: int

    model_config = ConfigDict(from_attributes=True)


class FormPreview(BaseModel):
    id: str
    title: str
    description: str | None
    start_date: datetime | None
    deadline: datetime | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class FormListResponse(BaseModel):
    forms: list[FormPreview]
    total: int
    skip: int
    limit: int


class FormInDB(FormCreate):
    id: PyObjectId = Field(alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = None
    view_count: int = 0
    submission_count: int = 0

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

    def to_response(self) -> FormResponse:
        """Convert FormInDB to FormResponse."""
        return FormResponse(
            id=str(self.id),
            title=self.title,
            description=self.description,
            questions=self.questions,
            start_date=self.start_date,
            deadline=self.deadline,
            is_active=self.is_active,
            created_at=self.created_at,
            updated_at=self.updated_at,
            view_count=self.view_count,
            submission_count=self.submission_count,
        )

    def to_preview(self) -> FormPreview:
        """Convert FormInDB to FormPreview."""
        return FormPreview(
            id=str(self.id),
            title=self.title,
            description=self.description,
            start_date=self.start_date,
            deadline=self.deadline,
            is_active=self.is_active,
        )
