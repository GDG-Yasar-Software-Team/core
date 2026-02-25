from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings
from app.utils.logger import logger


class MongoDB:
    client: AsyncIOMotorClient | None = None

    @classmethod
    async def connect(cls):
        try:
            logger.info("Connecting to MongoDB...")
            cls.client = AsyncIOMotorClient(settings.MONGODB_URI)
            # Verify connection
            await cls.client.admin.command("ping")
            logger.success("Successfully connected to MongoDB")
        except Exception as e:
            logger.critical(f"Failed to connect to MongoDB: {e}")
            raise e

    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")

    @classmethod
    def get_db(cls):
        if cls.client is None:
            raise Exception("Database client is not initialized")
        return cls.client[settings.DATABASE_NAME]


async def get_database():
    return MongoDB.get_db()
