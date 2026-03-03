"""Pydantic models and LangGraph state definitions."""

from __future__ import annotations

import operator
from typing import Annotated, Sequence

from langchain_core.messages import AnyMessage
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# LangGraph State
# ---------------------------------------------------------------------------

class AgentState(BaseModel):
    """
    The core state that flows through every node in the LangGraph graph.

    `messages` uses the `operator.add` reducer so that each node can
    *append* messages rather than replacing the whole list.
    """

    messages: Annotated[Sequence[AnyMessage], operator.add] = Field(
        default_factory=list,
        description="The conversation message history.",
    )


# ---------------------------------------------------------------------------
# Request / Response schemas (used by FastAPI endpoints)
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Incoming chat request body."""

    message: str = Field(
        ...,
        min_length=1,
        description="The user's message.",
    )


class ChatResponse(BaseModel):
    """Outgoing chat response body."""

    response: str = Field(
        ...,
        description="The assistant's reply.",
    )
