"""Form microservice - FastAPI application entry point."""

from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.clients import user_client
from app.config import settings
from app.db.mongodb import MongoDB
from app.routers import forms_router
from app.routers import submissions
from app.routers import users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for the FastAPI application."""
    await MongoDB.connect()
    yield
    await user_client.close()
    await MongoDB.close()


_is_dev = settings.ENV == "development"

app = FastAPI(
    title="Form Service",
    description="form microservice",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if _is_dev else None,
    redoc_url="/redoc" if _is_dev else None,
    openapi_url="/openapi.json" if _is_dev else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_origin_regex=settings.CORS_ALLOW_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Token"],
)

# Include routers
app.include_router(submissions.router)
app.include_router(forms_router)
app.include_router(users.router)


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
