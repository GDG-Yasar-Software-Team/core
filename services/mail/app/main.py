"""Mail microservice - FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.mongodb import MongoDB
from app.routers import campaigns, unsubscribe
from app.services.scheduler_service import SchedulerService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for the FastAPI application."""
    # Startup
    await MongoDB.connect()

    # Configure and start scheduler
    # The unsubscribe URL base will be set dynamically in the trigger endpoint
    SchedulerService.configure(unsubscribe_url_base="")
    SchedulerService.start()

    yield

    # Shutdown
    SchedulerService.stop()
    await MongoDB.close()


app = FastAPI(
    title="Mail Service",
    description="mail microservice for GDG on Campus Yaşar",
    version="0.1.0",
    lifespan=lifespan,
)

# Include routers
app.include_router(campaigns.router)
app.include_router(unsubscribe.router)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
