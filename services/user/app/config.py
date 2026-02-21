from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # MongoDB Configuration
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "gdg_db"
    USERS_COLLECTION: str = "users"
    HOST: str = "0.0.0.0"
    PORT: int = 8001

    # Service API Tokens (for internal service authentication)
    FORM_SERVICE_TOKEN: str = ""
    MAIL_SERVICE_TOKEN: str = ""
    FORM_FRONTEND_TOKEN: str = ""

    # Environment
    ENV: str = "development"
    CORS_ALLOW_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    CORS_ALLOW_ORIGIN_REGEX: str | None = r"https?://(localhost|127\.0\.0\.1)(:\d+)?$"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    def get_valid_tokens(self) -> set[str]:
        """Return set of valid API tokens."""
        tokens = set()
        if self.FORM_SERVICE_TOKEN:
            tokens.add(self.FORM_SERVICE_TOKEN)
        if self.MAIL_SERVICE_TOKEN:
            tokens.add(self.MAIL_SERVICE_TOKEN)
        if self.FORM_FRONTEND_TOKEN:
            tokens.add(self.FORM_FRONTEND_TOKEN)
        return tokens

    @property
    def cors_allow_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ALLOW_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
