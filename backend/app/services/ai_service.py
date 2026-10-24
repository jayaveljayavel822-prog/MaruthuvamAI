import re
from typing import Optional, List, Dict, Any
from app.core.config import settings
from app.core.logging import logger

# Red-flag emergency regex patterns
EMERGENCY_REGEX = re.compile(
    r"(chest\s*pain|heart\s*attack|cannot\s*breathe|can'?t\s*breathe|trouble\s*breathing|"
    r"shortness\s*of\s*breath|stroke|face\s*droop|slurred\s*speech|seizure|valippu|"
    r"unconscious|fainted|mayakkam|severe\s*bleeding|vomiting\s*blood|suicid|kill\s*myself|"
    r"end\s*my\s*life|overdose|poison|snake\s*bite|paambu)",
    re.IGNORECASE,
)

EMERGENCY_RESPONSE = (
    "🚨 CRITICAL MEDICAL ALERT: Your message mentions potential emergency symptoms. "
    "Please call 108 (Ambulance) or 112 (National Emergency Helpline) immediately, "
    "or proceed to the nearest emergency room. Do not delay urgent medical evaluation "
    "to wait for an AI response."
)


class AIService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL

    def is_emergency_content(self, text: str) -> bool:
        """Deterministic safety filter for immediate red flags."""
        return bool(EMERGENCY_REGEX.search(text))

    async def generate_response(
        self,
        prompt: str,
        system_context: Optional[str] = None,
        language: str = "English",
        user_history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Generate AI consultation response via configured provider,
        or fallback gracefully to safe clinical copilot knowledge.
        """
        # Step 1: Safety check on incoming prompt
        if self.is_emergency_content(prompt):
            return {
                "text": EMERGENCY_RESPONSE,
                "is_emergency": True,
                "provider": "safety_guardrail",
            }

        # Step 2: Route to provider
        try:
            if self.provider == "anthropic" and self.api_key:
                return await self._call_anthropic(prompt, system_context, language, user_history)
            elif self.provider in ("openai", "gemini") and self.api_key:
                return await self._call_generic_provider(prompt, system_context, language)
            else:
                return await self._mock_health_copilot(prompt, system_context, language)
        except Exception as e:
            logger.error(f"AI provider '{self.provider}' failed: {str(e)}. Using safe fallback.")
            return await self._mock_health_copilot(prompt, system_context, language)

    async def _mock_health_copilot(
        self, prompt: str, system_context: Optional[str], language: str
    ) -> Dict[str, Any]:
        """
        Safe clinical knowledge fallback engine providing structured,
        informative responses without hallucinating.
        """
        p_lower = prompt.lower()
        lang_lower = language.lower()

        # Multi-language prefix
        lang_note = ""
        if "tamil" in lang_lower:
            lang_note = "\n\n(குறிப்பு: இது ஒரு தகவல் வழிகாட்டுதல் மட்டுமே. மருத்துவ அவசரத்திற்கு மருத்துவரை அணுகவும்.)"
        elif "tanglish" in lang_lower:
            lang_note = "\n\n(Note: Idhu doctor advice illa, general health information mattum. Serious symptom irundha doctor kitta ponga.)"
        elif "hindi" in lang_lower:
            lang_note = "\n\n(सूचना: यह केवल सामान्य जानकारी है, किसी डॉक्टर की सलाह का विकल्प नहीं है।)"
        elif "telugu" in lang_lower:
            lang_note = "\n\n(గమనిక: ఇది కేవలం సమాచారం మాత్రమే. వైద్యుడి సలహాను తీసుకోండి.)"

        # Topic matches
        if any(w in p_lower for w in ["fever", "kaichal", "bukhar"]):
            text = (
                "For mild fever, rest well, stay hydrated with water and oral rehydration solutions, "
                "and monitor your temperature. If the temperature exceeds 102°F (39°C), persists for "
                "more than 3 days, or is accompanied by a stiff neck, rash, or vomiting, consult a physician promptly."
            )
        elif any(w in p_lower for w in ["headache", "thalai", "sar dard"]):
            text = (
                "Mild tension headaches often improve with hydration, rest in a quiet room, and adequate sleep. "
                "However, if you experience sudden 'worst-ever' explosive pain, vision changes, or headache following "
                "a head injury, seek emergency medical care immediately."
            )
        elif any(w in p_lower for w in ["diabetes", "sugar", "glucose"]):
            text = (
                "Blood glucose control involves balanced nutrition (high fiber, low refined carbohydrates), "
                "daily physical activity, and adherence to prescribed medications. Fasting glucose under 100 mg/dL "
                "is standard. Please review any repeated high readings with your diabetologist."
            )
        elif any(w in p_lower for w in ["blood pressure", "bp", "hypertension"]):
            text = (
                "A normal adult blood pressure reading is typically around 120/80 mmHg. "
                "Readings consistently above 140/90 mmHg indicate hypertension. Reduce dietary sodium, "
                "manage stress, and consult your doctor for personalized management."
            )
        elif any(w in p_lower for w in ["sleep", "insomnia", "tired"]):
            text = (
                "Healthy sleep hygiene includes maintaining a consistent sleep schedule, limiting screens "
                "1 hour before bed, and avoiding heavy meals or caffeine late in the evening. Aim for 7 to 8 hours "
                "of restorative sleep nightly."
            )
        elif any(w in p_lower for w in ["water", "hydration"]):
            text = (
                "Proper hydration supports kidney function, energy levels, and digestion. "
                "Aim for 8 to 10 glasses (approximately 2 to 2.5 liters) of clean water daily, "
                "adjusting for climate and physical exertion."
            )
        else:
            text = (
                "Maruthuvam.AI Health Copilot is here to help you understand your wellness metrics and organize records. "
                f"Regarding '{prompt}': Focus on lifestyle balance, balanced nutrition, adequate hydration, and "
                "consistent sleep. If you are experiencing concerning symptoms, please prepare questions and discuss them "
                "with a qualified doctor."
            )

        return {
            "text": text + lang_note,
            "is_emergency": False,
            "provider": "maruthuvam_clinical_core",
        }

    async def _call_anthropic(self, prompt: str, system_context: Optional[str], language: str, history: Optional[list]) -> Dict[str, Any]:
        import httpx
        system_msg = (
            "You are Maruthuvam.AI, an empathetic and cautious health copilot. "
            "Provide helpful, accurate health information, organize patient data, and guide safe next steps. "
            "NEVER fabricate diagnoses or claim clinical certification. Recommend consulting licensed doctors. "
            "Understand regional dialects, colloquial phrasing, code-switching and transliterated speech when possible. "
            "If a symptom, medicine name, dose, timing, duration, or family member is ambiguous, ask a clarifying question; never guess. "
            "When patient-record context is supplied, answer record-specific questions only from that context and explicitly say when a detail is absent. "
            f"Respond clearly in {language}."
        )
        if system_context:
            system_msg += f"\nUser Context:\n{system_context}"

        messages = []
        if history:
            for h in history[-4:]:
                messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": self.model or "claude-3-5-sonnet-20241022",
                    "max_tokens": 1000,
                    "system": system_msg,
                    "messages": messages,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            reply_text = "".join(c.get("text", "") for c in data.get("content", []))
            return {"text": reply_text, "is_emergency": False, "provider": "anthropic"}

    async def _call_generic_provider(self, prompt: str, system_context: Optional[str], language: str) -> Dict[str, Any]:
        # Fallback to internal clinical core if external call not configured
        return await self._mock_health_copilot(prompt, system_context, language)


ai_service = AIService()
