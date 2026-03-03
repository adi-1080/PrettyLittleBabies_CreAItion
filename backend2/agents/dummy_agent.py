"""
Dummy Agent — placeholder for a real specialised agent.

Drop-in pattern for every new agent you add:
  1. Create  agents/<name>_agent.py
  2. Define  async def <name>_agent_node(state: AgentState) -> dict
  3. Export it in agents/__init__.py
  4. Register it as a node in graph.py
"""

from langchain_core.messages import AIMessage

from state import AgentState


async def dummy_agent_node(state: AgentState) -> dict:
    """
    Dummy agent — echoes back a canned response.
    Replace this body with real LLM / tool calls when you're ready.
    """
    last_human = next(
        (m.content for m in reversed(state.messages) if m.type == "human"),
        "something",
    )

    reply = AIMessage(
        content=(
            f"[DummyAgent] 👋 I received your message: '{last_human}'. "
            "I'm a placeholder — swap me out with a real agent!"
        )
    )
    return {"messages": [reply]}
