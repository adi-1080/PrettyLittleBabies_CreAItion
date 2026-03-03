"""
LangGraph WhatsApp processing workflow for Evaa MVP.

Topology:
                     ┌────────────────┐
    [START] ──────►  │  ingest_input  │
                     └───────┬────────┘
                             │
                             ▼
                     ┌────────────────┐
                     │ analyze_context │
                     └───────┬────────┘
                             │
                             ▼
                     ┌────────────────┐
                     │  sync_to_jira  │
                     └───────┬────────┘
                             │
                             ▼
                     ┌────────────────┐
                     │generate_response│
                     └───────┬────────┘
                             │
                             ▼
                           [END]

Each node processes WhatsApp messages to extract and organize household tasks.
"""

import json
from datetime import datetime, timedelta
from typing import Dict, Any

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import END, StateGraph

from config import get_llm, get_db_session
from state import (
    AgentState,
    InboundMessage,
    HouseholdTask,
    TaskExtraction,
)


# ---------------------------------------------------------------------------
# Node 1: ingest_input - Save raw WhatsApp message to database
# ---------------------------------------------------------------------------

async def ingest_input_node(state: AgentState) -> Dict[str, Any]:
    """
    Save the raw WhatsApp message to the database for logging.
    """
    session = get_db_session()
    
    try:
        # Create inbound message record
        inbound_msg = InboundMessage(
            sender=state.sender,
            raw_body=state.raw_message,
            timestamp=datetime.utcnow(),
            processed=False
        )
        
        session.add(inbound_msg)
        session.commit()
        
        return {
            "messages": [
                AIMessage(
                    content=f"Message logged from {state.sender}: {state.raw_message}"
                )
            ]
        }
        
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Node 2: analyze_context - LLM extracts tasks using structured output
# ---------------------------------------------------------------------------

TASK_EXTRACTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """
You are a household task extraction AI for a working mother. Your job is to analyze WhatsApp messages
and extract actionable tasks with specific details.

Analyze the message and extract:
1. Task name (clear, descriptive)
2. Items needed (if any)
3. Category (School, Grocery, Work, Household, Other)
4. Urgency (1-5, where 5 is most urgent based on deadlines)
5. Due date mentioned (if any)
6. Clash alert (True if due "tomorrow" or "tonight")

Examples:
- "Need chart paper for project tomorrow" → School project, urgency 5, clash_alert True
- "We're out of milk" → Grocery, urgency 2, no specific due date
- "Annual Day practice Monday" → School, urgency 3, due_date "Monday"

Be thorough but only extract actual tasks, not casual conversation.
"""),
    ("human", "Message: {message}")
])

async def analyze_context_node(state: AgentState) -> Dict[str, Any]:
    """
    Use LLM to extract structured tasks from the WhatsApp message.
    """
    llm = get_llm()
    
    # Create the structured output LLM
    structured_llm = llm.with_structured_output(TaskExtraction)
    
    # Format the prompt
    prompt = TASK_EXTRACTION_PROMPT.format(message=state.raw_message)
    
    try:
        # Extract task information
        extracted_task = await structured_llm.ainvoke(prompt)
        
        return {
            "extracted_tasks": [extracted_task],
            "messages": [
                AIMessage(
                    content=f"Extracted task: {extracted_task.task_name} ({extracted_task.category.value})"
                )
            ]
        }
        
    except Exception as e:
        # If extraction fails, create a generic task
        fallback_task = TaskExtraction(
            task_name="Process message",
            category="Other",
            urgency=2,
            clash_alert=False
        )
        
        return {
            "extracted_tasks": [fallback_task],
            "messages": [
                AIMessage(
                    content=f"Could not extract specific tasks. Created general task. Error: {str(e)}"
                )
            ]
        }


# ---------------------------------------------------------------------------
# Node 3: sync_to_jira - Write extracted tasks to HouseholdTask table
# ---------------------------------------------------------------------------

