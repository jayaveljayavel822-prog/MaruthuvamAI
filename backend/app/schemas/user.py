from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class UserProfileBase(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    height_cm: Optional[float] = Field(None, ge=30, le=250)
    weight_kg: Optional[float] = Field(None, ge=1, le=300)
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    medical_conditions: Optional[List[str]] = None
    wellness_goals: Optional[str] = None


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileOut(UserProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    preferred_language: str
    is_active: bool
    abha_number: Optional[str] = None
    abha_address: Optional[str] = None
    profile: Optional[UserProfileOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    preferred_language: Optional[str] = None
    abha_number: Optional[str] = None
    abha_address: Optional[str] = None
    profile: Optional[UserProfileUpdate] = None
