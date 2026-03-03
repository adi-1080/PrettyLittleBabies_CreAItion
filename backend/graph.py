"""
LangGraph graph definition for Evaa MVP.

Single pipeline: groq_parser → db_writer → responder
"""

import json
import logging

from langgraph.graph import END, StateGraph

from agents.parser import parse_message
from state import (
    HomeOpsState,
    InboundMessage,
    SessionLocal,
    StructuredTask,
)

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════
# NODE 1: groq_parser — parse the raw message into structured tasks
# ═══════════════════════════════════════════════════════════════════════════

def groq_parser(state: HomeOpsState) -> dict:
    """
    Save the raw WhatsApp message to InboundMessages, then call the Groq LLM
    to extract structured tasks.
    """
    # Save raw message to DB
    db = SessionLocal()
    message_id = None
    try:
        msg = InboundMessage(
            sender_phone=state["sender"],
            raw_text=state["raw_input"],
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        message_id = msg.id
        logger.info("Ingested message id=%s from %s", msg.id, msg.sender_phone)
    except Exception as exc:
        db.rollback()
        logger.error("Ingest failed: %s", exc)
        return {
            "status": "error",
            "response_message": f"Failed to save message: {exc}",
        }
    finally:
        db.close()

    # Parse with Groq LLM
    try:
        extraction = parse_message(state["raw_input"])
        logger.info(
            "Parsed %d tasks, mental load: %d",
            len(extraction.tasks),
            extraction.mental_load_score,
        )
        return {
            "extracted_data": extraction,
            "message_id": message_id,
            "status": "parsed",
        }
    except Exception as exc:
        logger.error("Groq parser failed: %s", exc)
        return {
            "message_id": message_id,
            "status": "error",
            "response_message": f"Could not understand the message: {exc}",
        }


# ═══════════════════════════════════════════════════════════════════════════
# NODE 2: db_writer — save each extracted task to the database
# ═══════════════════════════════════════════════════════════════════════════

def db_writer(state: HomeOpsState) -> dict:
    """
    Take the TaskExtractionResult from Groq and save each task to the
    StructuredTask table. Mark the InboundMessage as processed.
    """
    if state.get("status") == "error":
        return {}

    extraction = state.get("extracted_data")
    if extraction is None:
        return {
            "status": "error",
            "response_message": "No data extracted from message.",
        }

    db = SessionLocal()
    try:
        saved_tasks = []
        for task in extraction.tasks:
            db_task = StructuredTask(
                title=task.name,
                items_list=json.dumps(task.items),
                category=task.category,
                urgency=task.urgency,
                due_date=task.due_date,
                is_deadline_critical=task.is_deadline_critical,
                mental_load_score=extraction.mental_load_score,
            )
            db.add(db_task)
            saved_tasks.append(db_task)

        # Mark inbound message as processed
        msg_id = state.get("message_id")
        if msg_id:
            inbound = db.query(InboundMessage).filter_by(id=msg_id).first()
            if inbound:
                inbound.processed = True

        db.commit()

        # Refresh to get IDs
        for t in saved_tasks:
            db.refresh(t)

        logger.info("Saved %d tasks to database", len(saved_tasks))
        return {"status": "saved"}

    except Exception as exc:
        db.rollback()
        logger.error("DB writer failed: %s", exc)
        return {"status": "error", "response_message": f"Save error: {exc}"}
    finally:
        db.close()


# ═══════════════════════════════════════════════════════════════════════════
# NODE 3: responder — build a human-readable TwiML-ready response
# ═══════════════════════════════════════════════════════════════════════════

def responder(state: HomeOpsState) -> dict:
    """
    Generate a friendly, categorized response confirming what was extracted
    and flagging urgent items + mental load.
    """
    if state.get("status") == "error":
        return {}

    extraction = state.get("extracted_data")
    if extraction is None:
        return {
            "status": "error",
            "response_message": "Nothing to respond about.",
        }

    # Group tasks by category
    by_category: dict[str, list] = {}
    urgent_items: list[str] = []

    for task in extraction.tasks:
        cat = task.category
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(task)

        if task.is_deadline_critical:
            urgent_items.extend(task.items)

    # Build response
    lines = ["✅ Got it! Here's what I've organized:\n"]

    for category, tasks in by_category.items():
        emoji = {
            "School": "📚",
            "Grocery": "🛒",
            "Health": "💊",
            "Home": "🏠",
            "Work-Sync": "💼",
        }.get(category, "📋")

        all_items = []
        deadline_info = None
        for task in tasks:
            all_items.extend(task.items)
            if task.due_date:
                deadline_info = task.due_date

        items_str = ", ".join(all_items)
        line = f"{emoji} {category}: {items_str}"
        if deadline_info:
            line += f" (Deadline: {deadline_info})"
        lines.append(line)

    # Flag urgent items
    if urgent_items:
        lines.append(f"\n🔥 URGENT: {', '.join(urgent_items)} flagged as deadline-critical!")

    # Mental load alert
    load = extraction.mental_load_score
    if load >= 7:
        lines.append(f"\n⚠️ Mental Load: HIGH ({load}/10) — {extraction.mental_load_reason}")
    elif load >= 4:
        lines.append(f"\n🧠 Mental Load: MODERATE ({load}/10) — {extraction.mental_load_reason}")
    else:
        lines.append(f"\n🧠 Mental Load: LOW ({load}/10)")

    response_text = "\n".join(lines)
    status = "pending_notification" if load >= 7 else "success"

    return {"status": status, "response_message": response_text}


# ═══════════════════════════════════════════════════════════════════════════
# GRAPH ASSEMBLY
# ═══════════════════════════════════════════════════════════════════════════

def create_homeops_graph():
    """Build and compile the Evaa HomeOps LangGraph (parser → writer → responder)."""
    builder = StateGraph(HomeOpsState)

    builder.add_node("groq_parser", groq_parser)
    builder.add_node("db_writer", db_writer)
    builder.add_node("responder", responder)

    builder.set_entry_point("groq_parser")
    builder.add_edge("groq_parser", "db_writer")
    builder.add_edge("db_writer", "responder")
    builder.add_edge("responder", END)

    return builder.compile()
