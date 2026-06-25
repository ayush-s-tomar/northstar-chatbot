# North Star Support Chatbot

Customer support chatbot for North Star — an outdoor apparel and camping gear store.

Built with **FastAPI + Groq (Llama 3.3 70B) + React**.

---

## Features

| Flow | Description |
|------|-------------|
| Order Tracking | Ask for order number → return simulated status |
| Returns & Exchanges | Explain 30-day policy + provide returns link |
| Product Recommendations | 1-2 clarifying questions → recommend category |
| Human Handoff | Detects frustration or explicit request → transfer to Live Agent |
| Fallback | Clear "I didn't understand" + offer options |

## Mock Orders

| Order # | Status |
|---------|--------|
| #111 | Shipped, arriving tomorrow |
| #222 | Processing, ships in 24 hours |
| #333 | Delivered (bot asks follow-up) |
| Any other | Invalid — not found |

---

## Setup

### 1. Backend

```bash
cd backend
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your Groq API key to .env
# Get free key at: console.groq.com

# Run server
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

### 3. Environment Variables

Backend `.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

Frontend `.env` (optional, defaults to localhost:8000):
```
REACT_APP_API_URL=http://localhost:8000
```

---

## Project Structure

```
northstar-chatbot/
├── backend/
│   ├── main.py           # FastAPI app with all 4 chat flows
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.js        # React chat UI
    │   └── index.js
    └── public/
        └── index.html
```

---

## Tech Stack

- **Backend:** FastAPI, Groq API (Llama 3.3 70B), Python
- **Frontend:** React 18, plain CSS-in-JS (no external UI libraries)
- **AI:** Groq's free tier — fast inference, no cost

---

## Demo Script (for 2-3 min video)

1. **Order Tracking** — Type "Where is my order?" → give #111 → see Shipped status
2. **Order Tracking #333** — Give #333 → see Delivered + follow-up question
3. **Returns** — Type "I want to return something" → see policy + link
4. **Product Recs** — Type "Help me find gear" → answer questions → see recommendation
5. **Human Handoff** — Type "This is ridiculous, I want a real person" → see Live Agent transfer
6. **Fallback** — Type random text → see fallback + options offered
