from datetime import date
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Date, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class VitalsLog(Base, TimestampMixin):
    __tablename__ = "vitals_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    log_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    systolic: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # mmHg
    diastolic: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # mmHg
    heart_rate: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # bpm
    spo2: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # %
    blood_glucose: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # mg/dL
    weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # kg

    user: Mapped["User"] = relationship("User", back_populates="vitals_logs")


class FoodLog(Base, TimestampMixin):
    __tablename__ = "food_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    log_date: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    food_item: Mapped[str] = mapped_column(String(150), nullable=False)
    calories: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class FamilyCaregiver(Base, TimestampMixin):
    __tablename__ = "family_caregivers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    relation: Mapped[str] = mapped_column(String(50), nullable=False)
    consent_scopes: Mapped[list] = mapped_column(JSON, default=list, nullable=False)  # ["appointments", "reminders", "records"]


class AIMemoryNote(Base, TimestampMixin):
    __tablename__ = "ai_memory_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    note: Mapped[str] = mapped_column(String(255), nullable=False)
