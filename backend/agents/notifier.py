"""Notifier agent — formats responses for Twilio / TwiML."""


def format_twiml_response(message: str) -> str:
    """
    Wrap a plain-text message in TwiML XML so Twilio can deliver it
    back to the user's WhatsApp.
    """
    # Escape basic XML entities
    safe = (
        message
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        "<Response>"
        f"<Message>{safe}</Message>"
        "</Response>"
    )
