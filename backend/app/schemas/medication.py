from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class MedicationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    dosage: Optional[str] = Field(None, max_length=100)
    frequency: Optional[str] = Field(None, max_length=100)
    instructions: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True


class MedicationIn(MedicationBase):
    pass


class MedicationOut(MedicationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReminderBase(BaseModel):
    medicine_name: str = Field(..., min_length=2, max_length=150)
    reminder_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")  # e.g. 09:00
    frequency: str = "daily"
    is_active: bool = True


class ReminderIn(ReminderBase):
    medication_id: Optional[str] = None


class ReminderUpdate(BaseModel):
    medicine_name: Optional[str] = None
    reminder_time: Optional[str] = None
    frequency: Optional[str] = None
    is_active: Optional[bool] = None


class ReminderOut(ReminderBase):
    id: str
    user_id: str
    medication_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReminderLogOut(BaseModel):
    id: str
    reminder_id: str
    scheduled_time: datetime
    taken_at: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True
