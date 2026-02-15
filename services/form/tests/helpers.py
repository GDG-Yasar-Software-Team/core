"""Shared test helpers for form service tests."""

from bson import ObjectId


# Shared test constants
SAMPLE_FORM_ID = ObjectId("507f1f77bcf86cd799439011")
SAMPLE_SUBMISSION_ID = ObjectId("507f1f77bcf86cd799439022")


class MockAsyncCursor:
    """Mock async cursor that supports async for and to_list."""

    def __init__(self, docs: list[dict]):
        self.docs = docs
        self.index = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.index >= len(self.docs):
            raise StopAsyncIteration
        doc = self.docs[self.index]
        self.index += 1
        return doc

    def sort(self, *args, **kwargs):
        return self

    def skip(self, n):
        return self

    def limit(self, n):
        return self

    async def to_list(self, length=None):
        return self.docs


def create_async_cursor(docs: list[dict]) -> MockAsyncCursor:
    """Create a mock async cursor that yields documents."""
    return MockAsyncCursor(docs)
