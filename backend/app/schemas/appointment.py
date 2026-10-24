from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AppointmentBase(BaseModel):
    doctor_or_facility: str = Field(..., min_length=2, max_length=150)
    specialty: Optional[str] = Field(None, max_length=100)
    appointment_date: datetime
    reason: Optional[str] = Field(None, max_length=255)
    status: str = "scheduled"  # scheduled, completed, cancelled
    notes: Optional[str] = Field(None, max_length=500)


class AppointmentIn(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    doctor_or_facility: Optional[str] = None
    specialty: Optional[str] = None
    appointment_date: Optional[datetime] = None
    reason: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class AppointmentOut(AppointmentBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
