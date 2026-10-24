from typing import List, Optional
from pydantic import BaseModel, Field


class TriageAssessIn(BaseModel):
    symptom_text: Optional[str] = ""
    selected_symptom_ids: List[int] = Field(default_factory=list)
    severity: str = Field("mild", pattern="^(mild|mod|severe)$")
    is_worsening_quickly: bool = False
    context_notes: Optional[str] = None
    language: Optional[str] = "English"


class EmergencyContact(BaseModel):
    name: str
    number: str
    description: str


class TriageAssessOut(BaseModel):
    urgency_level: str  # emergency | urgent | routine
    level_code: int  # 2: emergency, 1: urgent, 0: routine
    title: str
    action_guidance: str
    matched_reasons: List[str]
    first_aid_advice: Optional[str] = None
    emergency_contacts: List[EmergencyContact]
    disclaimer: str
