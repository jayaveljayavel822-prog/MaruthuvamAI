import uuid
from typing import Optional, List
from sqlalchemy import String, Boolean, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(120), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(20), default="English", nullable=False)
    abha_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    abha_address: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relationships
    profile: Mapped[Optional["UserProfile"]] = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    health_logs: Mapped[List["HealthLog"]] = relationship("HealthLog", back_populates="user", cascade="all, delete-orphan")
    medical_records: Mapped[List["MedicalRecord"]] = relationship("MedicalRecord", back_populates="user", cascade="all, delete-orphan")
    medications: Mapped[List["Medication"]] = relationship("Medication", back_populates="user", cascade="all, delete-orphan")
    reminders: Mapped[List["MedicationReminder"]] = relationship("MedicationReminder", back_populates="user", cascade="all, delete-orphan")
    appointments: Mapped[List["Appointment"]] = relationship("Appointment", back_populates="user", cascade="all, delete-orphan")
    conversations: Mapped[List["Conversation"]] = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    vitals_logs: Mapped[List["VitalsLog"]] = relationship("VitalsLog", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    height_cm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    medical_conditions: Mapped[Optional[list]] = mapped_column(JSON, default=list, nullable=True)
    wellness_goals: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="profile")
