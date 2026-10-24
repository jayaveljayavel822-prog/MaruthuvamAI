from datetime import date
from typing import Optional
from sqlalchemy import String, Integer, Float, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class HealthLog(Base, TimestampMixin):
    __tablename__ = "health_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    log_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    water_glasses: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sleep_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    steps: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    mood: Mapped[int] = mapped_column(Integer, default=3, nullable=False)  # 1 (Bad) to 5 (Great)
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="health_logs")

    __table_args__ = (
        UniqueConstraint("user_id", "log_date", name="uq_user_log_date"),
    )
