# 🍼 PrettyLittleBabies CreAItion — Setup Guide

Welcome! Follow these steps to get the app running on your machine.

---

## ✅ Prerequisites

Make sure you have the following installed before you begin:

| Tool | Version | Install Link |
|------|---------|--------------|
| **Python** | 3.12 or higher | https://www.python.org/downloads/ |
| **uv** (Python package manager) | latest | https://docs.astral.sh/uv/getting-started/installation/ |
| **Git** | any | https://git-scm.com/downloads |

### Quick check — run these in your terminal:
```bash
python --version     # Should say Python 3.12.x or higher
uv --version         # Should say uv x.x.x
git --version        # Should say git version x.x.x
```

---

## 1. Clone the Repository

```bash
git clone <paste-the-repo-url-here>
cd PrettyLittleBabies_CreAItion
```

> Ask Adi for the repository URL (or the GitHub/GitLab link).

---

## 2. Get a Groq API Key

The backend uses the **Groq** API to run the AI model.

1. Go to [https://console.groq.com](https://console.groq.com) and create a free account.
2. Navigate to **API Keys** and click **Create API Key**.
3. Copy the key — you'll need it in the next step.

---

## 3. Set Up the Backend

### 3a. Create your environment file

```bash
cd backend
cp .env.example .env
```

Now open the `.env` file in any text editor and replace `your-groq-api-key-here` with the key you copied:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The rest of the values can stay as-is for local development.

### 3b. Install dependencies

```bash
uv sync
```

This will automatically create a `.venv` virtual environment and install all required packages. It may take a minute the first time.

### 3c. Run the backend server

```bash
uv run python main.py
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 3d. Verify it's working

Open your browser and go to:  
👉 **http://localhost:8000/health**

You should see: `{"status": "ok"}`

You can also explore the interactive API docs at:  
👉 **http://localhost:8000/docs**

---

## 4. Stopping the Server

Press `CTRL + C` in the terminal where the server is running.

---

## 🛠 Troubleshooting

| Problem | Fix |
|---------|-----|
| `python --version` shows Python 2.x or < 3.12 | Install Python 3.12+ and try again |
| `uv: command not found` | Install `uv` from https://docs.astral.sh/uv/getting-started/installation/ |
| `uv sync` fails | Make sure you're inside the `backend/` folder |
| Server starts but crashes immediately | Check your `.env` file — make sure `GROQ_API_KEY` is set correctly |
| Port 8000 already in use | Change `PORT=8001` in your `.env` file, then restart |

---

## 📁 Project Structure (for reference)

```
PrettyLittleBabies_CreAItion/
└── backend/
    ├── main.py          # FastAPI app entry point
    ├── graph.py         # LangGraph definition
    ├── state.py         # Request/response models
    ├── config.py        # App configuration (reads from .env)
    ├── agents/          # AI agent definitions
    ├── pyproject.toml   # Python dependencies
    ├── .env.example     # Template for environment variables
    └── .env             # Your local config (DO NOT share this)
```

---

> **Note:** Never share your `.env` file — it contains your private API key.
