from datetime import date
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Date, Text, ForeignKey, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class MedicalRecord(Base, TimestampMixin):
    __tablename__ = "medical_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    record_type: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # rx, lab, dc, dx, other
    record_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    source_facility: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)  # Doctor or Hospital
    raw_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_attachment: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # Extracted structured data: {"diagnoses": [...], "meds": [...], "tests": [...], "meta": {...}}
    structured_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, default=dict, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="medical_records")
    files: Mapped[List["MedicalRecordFile"]] = relationship("MedicalRecordFile", back_populates="record", cascade="all, delete-orphan")


class MedicalRecordFile(Base, TimestampMixin):
    __tablename__ = "medical_record_files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    record_id: Mapped[str] = mapped_column(String(36), ForeignKey("medical_records.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    storage_key: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)

    record: Mapped["MedicalRecord"] = relationship("MedicalRecord", back_populates="files")
