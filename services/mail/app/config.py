from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # MongoDB Configuration
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "gdg_db"
    USERS_COLLECTION: str = "users"
    CAMPAIGNS_COLLECTION: str = "mails"

    # SMTP Configuration
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SENDER_ADDRESS: str = ""
    SMTP_PASSWORD: str = ""

    # Security
    UNSUBSCRIBE_SECRET_KEY: str = "dev-secret-key"

    # Rate Limiting (seconds)
    RATE_LIMIT_MIN_DELAY: float = 2.0
    RATE_LIMIT_MAX_DELAY: float = 6.0

    # Scheduler Configuration
    SCHEDULER_CHECK_INTERVAL_MINUTES: int = 1

    # Environment
    ENV: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    @property
    def templates_dir(self) -> Path:
        """Get the templates directory path."""
        return Path(__file__).parent / "templates"

    def load_template(self, template_name: str) -> str:
        """Load a template file by name."""
        template_path = self.templates_dir / template_name
        return template_path.read_text(encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
