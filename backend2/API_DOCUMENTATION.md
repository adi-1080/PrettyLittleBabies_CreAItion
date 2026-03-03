# Evaa MVP API Documentation - Postman Testing Guide

## Overview
The Evaa MVP API provides WhatsApp-powered household task management for working mothers. It processes incoming WhatsApp messages, extracts actionable tasks using AI, and organizes them into a "Household Jira" system.

## Base URL
```
http://localhost:8000
```

## Authentication
No authentication required for local development.

---

## 1. Health Check Endpoint

### GET /health
**Purpose:** Verify the API server is running correctly.

**Request:**
```http
GET /health
```

**Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

**Postman Setup:**
1. Method: GET
2. URL: `http://localhost:8000/health`
3. Click "Send"

---

## 2. WhatsApp Webhook Endpoint

### POST /whatsapp
**Purpose:** Receive WhatsApp messages from Twilio and process them through the AI workflow.

**Request:**
```http
POST /whatsapp
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "Body": "Hey Mom, just found out my Science project on Volcanoes is due tomorrow. I need baking soda, vinegar, and red food coloring. Also, can you print the labels?",
  "From": "+1234567890"
}
```

**Response (200 OK):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>✅ Logged: School - Science Project Volcano
📋 Items needed: baking soda, vinegar, red food coloring, printed labels
🚨 URGENT: This needs immediate attention!</Message>
</Response>
```

**Test Scenarios:**

### Scenario 1: Kids' Project Test (High Priority)
```json
{
  "Body": "Mom, I need chart paper, glue, and glitters for my Geography project by tomorrow morning!",
  "From": "+1234567890"
}
```

**Expected Response:** Task with urgency 5, clash_alert true, School category

### Scenario 2: Grocery Request (Medium Priority)
```json
{
  "Body": "We're out of milk and bread. Can you get some from the store?",
  "From": "+1234567890"
}
```

**Expected Response:** Task with urgency 2-3, Grocery category

### Scenario 3: School Notice (Medium Priority)
```json
{
  "Body": "Annual Day practice starts Monday. Students must bring a white t-shirt.",
  "From": "+1234567890"
}
```

**Expected Response:** Task with urgency 3, School category, due_date "Monday"

### Scenario 4: Work-related Task (Low Priority)
```json
{
  "Body": "Don't forget about your 9 AM meeting tomorrow with the client",
  "From": "+1234567890"
}
```

**Expected Response:** Task with urgency 4, Work category, clash_alert true

### Scenario 5: Multiple Tasks
```json
{
  "Body": "Need to buy groceries today and also remember that science project is due tomorrow with baking soda and vinegar",
  "From": "+1234567890"
}
```

**Expected Response:** Multiple tasks extracted

**Postman Setup:**
1. Method: POST
2. URL: `http://localhost:8000/whatsapp`
3. Headers: `Content-Type: application/json`
4. Body: Select "raw" and "JSON"
5. Paste one of the test scenarios above
6. Click "Send"

---

## 3. Tasks Management Endpoint

### GET /tasks
**Purpose:** Retrieve all household tasks - the "Household Jira" view.

**Request:**
```http
GET /tasks
```

**Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Science Project Volcano",
    "category": "School",
    "priority": 5,
    "due_date": "2026-03-05T00:00:00Z",
    "status": "pending",
    "items_list": ["baking soda", "vinegar", "red food coloring", "printed labels"],
    "clash_alert": true,
    "created_at": "2026-03-04T12:00:00Z"
  },
  {
    "id": 2,
    "title": "Buy groceries",
    "category": "Grocery",
    "priority": 3,
    "due_date": null,
    "status": "pending",
    "items_list": ["milk", "bread"],
    "clash_alert": false,
    "created_at": "2026-03-04T11:30:00Z"
  }
]
```

**Postman Setup:**
1. Method: GET
2. URL: `http://localhost:8000/tasks`
3. Click "Send"

---

## Complete Testing Workflow

### Step 1: Start the Server
```bash
cd /home/adi/Desktop/wsevaa/PrettyLittleBabies_CreAItion/backend
uv run python main.py
```

### Step 2: Health Check
Test GET `/health` to verify server is running

### Step 3: Send WhatsApp Messages
Test POST `/whatsapp` with different scenarios and verify TwiML responses

### Step 4: View Household Jira
Test GET `/tasks` to see all created tasks

---

## Postman Collection JSON

```json
{
  "info": {
    "name": "Evaa MVP API",
    "description": "WhatsApp-powered household task management API"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "WhatsApp Webhook",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"Body\": \"Hey Mom, just found out my Science project on Volcanoes is due tomorrow. I need baking soda, vinegar, and red food coloring. Also, can you print the labels?\",\n  \"From\": \"+1234567890\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/whatsapp",
          "host": ["{{baseUrl}}"],
          "path": ["whatsapp"]
        }
      }
    },
    {
      "name": "Get Tasks",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/tasks",
          "host": ["{{baseUrl}}"],
          "path": ["tasks"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000"
    }
  ]
}
```

Import this JSON into Postman as a collection for easy testing!
