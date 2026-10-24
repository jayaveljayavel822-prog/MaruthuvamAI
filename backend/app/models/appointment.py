from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    doctor_or_facility: Mapped[str] = mapped_column(String(150), nullable=False)
    specialty: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    appointment_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="scheduled", nullable=False)  # scheduled, completed, cancelled
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="appointments")
