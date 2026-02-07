"""Form microservice - FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.mongodb import MongoDB
from app.routers import forms_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for the FastAPI application."""
    await MongoDB.connect()
    yield
    await MongoDB.close()


app = FastAPI(
    title="Form Service",
    description="form microservice",
    version="0.1.0",
    lifespan=lifespan,
)

# Register routers
app.include_router(forms_router)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
