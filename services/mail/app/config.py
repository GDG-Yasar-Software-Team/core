from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # MongoDB Configuration
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "gdg_db"
    CAMPAIGNS_COLLECTION: str = "mails"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # User Service Configuration
    USER_SERVICE_URL: str = "http://localhost:8001"
    USER_SERVICE_TOKEN: str = ""
    USER_SERVICE_TIMEOUT: float = 30.0

    # SMTP Configuration
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SENDER_ADDRESS: str = ""
    SMTP_PASSWORD: str = ""

    # Base URL for unsubscribe links
    BASE_URL: str = "http://localhost:8000"

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

    def validate_production_config(self) -> None:
        """Validate critical settings for production environments."""
        if self.ENV == "production":
            if self.UNSUBSCRIBE_SECRET_KEY == "dev-secret-key":
                raise ValueError(
                    "UNSUBSCRIBE_SECRET_KEY must be set to a secure value in production. "
                    "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
                )
            if not self.BASE_URL or self.BASE_URL == "http://localhost:8000":
                raise ValueError(
                    "BASE_URL must be set to your production domain in production. "
                    "Example: https://mail.gdg.com"
                )
            if not self.USER_SERVICE_TOKEN:
                raise ValueError(
                    "USER_SERVICE_TOKEN must be set in production. "
                    "This should match the MAIL_SERVICE_TOKEN in the user service."
                )
            if (
                not self.USER_SERVICE_URL
                or self.USER_SERVICE_URL == "http://localhost:8001"
            ):
                raise ValueError(
                    "USER_SERVICE_URL must be set to the production user service URL. "
                    "Example: https://user.gdg.com"
                )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
