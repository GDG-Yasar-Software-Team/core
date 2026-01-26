from contextlib import asynccontextmanager

from fastapi import FastAPI

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

app.include_router(users.router)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
