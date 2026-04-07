from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URI: str
    DATABASE_NAME: str = "form_db"
    MONGODB_CONNECT_TIMEOUT_MS: int = 5000
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: int = 5000
    MONGODB_SOCKET_TIMEOUT_MS: int = 5000
    HOST: str = "0.0.0.0"
    PORT: int = 8002
    ENV: str = "development"
    CORS_ALLOW_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    CORS_ALLOW_ORIGIN_REGEX: str | None = r"https?://(localhost|127\.0\.0\.1)(:\d+)?$"

    # Admin authentication token for protected endpoints
    # SECURITY: No default value - must be set via .env file
    ADMIN_API_TOKEN: str

    # User service connection (for proxying frontend requests server-side)
    USER_SERVICE_URL: str = "http://localhost:8001"
    USER_SERVICE_TOKEN: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    @property
    def cors_allow_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ALLOW_ORIGINS.split(",")
            if origin.strip()
        ]


settings = Settings()
