"""Pydantic models, SQLAlchemy database models, and LangGraph state definitions."""

from __future__ import annotations

import operator
from datetime import datetime, date
from enum import Enum
from typing import Annotated, Sequence, Optional

from langchain_core.messages import AnyMessage
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine


# ---------------------------------------------------------------------------
# Database Models
# ---------------------------------------------------------------------------

Base = declarative_base()


class InboundMessage(Base):
    """Table to log every raw text from Twilio."""
    __tablename__ = "inbound_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String(50), nullable=False)  # WhatsApp phone number
    raw_body = Column(Text, nullable=False)  # Original message content
    timestamp = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)  # Whether this message has been processed


class HouseholdTask(Base):
    """Table for the 'Household Jira' task management."""
    __tablename__ = "household_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)  # School, Grocery, Work, Household
    priority = Column(Integer, default=3)  # 1-5 scale
    due_date = Column(DateTime, nullable=True)
    status = Column(String(20), default="pending")  # pending, in_progress, completed
    items_list = Column(Text, nullable=True)  # JSON string of items
    clash_alert = Column(Boolean, default=False)  # True if urgent deadline
    created_at = Column(DateTime, default=datetime.utcnow)
    source_message_id = Column(Integer, nullable=True)  # FK to inbound_messages


# ---------------------------------------------------------------------------
# Pydantic Schemas for LLM Structured Output
# ---------------------------------------------------------------------------

class TaskCategory(str, Enum):
    SCHOOL = "School"
    GROCERY = "Grocery"
    WORK = "Work"
    HOUSEHOLD = "Household"
    OTHER = "Other"


class TaskExtraction(BaseModel):
    """Schema the LLM must follow for task extraction."""
    
    task_name: str = Field(
        ...,
        description="Clear, descriptive name of the task (e.g., 'Buy Geography Project Stationary')"
    )
    
    items_list: list[str] = Field(
        default=[],
        description="List of specific items needed (e.g., ['chart paper', 'glue', 'glitters'])"
    )
    
    category: TaskCategory = Field(
        ...,
        description="Category of the task based on context"
    )
    
    urgency: int = Field(
        ...,
        ge=1,
        le=5,
        description="Urgency level 1-5 based on deadline mentioned (5 = most urgent)"
    )
    
    due_date: Optional[str] = Field(
        default=None,
        description="Due date if mentioned (e.g., 'tomorrow', 'Monday', 'next week')"
    )
    
    clash_alert: bool = Field(
        default=False,
        description="True if the task is due 'tomorrow' or 'tonight' (immediate attention needed)"
    )


# ---------------------------------------------------------------------------
# API Response Models
# ---------------------------------------------------------------------------

class TaskResponse(BaseModel):
    """API response model for household tasks."""
    
    id: int
    title: str
    category: str
    priority: int
    due_date: Optional[datetime]
    status: str
    items_list: Optional[list[str]]
    clash_alert: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class WhatsAppRequest(BaseModel):
    """Incoming WhatsApp webhook request from Twilio."""
    
    Body: str = Field(..., description="The message content")
    From: str = Field(..., description="Sender's WhatsApp number")


# ---------------------------------------------------------------------------
# LangGraph State
# ---------------------------------------------------------------------------

class AgentState(BaseModel):
    """
    The core state that flows through every node in the LangGraph graph.
    
    For WhatsApp processing, this includes the raw message, extracted tasks,
    and the response to be sent back.
    """
    
    messages: Annotated[Sequence[AnyMessage], operator.add] = Field(
        default_factory=list,
        description="The conversation message history.",
    )
    
    raw_message: Optional[str] = Field(
        default=None,
        description="Raw WhatsApp message content."
    )
    
    sender: Optional[str] = Field(
        default=None,
        description="WhatsApp sender number."
    )
    
    extracted_tasks: Optional[list[TaskExtraction]] = Field(
        default=None,
        description="Tasks extracted by the LLM."
    )
    
    response_message: Optional[str] = Field(
        default=None,
        description="Response message to send back via WhatsApp."
    )


# Legacy schemas - keeping for compatibility

class ChatRequest(BaseModel):
    """Incoming chat request body (legacy)."""

    message: str = Field(
        ...,
        min_length=1,
        description="The user's message.",
    )


class ChatResponse(BaseModel):
    """Outgoing chat response body (legacy)."""

    response: str = Field(
        ...,
        description="The assistant's reply.",
    )
