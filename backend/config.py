"""LLM and application configuration using pydantic-settings."""

from functools import lru_cache

from langchain_groq import ChatGroq
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Groq ---
    groq_api_key: str = ""

    # --- Model ---
    model_name: str = "llama-3.3-70b-versatile"
    model_temperature: float = 0.7

    # --- Server ---
    host: str = "0.0.0.0"
    port: int = 8000


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


# Convenience alias
settings = get_settings()


def get_llm() -> ChatGroq:
    """Create and return a configured LLM instance."""
    return ChatGroq(
        model=settings.model_name,
        api_key=settings.groq_api_key,
        temperature=settings.model_temperature,
    )
