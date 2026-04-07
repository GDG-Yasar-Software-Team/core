"""Form microservice - FastAPI application entry point."""

from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.clients import user_client
from app.config import settings
from app.routers import forms_router
from app.routers.auth import router as auth_router
from app.routers import submissions
from app.routers import users
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for the FastAPI application."""
    yield
    await user_client.close()


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


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Hide Pydantic field paths from public POST /submissions responses."""
    path = request.url.path.rstrip("/")
    if request.method == "POST" and path.endswith("/submissions"):
        logger.warning(f"Submission payload validation failed: {exc.errors()}")
        return JSONResponse(
            status_code=422,
            content={"detail": {"code": "invalid_submission_payload"}},
        )
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


# Include routers
app.include_router(auth_router)
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
