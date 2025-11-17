# backend/app/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    Application settings loaded from .env file.
    Uses Pydantic V2 for validation and type safety.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore extra environment variables
    )

    # 1. Supabase Credentials
    SUPABASE_URL: str = Field(..., description="The URL of the Supabase project.")
    SUPABASE_ANON_KEY: str = Field(
        ..., description="The public anonymous key for Supabase."
    )

    # 2. AI Credentials
    GEMINI_API_KEY: str = Field(
        ..., description="The API key for Google Gemini models."
    )

    # 3. FastAPI/App Settings
    APP_NAME: str = "DatumLens API"
    API_V1_STR: str = "/api/v1"


# Initialize Settings class (automatically reads .env)
settings = Settings()
