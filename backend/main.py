from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
import re
from dotenv import load_dotenv
load_dotenv()
app = FastAPI(title="North Star Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Mock order data — exactly as specified in brief
ORDERS = {
    "111": {
        "status": "Shipped",
        "detail": "Your order is on its way and arriving tomorrow!"
    },
    "222": {
        "status": "Processing",
        "detail": "Your order is currently being processed and will ship within 24 hours."
    },
    "333": {
        "status": "Delivered",
        "detail": "Your order has been delivered! Did everything arrive in good condition? If there's an issue, I can help with a return or exchange."
    },
}

SYSTEM_PROMPT = """You are Stella, the friendly customer support assistant for North Star — an outdoor apparel and camping gear store serving North American outdoor enthusiasts.

Your tone is warm, helpful, outdoorsy, and concise. Never use markdown formatting — plain text only.

You handle exactly 4 things:

1. ORDER TRACKING
   - Ask the customer for their order number if they haven't given one.
   - Order #111: Shipped, arriving tomorrow.
   - Order #222: Processing, ships within 24 hours.
   - Order #333: Delivered — ask a follow-up: "Did everything arrive in good condition? If there's an issue I can help with a return or exchange."
   - Any other order number: "I wasn't able to find that order number. Please double-check and try again, or I can connect you with our team."

2. RETURNS & EXCHANGES
   - Policy: 30-day returns for unused items in original packaging.
   - Shipping options: Standard (3-5 days) or Expedited (1-2 days).
   - Returns link: northstargear.com/returns
   - After explaining, ask: "Is there anything else I can help you with?"

3. PRODUCT RECOMMENDATIONS
   - Ask 1-2 clarifying questions before recommending (e.g., "What activity are you gearing up for?" and "Are you a beginner or experienced?")
   - Then recommend one of these categories: Footwear, Backpacks, Tents & Shelter, Clothing & Layering, Navigation & Safety.
   - Keep recommendation concise with a brief reason.

4. HUMAN HANDOFF
   - Trigger when: customer is frustrated, says "unacceptable", "ridiculous", "speak to a person", "real agent", "manager", "human", or similar.
   - Always respond with exactly: "I'm connecting you with a live agent now. Please hold — a North Star team member will be with you shortly. 🟢 [Transferring to Live Agent...]"

FALLBACK (anything else):
Say: "I didn't quite catch that — I can help with order tracking, returns & exchanges, product recommendations, or connect you with our team. What do you need?"

After resolving any issue, always offer: "Is there anything else I can help you with today?"
"""

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

class ChatResponse(BaseModel):
    reply: str

def get_order_context(messages: list[Message]) -> str:
    for m in reversed(messages):
        if m.role == "user":
            match = re.search(r'#?(\d{3,})', m.content)
            if match:
                order_num = match.group(1)
                if order_num in ORDERS:
                    o = ORDERS[order_num]
                    return f"\n\n[ORDER DATA: Order #{order_num} — Status: {o['status']}. Use this in your reply: {o['detail']}]"
                else:
                    return f"\n\n[ORDER DATA: Order #{order_num} — NOT FOUND in system.]"
    return ""

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    order_context = get_order_context(req.messages)

    messages_for_llm = [
        {"role": "system", "content": SYSTEM_PROMPT + order_context}
    ] + [{"role": m.role, "content": m.content} for m in req.messages]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages_for_llm,
        max_tokens=300,
        temperature=0.6,
    )

    reply = response.choices[0].message.content.strip()
    return ChatResponse(reply=reply)

@app.get("/health")
def health():
    return {"status": "ok", "service": "North Star Chatbot"}
