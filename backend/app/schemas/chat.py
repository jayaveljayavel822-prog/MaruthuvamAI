from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class MessageIn(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    language: Optional[str] = "English"


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    is_emergency: bool
    language: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationIn(BaseModel):
    title: Optional[str] = "New Consultation"


class ConversationOut(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class QuickAiTaskIn(BaseModel):
    task_type: str = Field(..., pattern="^(weekly_summary|daily_tip|explain_record|cross_insights|clinician_summary|doctor_questions)$")
    context_text: Optional[str] = None
    record_id: Optional[str] = None
    language: Optional[str] = "English"


class QuickAiTaskOut(BaseModel):
    task_type: str
    result_text: str
    disclaimer: str
