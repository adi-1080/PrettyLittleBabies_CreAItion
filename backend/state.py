"""Pydantic models, SQLAlchemy models, and LangGraph state definitions for Evaa MVP."""

from __future__ import annotations

from datetime import datetime
from typing import Optional, TypedDict

from pydantic import BaseModel, Field
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# ---------------------------------------------------------------------------
# SQLAlchemy Base & Engine
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    pass


engine = create_engine(
    "sqlite:///./local.db", connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Yield a database session (FastAPI dependency-style)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# SQLAlchemy Models
# ---------------------------------------------------------------------------

class InboundMessage(Base):
    """Stores the raw 'Dump' from WhatsApp / Twilio."""

    __tablename__ = "inbound_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sender_phone = Column(String, nullable=False)
    raw_text = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)


class StructuredTask(Base):
    """The 'Household Jira' entries extracted by the LLM."""

    __tablename__ = "structured_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    items_list = Column(Text, nullable=True)       # JSON string of physical items
    category = Column(String)                       # School, Grocery, Health, Home, Work-Sync
    urgency = Column(Integer)                       # 1 (Low) to 5 (Critical)
    due_date = Column(String, nullable=True)
    is_deadline_critical = Column(Boolean, default=False)
    mental_load_score = Column(Integer, default=1)  # 1-10
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Pydantic Models — LLM structured output (multi-task extraction)
# ---------------------------------------------------------------------------

class SingleTaskExtraction(BaseModel):
    """One task extracted from a WhatsApp message."""

    name: str = Field(description="Short, actionable title of the task")
    items: list[str] = Field(
        description="List of physical items needed (e.g. ['chart paper', 'glue', 'glitter'])"
    )
    category: str = Field(
        description="One of: School, Grocery, Health, Home, or Work-Sync"
    )
    urgency: int = Field(
        description="Urgency score from 1 (whenever) to 5 (ASAP/today/tomorrow)"
    )
    due_date: Optional[str] = Field(
        default=None,
        description="Extracted date or time if mentioned (e.g. 'tomorrow', 'Friday'), else null",
    )
    is_deadline_critical: bool = Field(
        default=False,
        description="True if the item is needed 'tomorrow', 'tonight', or within 24 hours",
    )


class TaskExtractionResult(BaseModel):
    """Complete extraction result: multiple tasks + mental load assessment."""

    tasks: list[SingleTaskExtraction] = Field(
        description="All tasks extracted from the message, separated by category"
    )
    mental_load_score: int = Field(
        description="Overall mental load score 1-10 (10 = extreme overload)"
    )
    mental_load_reason: str = Field(
        description="Brief explanation of why the mental load is at this level"
    )


# ---------------------------------------------------------------------------
# LangGraph State — HomeOps Evaa flow
# ---------------------------------------------------------------------------

class HomeOpsState(TypedDict):
    """Shared state passed between HomeOps LangGraph nodes."""

    raw_input: str
    sender: str
    extracted_data: Optional[TaskExtractionResult]
    message_id: Optional[int]
    status: str                 # "success", "error", "pending_notification"
    response_message: str       # text to send back via Twilio
