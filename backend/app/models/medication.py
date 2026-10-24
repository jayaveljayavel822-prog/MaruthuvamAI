from datetime import date, datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Medication(Base, TimestampMixin):
    __tablename__ = "medications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    dosage: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # e.g., 500mg
    frequency: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # e.g., Thrice daily
    instructions: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # After meals
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="medications")
    reminders: Mapped[List["MedicationReminder"]] = relationship("MedicationReminder", back_populates="medication", cascade="all, delete-orphan")


class MedicationReminder(Base, TimestampMixin):
    __tablename__ = "medication_reminders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    medication_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("medications.id", ondelete="SET NULL"), nullable=True)
    medicine_name: Mapped[str] = mapped_column(String(150), nullable=False)
    reminder_time: Mapped[str] = mapped_column(String(10), nullable=False)  # HH:MM e.g. 09:00
    frequency: Mapped[str] = mapped_column(String(50), default="daily", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="reminders")
    medication: Mapped[Optional["Medication"]] = relationship("Medication", back_populates="reminders")
    logs: Mapped[List["ReminderLog"]] = relationship("ReminderLog", back_populates="reminder", cascade="all, delete-orphan")


class ReminderLog(Base):
    __tablename__ = "reminder_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    reminder_id: Mapped[str] = mapped_column(String(36), ForeignKey("medication_reminders.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    scheduled_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    taken_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)  # pending, taken, skipped

    reminder: Mapped["MedicationReminder"] = relationship("MedicationReminder", back_populates="logs")
