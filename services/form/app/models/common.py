from typing import Annotated, Any, TypeAlias
from bson import ObjectId
from pydantic import BeforeValidator, PlainSerializer

def validate_object_id(obj: Any) -> ObjectId:
    """Validate and convert input to MongoDB ObjectId."""
    if isinstance(obj, ObjectId):
        return obj
    if isinstance(obj, str) and ObjectId.is_valid(obj):
        return ObjectId(obj)
    raise ValueError("Invalid ObjectId")


PyObjectId: TypeAlias = Annotated[
    ObjectId,
    BeforeValidator(validate_object_id),
    PlainSerializer(lambda obj: str(obj), return_type=str),
]
