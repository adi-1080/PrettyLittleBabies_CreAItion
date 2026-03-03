"""FastAPI application entry-point — Evaa MVP (Groq Edition)."""

import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from agents.notifier import format_twiml_response
from config import settings
from graph import create_homeops_graph
from state import (
    HomeOpsState,
    SessionLocal,
    StructuredTask,
    init_db,
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# ---------------------------------------------------------------------------
# Lifespan — initialise DB and compile graph on startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise resources on startup."""
    init_db()
    logger.info("Database tables created / verified.")
    app.state.homeops_graph = create_homeops_graph()
    logger.info("Evaa HomeOps LangGraph compiled.")
    yield


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Evaa MVP — HomeOps AI Chief of Staff",
    version="1.0.0",
    description="AI-powered domestic logistics assistant that parses WhatsApp messages into categorized tasks.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok", "service": "evaa-mvp"}


# ---------------------------------------------------------------------------
# Twilio WhatsApp Webhook
# ---------------------------------------------------------------------------

@app.post("/whatsapp")
async def whatsapp_webhook(Body: str = Form(...), From: str = Form(...)):
    """
    Receives incoming WhatsApp messages from Twilio.

    Twilio sends form-encoded data with (at minimum):
      - Body: the message text
      - From: sender in 'whatsapp:+1234567890' format
    """
    logger.info("WhatsApp message from %s: %s", From, Body)

    homeops_graph = app.state.homeops_graph

    initial_state: HomeOpsState = {
        "raw_input": Body,
        "sender": From,
        "extracted_data": None,
        "message_id": None,
        "status": "pending",
        "response_message": "",
    }

    result = homeops_graph.invoke(initial_state)

    response_text = result.get(
        "response_message",
        "✅ Message received! I'm processing it now.",
    )

    twiml = format_twiml_response(response_text)
    return Response(content=twiml, media_type="application/xml")


# ---------------------------------------------------------------------------
# Dashboard API — view all tasks
# ---------------------------------------------------------------------------

@app.get("/tasks")
async def get_tasks():
    """Return all structured tasks ordered by creation date (newest first)."""
    db = SessionLocal()
    try:
        tasks = (
            db.query(StructuredTask)
            .order_by(StructuredTask.created_at.desc())
            .all()
        )
        return [
            {
                "id": t.id,
                "title": t.title,
                "items_list": t.items_list,
                "category": t.category,
                "urgency": t.urgency,
                "due_date": t.due_date,
                "is_deadline_critical": t.is_deadline_critical,
                "mental_load_score": t.mental_load_score,
                "is_completed": t.is_completed,
                "created_at": str(t.created_at) if t.created_at else None,
            }
            for t in tasks
        ]
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
