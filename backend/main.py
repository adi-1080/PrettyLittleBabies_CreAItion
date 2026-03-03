"""FastAPI application entry-point."""

from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage

from config import settings
from graph import create_graph
from state import ChatRequest, ChatResponse


# ---------------------------------------------------------------------------
# Lifespan — compile the graph once on startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Compile the LangGraph graph once and store it in app state."""
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


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the LangGraph agent and get a response.
    """
    graph = app.state.graph

    result = await graph.ainvoke(
        {"messages": [HumanMessage(content=request.message)]}
    )

    # The last message in state is the AI response
    ai_message = result["messages"][-1]
    return ChatResponse(response=ai_message.content)


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
