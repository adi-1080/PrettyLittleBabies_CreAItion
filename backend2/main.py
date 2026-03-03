"""FastAPI application entry-point for Evaa MVP WhatsApp processing."""

from contextlib import asynccontextmanager
from typing import Optional, List

import uvicorn
from fastapi import FastAPI, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from twilio.twiml.messaging_response import MessagingResponse

from config import settings, create_tables, get_db_session
from graph import create_graph
from state import (
    AgentState,
    WhatsAppRequest,
    TaskResponse,
    HouseholdTask,
    InboundMessage,
)


# ---------------------------------------------------------------------------
# Lifespan — compile the graph once on startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and compile the LangGraph graph on startup."""
    # Create database tables
    create_tables()
    
    # Compile the LangGraph graph once and store it in app state
    app.state.graph = create_graph()
    yield


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="PrettyLittleBabies CreAItion API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the frontend to talk to the backend during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok"}


@app.post("/whatsapp")
async def whatsapp_webhook(
    Body: str = Form(...),
    From: str = Form(...),
    To: str = Form(...),
    WaId: str = Form(None),
    ProfileName: str = Form(None),
    MessageSid: str = Form(None),
    AccountSid: str = Form(None),
    MediaContentType0: Optional[str] = Form(None),
    MediaUrl0: Optional[str] = Form(None)
):
    """
    Receive WhatsApp message from Twilio webhook and process it through LangGraph.
    Handles real Twilio webhook format with form data.
    """
    graph = app.state.graph
    
    # Initialize state with WhatsApp message data
    initial_state = AgentState(
        raw_message=Body,
        sender=From,
        child_name=ProfileName,
        messages=[]  # Start with empty message history
    )
    
    try:
        # Process the message through the LangGraph workflow
        result = await graph.ainvoke(initial_state)
        
        # Get the response message from the final state
        response_message = result.get("response_message", f"Thanks {ProfileName or 'there'}, I've got your message!")
        
        # Create TwiML response
        response = MessagingResponse()
        response.message(response_message)
        
        return PlainTextResponse(content=str(response), media_type="application/xml")
        
    except Exception as e:
        # Error handling - return a helpful message
        error_response = MessagingResponse()
        error_response.message(f"Sorry {ProfileName or 'there'}, I encountered an error processing your message: {str(e)}")
        return PlainTextResponse(content=str(error_response), media_type="application/xml")


@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(db: Session = Depends(get_db_session)):
    """
    Retrieve all household tasks - the "Household Jira" view.
    """
    try:
        # Query all tasks ordered by priority and creation date
        tasks = db.query(HouseholdTask).order_by(
            HouseholdTask.clash_alert.desc(),
            HouseholdTask.priority.desc(),
            HouseholdTask.created_at.desc()
        ).all()
        
        # Convert to response format
        task_responses = []
        for task in tasks:
            # Parse items_list from JSON if present
            items = None
            if task.items_list:
                import json
                try:
                    items = json.loads(task.items_list)
                except json.JSONDecodeError:
                    items = [task.items_list]  # Fallback if not valid JSON
            
            task_responses.append(TaskResponse(
                id=task.id,
                title=task.title,
                category=task.category,
                priority=task.priority,
                due_date=task.due_date,
                status=task.status,
                items_list=items,
                clash_alert=task.clash_alert,
                created_at=task.created_at
            ))
        
        return task_responses
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve tasks: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )
