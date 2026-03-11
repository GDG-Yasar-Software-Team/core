from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # MongoDB Configuration
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "gdg_db"
    EVENTS_COLLECTION: str = "events"
    HOST: str = "0.0.0.0"
    PORT: int = 8003

    # Service API Tokens (for internal service authentication)
    EVENT_SERVICE_TOKEN: str = ""

    # Environment
    ENV: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    def get_valid_tokens(self) -> set[str]:
        """Return set of valid API tokens."""
        tokens = set()
        if self.EVENT_SERVICE_TOKEN:
            tokens.add(self.EVENT_SERVICE_TOKEN)
        return tokens


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
