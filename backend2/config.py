"""LLM, database, and application configuration using pydantic-settings."""

from functools import lru_cache
from typing import Optional

from langchain_groq import ChatGroq
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from state import Base


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

    # --- Database ---
    database_url: str = "sqlite:///local.db?driver=sqlite"

    # --- Twilio ---
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    twilio_webhook_url: Optional[str] = None


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


# Convenience alias
settings = get_settings()


# --- Database Configuration ---

# Create database engine (explicitly using sqlite3 driver to avoid aiosqlite)
engine = create_engine("sqlite:///local.db", connect_args={"check_same_thread": False})

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db_session() -> Session:
    """Get a database session."""
    session = SessionLocal()
    return session


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


def get_llm() -> ChatGroq:
    """Create and return a configured LLM instance."""
    return ChatGroq(
        model=settings.model_name,
        api_key=settings.groq_api_key,
        temperature=settings.model_temperature,
    )
