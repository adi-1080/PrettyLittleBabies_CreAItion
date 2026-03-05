# Evaa

Evaa turns messy WhatsApp messages into organized, categorized household tasks. Send a voice-note-style dump like *"need chart paper for Ria's project tomorrow, also pick up milk and eggs, and schedule the pediatrician appointment"* and Evaa breaks it down into structured tasks with categories, urgency scores, deadlines, and a mental load rating.

## How it works

```
WhatsApp message → Twilio webhook → LangGraph pipeline → Structured tasks + response
```

The backend runs a three-node LangGraph pipeline:

1. **Parser** — Groq (Llama 3.3 70B) extracts tasks from raw text with category, urgency, due dates
2. **DB Writer** — saves each task to SQLite
3. **Responder** — builds a categorized summary with urgency flags and mental load score, sends it back via Twilio

The frontend is a React Native (Expo) mobile app that reads tasks from the API.

## Stack

| Layer | Tech |
|-------|------|
| LLM | Groq + Llama 3.3 70B |
| Orchestration | LangGraph |
| Backend | FastAPI, SQLAlchemy, SQLite |
| Messaging | Twilio WhatsApp API |
| Frontend | React Native (Expo) |
| Package manager | uv (backend), npm (frontend) |

## Project structure

```
├── backend/
│   ├── main.py           # FastAPI entry point, Twilio webhook, /tasks API
│   ├── graph.py           # LangGraph pipeline (parser → writer → responder)
│   ├── state.py           # Pydantic models, SQLAlchemy models, graph state
│   ├── config.py          # Settings from .env via pydantic-settings
│   └── agents/
│       ├── parser.py      # Groq LLM structured extraction
│       └── notifier.py    # TwiML response formatting
├── frontend/
│   └── src/
│       ├── screens/       # Auth and Main screens
│       ├── components/    # Reusable UI components
│       └── navigation/    # React Navigation setup
└── SETUP.md               # Step-by-step setup instructions
```

## Quick start

See [SETUP.md](SETUP.md) for detailed instructions. The short version:

```bash
cd backend
cp .env.example .env       # add your GROQ_API_KEY
uv sync
uv run python main.py      # runs on http://localhost:8000
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/whatsapp` | Twilio webhook — receives WhatsApp messages |
| GET | `/tasks` | Returns all structured tasks (newest first) |
| GET | `/docs` | Interactive Swagger docs |

## Environment variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key (required) |
| `MODEL_NAME` | LLM model name (default: `llama-3.3-70b-versatile`) |
| `MODEL_TEMPERATURE` | LLM temperature (default: `0.7`) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `HOST` | Server host (default: `0.0.0.0`) |
| `PORT` | Server port (default: `8000`) |
