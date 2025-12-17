import os
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.chat_models import ChatOllama

try:
    from langchain_groq import ChatGroq
except Exception:  # pragma: no cover
    ChatGroq = None


BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5024/api").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

app = FastAPI(title="DMS AI Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    language_hint: Optional[str] = Field(
        default=None,
        description="Optional: 'ar' or 'en'. If omitted, bot answers in the language of the user question.",
    )


class ChatResponse(BaseModel):
    answer: str
    sources: Dict[str, Any] = Field(default_factory=dict)


async def _get_json(path: str, params: Optional[Dict[str, Any]] = None) -> Any:
    url = f"{BACKEND_API_URL}{path}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, params=params)
        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Backend request failed: {resp.status_code} {url}")
        return resp.json()


def _build_system_prompt(language_hint: Optional[str]) -> str:
    lang_rule = (
        "Answer in Arabic if the user writes Arabic; answer in English if the user writes English. "
        "If the user mixes Arabic/English, answer bilingually (Arabic then English)."
    )
    if language_hint == "ar":
        lang_rule = "Answer in Arabic. If you include English, keep it short."
    elif language_hint == "en":
        lang_rule = "Answer in English. If you include Arabic, keep it short."

    return (
        "You are a helpful clinic assistant for a dental/medical clinic website. "
        "You must ONLY use the provided data sources. "
        "Never guess or invent clinic-specific facts (like treatment prices). "
        "If the user asks for prices, say prices are not available via chat and advise contacting the clinic. "
        "Do NOT ask for or reveal any sensitive personal data (patient names, phone numbers, medical notes, emails, addresses). "
        f"{lang_rule}"
    )


def _summarize_sources(
    treatments: Any, doctors: Any, payment_info: Any, faq: Any
) -> Dict[str, Any]:
    return {
        "treatmentsCount": len(treatments) if isinstance(treatments, list) else None,
        "doctorsCount": len(doctors) if isinstance(doctors, list) else None,
        "paymentMethods": payment_info.get("paymentMethods") if isinstance(payment_info, dict) else None,
        "faqCount": len(faq) if isinstance(faq, list) else None,
    }


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    try:
        # Safe public data only (no prices)
        treatments = await _get_json("/public/clinic/treatments")
        doctors = await _get_json("/public/clinic/doctors")
        payment_info = await _get_json("/public/clinic/payment-info")
        faq = await _get_json("/public/faq")

        system_prompt = _build_system_prompt(req.language_hint)

        context = {
            "treatments": treatments,
            "doctors": doctors,
            "paymentInfo": payment_info,
            "faq": faq,
        }

        if GROQ_API_KEY:
            if ChatGroq is None:
                raise HTTPException(
                    status_code=500,
                    detail="Groq is configured (GROQ_API_KEY set) but langchain-groq is not installed.",
                )
            llm = ChatGroq(api_key=GROQ_API_KEY, model=GROQ_MODEL, temperature=0.2)
        else:
            llm = ChatOllama(model=OLLAMA_MODEL, base_url=OLLAMA_BASE_URL, temperature=0.2)

        messages = [
            SystemMessage(content=system_prompt),
            SystemMessage(content=f"DATA_SOURCES_JSON: {context}"),
            HumanMessage(content=req.message),
        ]

        result = llm.invoke(messages)

        return ChatResponse(
            answer=getattr(result, "content", str(result)),
            sources=_summarize_sources(treatments, doctors, payment_info, faq),
        )

    except HTTPException:
        raise
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
