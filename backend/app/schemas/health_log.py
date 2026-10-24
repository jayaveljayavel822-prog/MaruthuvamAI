from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class HealthLogBase(BaseModel):
    log_date: date
    water_glasses: int = Field(0, ge=0, le=50)
    sleep_hours: float = Field(0.0, ge=0.0, le=24.0)
    steps: int = Field(0, ge=0, le=100000)
    mood: int = Field(3, ge=1, le=5)
    notes: Optional[str] = Field(None, max_length=500)


class HealthLogIn(HealthLogBase):
    pass


class HealthLogUpdate(BaseModel):
    water_glasses: Optional[int] = Field(None, ge=0, le=50)
    sleep_hours: Optional[float] = Field(None, ge=0.0, le=24.0)
    steps: Optional[int] = Field(None, ge=0, le=100000)
    mood: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = Field(None, max_length=500)


class HealthLogOut(HealthLogBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
