"""Configuration settings for the backend application."""

import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Keys
    GEMINI_API_KEY: str

    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = False

    # CORS Settings
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"

    # Gemini Settings
    GEMINI_MODEL: str = "gemini-2.0-flash-exp"  # Main model (for video analysis)
    GEMINI_FAST_MODEL: str = "gemini-2.0-flash-exp"  # Fast model (for persona reactions, etc.)
    GEMINI_MAX_CONCURRENT: int = 50  # Max concurrent API calls
    GEMINI_TIMEOUT: int = 60  # Timeout in seconds
    GEMINI_MAX_RETRIES: int = 3

    # Simulation Settings
    DEFAULT_PERSONA_COUNT: int = 500

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        case_sensitive = True


# Global settings instance
settings = Settings()
