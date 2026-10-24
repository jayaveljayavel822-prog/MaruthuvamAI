from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class VitalsLogIn(BaseModel):
    log_date: Optional[date] = None
    systolic: Optional[int] = Field(None, ge=40, le=300)
    diastolic: Optional[int] = Field(None, ge=20, le=200)
    heart_rate: Optional[int] = Field(None, ge=30, le=250)
    spo2: Optional[float] = Field(None, ge=50, le=100)
    blood_glucose: Optional[float] = Field(None, ge=20, le=600)
    weight_kg: Optional[float] = Field(None, ge=1, le=300)


class VitalsLogOut(VitalsLogIn):
    id: str
    user_id: str
    alerts: List[str] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


class FoodLogIn(BaseModel):
    log_date: Optional[date] = None
    food_item: str = Field(..., min_length=2, max_length=150)
    calories: int = Field(0, ge=0, le=5000)


class FoodLogOut(FoodLogIn):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class CaregiverIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    relation: str = Field(..., min_length=2, max_length=50)
    consent_scopes: List[str] = Field(default_factory=list)


class CaregiverOut(CaregiverIn):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class MemoryNoteIn(BaseModel):
    note: str = Field(..., min_length=2, max_length=255)


class MemoryNoteOut(MemoryNoteIn):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True
