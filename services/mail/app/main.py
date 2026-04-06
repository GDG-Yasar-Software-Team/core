"""Mail microservice - FastAPI application entry point."""

from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.clients.user_client import UserServiceClient
from app.config import settings
from app.db.mongodb import MongoDB
from app.routers import campaigns, unsubscribe
from app.services.scheduler_service import SchedulerService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for the FastAPI application."""
    # Validate production config
    settings.validate_production_config()

    await MongoDB.connect()

    # Configure and start scheduler with proper base URL
    unsubscribe_url_base = f"{settings.BASE_URL.rstrip('/')}/unsubscribe"
    SchedulerService.configure(unsubscribe_url_base=unsubscribe_url_base)
    SchedulerService.start()

    yield

    # Shutdown
    SchedulerService.stop()
    await UserServiceClient.close()
    await MongoDB.close()


app = FastAPI(
    title="Mail Service",
    description="mail microservice for GDG on Campus Yaşar",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(campaigns.router)
app.include_router(unsubscribe.router)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


def run() -> None:
    """Run the application with service-level host and port settings."""
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENV == "development",
    )


if __name__ == "__main__":
    run()
