from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGODB_URI: str
    DATABASE_NAME: str = "form_db"
    HOST: str = "0.0.0.0"
    PORT: int = 8002
    ENV: str = "development"
    CORS_ALLOW_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    CORS_ALLOW_ORIGIN_REGEX: str | None = r"https?://(localhost|127\.0\.0\.1)(:\d+)?$"

    # Admin authentication token for protected endpoints
    ADMIN_API_TOKEN: str = "9374c8c7ab72df4d04b904a0e02acb00ec74b84474514fe301d9ccc259bc8eb0"

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
