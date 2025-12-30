"""Form microservice - FastAPI application entry point."""

from fastapi import FastAPI

app = FastAPI(
    title="Form Service",
    description="form microservice",
    version="0.1.0",
)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