def parse_due_date(due_date_str: str) -> datetime:
    """
    Parse relative due dates like "tomorrow", "Monday", etc. into actual datetime.
    """
    if not due_date_str:
        return None
        
    due_date_str = due_date_str.lower().strip()
    today = datetime.utcnow().date()
    
    if due_date_str == "tomorrow":
        return datetime.combine(today + timedelta(days=1), datetime.min.time())
    elif due_date_str == "tonight":
        return datetime.combine(today, datetime.max.time())
    elif due_date_str == "today":
        return datetime.combine(today, datetime.min.time())
    else:
        return None

async def sync_to_jira_node(state: AgentState) -> Dict[str, Any]:
    """
    Write the extracted tasks to the HouseholdTask database table.
    """
    session = get_db_session()
    
    try:
        tasks_created = []
        
        for task in state.extracted_tasks:
            # Parse the due date
            due_datetime = parse_due_date(task.due_date) if task.due_date else None
            
            # Create household task record
            household_task = HouseholdTask(
                title=task.task_name,
                category=task.category.value,
                priority=task.urgency,
                due_date=due_datetime,
                status="pending",
                items_list=json.dumps(task.items_list) if task.items_list else None,
                clash_alert=task.clash_alert,
                created_at=datetime.utcnow()
            )
            
            session.add(household_task)
            tasks_created.append(household_task)
        
        session.commit()
        
        return {
            "messages": [
                AIMessage(
                    content=f"Created {len(tasks_created)} task(s) in Household Jira"
                )
            ]
        }
        
    except Exception as e:
        session.rollback()
        return {
            "messages": [
                AIMessage(
                    content=f"Failed to save tasks: {str(e)}"
                )
            ]
        }
    finally:
        session.close()


# ---------------------------------------------------------------------------
# Node 4: generate_response - Create TwiML response for WhatsApp
# ---------------------------------------------------------------------------

async def generate_response_node(state: AgentState) -> Dict[str, Any]:
    """
    Generate a user-friendly response message for WhatsApp.
    """
    if not state.extracted_tasks:
        response = "🤔 I couldn't identify any specific tasks in your message. Can you provide more details?"
    else:
        tasks = state.extracted_tasks
        if len(tasks) == 1:
            task = tasks[0]
            
            # Build response based on task details
            response_parts = [f"✅ Logged: {task.category.value} - {task.task_name}"]
            
            if task.items_list:
                items_str = ", ".join(task.items_list)
                response_parts.append(f"📋 Items needed: {items_str}")
            
            if task.clash_alert:
                response_parts.append("🚨 URGENT: This needs immediate attention!")
            elif task.urgency >= 4:
                response_parts.append("⚡ High priority task")
            
            response = "\n".join(response_parts)
        else:
            response = f"✅ Logged {len(tasks)} tasks:\n"
            for i, task in enumerate(tasks, 1):
                response += f"{i}. {task.category.value}: {task.task_name}\n"
    
    return {
        "response_message": response,
        "messages": [
            AIMessage(content=response)
        ]
    }


# ---------------------------------------------------------------------------
# Graph construction
# ---------------------------------------------------------------------------

def create_graph() -> StateGraph:
    """Build and compile the WhatsApp processing LangGraph graph."""
    builder = StateGraph(AgentState)

    # --- Register nodes ---
    builder.add_node("ingest_input", ingest_input_node)
    builder.add_node("analyze_context", analyze_context_node)
    builder.add_node("sync_to_jira", sync_to_jira_node)
    builder.add_node("generate_response", generate_response_node)

    # --- Entry point ---
    builder.set_entry_point("ingest_input")

    # --- Sequential workflow ---
    builder.add_edge("ingest_input", "analyze_context")
    builder.add_edge("analyze_context", "sync_to_jira")
    builder.add_edge("sync_to_jira", "generate_response")
    builder.add_edge("generate_response", END)

    return builder.compile()
