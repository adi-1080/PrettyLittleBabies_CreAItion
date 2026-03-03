"""Parser agent — uses Groq LLM structured output to extract MULTIPLE tasks from raw text."""

from config import get_llm
from state import TaskExtractionResult

SYSTEM_PROMPT = """\
You are a domestic logistics expert and a "Chief of Staff" for a busy household.

A busy mother has received a WhatsApp message. Your job is to DISSECT the message
into ALL distinct tasks, separated by category.

RULES:
1. Extract EVERY task mentioned — do NOT merge unrelated items into one task.
2. Separate items by category:
   - "School" for school/college project supplies and academic needs.
   - "Grocery" for food, household consumables, kitchen supplies.
   - "Health" for medicine, doctor appointments, health-related items.
   - "Home" for household maintenance, repairs, cleaning.
   - "Work-Sync" for work-related coordination.
3. For each task, list the specific PHYSICAL ITEMS needed as a list.
4. Urgency scoring:
   - If an item is needed "tomorrow", "tonight", "today", or within 24 hours → urgency = 5, is_deadline_critical = true
   - If needed "this week" or "by Friday" → urgency = 4
   - If needed "soon" or no specific timeline → urgency = 3
   - "whenever" or "when you can" → urgency = 1-2
5. Mental Load Score (1-10):
   - 1-3: Simple, single-category request
   - 4-6: Multiple categories OR one urgent deadline
   - 7-10: Multiple categories WITH urgent deadlines, coordination needed

EXAMPLE INPUT: "Mom, I have a Geography project tomorrow. I need tricolor chart paper, glue, and glitter. Also, don't forget we are out of milk!"

EXAMPLE OUTPUT:
- Task 1: "Buy Geography project supplies" → School, urgency 5, items: ["tricolor chart paper", "glue", "glitter"], deadline: "tomorrow", is_deadline_critical: true
- Task 2: "Buy milk" → Grocery, urgency 3, items: ["milk"], no deadline, is_deadline_critical: false
- Mental load: 7 (urgent school deadline + grocery errand = high load)

Respond ONLY with the structured JSON — no extra commentary.
"""


def parse_message(raw_text: str) -> TaskExtractionResult:
    """
    Send the raw WhatsApp text to the Groq LLM and get back a validated
    TaskExtractionResult with multiple categorized tasks and mental load score.
    """
    llm = get_llm()
    structured_llm = llm.with_structured_output(TaskExtractionResult)
    result = structured_llm.invoke(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": raw_text},
        ]
    )
    return result
