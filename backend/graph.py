"""
LangGraph multi-agent graph definition.

Topology:
                     ┌────────────────┐
    [START] ──────►  │   supervisor   │
                     └───────┬────────┘
                             │ routes to one of ↓
               ┌─────────────┴─────────────┐
               ▼                           ▼
        ┌─────────────┐           ┌────────────────┐
        │   chatbot   │           │  dummy_agent   │
        └──────┬──────┘           └───────┬────────┘
               └─────────────┬────────────┘
                             ▼
                           [END]

Adding a new agent
------------------
1. Create   agents/<name>_agent.py  with an async node function
2. Export   it in agents/__init__.py
3. Add      graph_builder.add_node("<name>", <name>_agent_node)
4. Update   route_to_agent() to route to it
"""

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import END, StateGraph

from agents import dummy_agent_node
from config import get_llm
from state import AgentState


# ---------------------------------------------------------------------------
# Supervisor node — decides which agent should handle the request
# ---------------------------------------------------------------------------

def route_to_agent(state: AgentState) -> str:
    """
    Routing logic — inspects the last human message and returns the name
    of the next node to execute.

    Current rules (expand as needed):
      • message contains "dummy" → dummy_agent
      • everything else          → chatbot
    """
    last_human = next(
        (m.content for m in reversed(state.messages) if m.type == "human"),
        "",
    ).lower()

    if "dummy" in last_human:
        return "dummy_agent"
    return "chatbot"


async def supervisor_node(state: AgentState) -> dict:
    """
    Supervisor placeholder — currently just passes state through.
    You can add meta-reasoning or memory here later.
    """
    return {}


# ---------------------------------------------------------------------------
# Chatbot node — the primary LLM agent
# ---------------------------------------------------------------------------

async def chatbot_node(state: AgentState) -> dict:
    """Calls the LLM with the full conversation history."""
    llm = get_llm()
    response = await llm.ainvoke(state.messages)
    return {"messages": [response]}


# ---------------------------------------------------------------------------
# Graph construction
# ---------------------------------------------------------------------------

def create_graph() -> StateGraph:
    """Build and compile the multi-agent LangGraph graph."""
    builder = StateGraph(AgentState)

    # --- Register nodes ---
    builder.add_node("supervisor", supervisor_node)
    builder.add_node("chatbot", chatbot_node)
    builder.add_node("dummy_agent", dummy_agent_node)

    # --- Entry point ---
    builder.set_entry_point("supervisor")

    # --- Conditional routing from supervisor ---
    builder.add_conditional_edges(
        "supervisor",
        route_to_agent,
        {
            "chatbot": "chatbot",
            "dummy_agent": "dummy_agent",
        },
    )

    # --- All agents terminate after responding ---
    builder.add_edge("chatbot", END)
    builder.add_edge("dummy_agent", END)

    return builder.compile()
