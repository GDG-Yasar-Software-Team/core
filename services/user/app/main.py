from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.mongodb import MongoDB
from app.routers import users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    await MongoDB.connect()
    yield
    await MongoDB.close()


app = FastAPI(
    title="User Service",
    description="Internal user microservice for GDG on Campus Yasar",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_origin_regex=settings.CORS_ALLOW_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
