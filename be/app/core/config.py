from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables and .env files.

    This class defines the configuration settings for the application, including log settings,
    server configuration, API version, Supabase database settings, and API credentials.
    """
    model_config = SettingsConfigDict(env_file=[".env", "./.env", "../.env"])

    # ENV
    ENV: str = Field(...)
    API_V1_STR: str = Field(default="/api/v1")

    # Server configuration
    SERVER_HOST: str = Field(default="localhost")
    SERVER_PORT: int = Field(default=8000)

    # Logging
    LOG_LEVEL: str = Field(default="INFO")

    # API Keys
    LIX_API_KEY: str = Field(...)

    DATABASE_URL: str = Field(..., description="Full database connection URL")

    # Livekit
    LIVEKIT_API_KEY: str = Field(...)
    LIVEKIT_API_SECRET: str = Field(...)
    LIVEKIT_URL: str = Field(...)

    # Deepgram
    DEEPGRAM_API_KEY: str = Field(...)

    # OpenAI
    OPENAI_API_KEY: str = Field(...)


settings = Settings()
