from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4)
    email: Optional[EmailStr] = None
    preferred_language: str = "English"
    age: Optional[int] = Field(None, ge=0, le=120)
    height_cm: Optional[float] = Field(None, ge=30, le=250)
    weight_kg: Optional[float] = Field(None, ge=1, le=300)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    username_or_email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=4)
