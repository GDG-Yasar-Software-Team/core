import asyncio

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.utils.logger import logger


class MongoDB:
    client: AsyncIOMotorClient | None = None
    _connect_lock: asyncio.Lock | None = None

    @classmethod
    async def connect(cls):
        try:
            logger.info("Connecting to MongoDB...")
            cls.client = AsyncIOMotorClient(settings.MONGODB_URI)
            # Verify connection
            await cls.client.admin.command("ping")
            logger.success("Successfully connected to MongoDB")
        except Exception as e:
            if cls.client is not None:
                cls.client.close()
                cls.client = None
            logger.critical(f"Failed to connect to MongoDB: {e}")
            raise e

    @classmethod
    async def ensure_connected(cls):
        if cls.client is not None:
            return

        if cls._connect_lock is None:
            cls._connect_lock = asyncio.Lock()

        async with cls._connect_lock:
            if cls.client is None:
                await cls.connect()

    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()
            cls.client = None
            logger.info("MongoDB connection closed")

    @classmethod
    def get_db(cls):
        if cls.client is None:
            raise Exception("Database client is not initialized")
        return cls.client[settings.DATABASE_NAME]


async def get_database():
    await MongoDB.ensure_connected()
    return MongoDB.get_db()
