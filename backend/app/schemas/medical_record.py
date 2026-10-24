from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class LabTestItem(BaseModel):
    name: str
    value: Any
    unit: Optional[str] = ""
    low_ref: Optional[float] = None
    high_ref: Optional[float] = None
    flag: Optional[str] = "NORMAL"  # NORMAL, HIGH, LOW, UNKNOWN


class PrescribedMedItem(BaseModel):
    name: str
    dosage: Optional[str] = ""
    frequency: Optional[str] = ""
    duration: Optional[str] = ""


class StructuredMedicalData(BaseModel):
    diagnoses: Optional[List[str]] = Field(default_factory=list)
    medications: Optional[List[PrescribedMedItem]] = Field(default_factory=list)
    tests: Optional[List[LabTestItem]] = Field(default_factory=list)
    uncertain: Optional[List[str]] = Field(default_factory=list)
    notes: Optional[str] = ""


class MedicalRecordIn(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    record_type: str = Field(..., pattern="^(rx|lab|dc|dx|other)$")
    record_date: date
    source_facility: Optional[str] = Field(None, max_length=200)
    raw_text: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    file_attachment: Optional[str] = None


class MedicalRecordUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    record_type: Optional[str] = Field(None, pattern="^(rx|lab|dc|dx|other)$")
    record_date: Optional[date] = None
    source_facility: Optional[str] = Field(None, max_length=200)
    raw_text: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None


class MedicalRecordOut(BaseModel):
    id: str
    user_id: str
    title: str
    record_type: str
    record_date: date
    source_facility: Optional[str] = None
    raw_text: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    summary: Optional[str] = None
    file_attachment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OcrResultOut(BaseModel):
    record_type: str
    title: str
    record_date: Optional[str] = None
    source_facility: Optional[str] = None
    diagnoses: List[str] = Field(default_factory=list)
    medications: List[PrescribedMedItem] = Field(default_factory=list)
    tests: List[LabTestItem] = Field(default_factory=list)
    uncertain_fields: List[str] = Field(default_factory=list)
    detected_language: Optional[str] = "English"
    is_handwritten: bool = False
    raw_extracted_text: str = ""
    status: str = "review_required"


class OcrReviewIn(BaseModel):
    title: str
    record_type: str
    record_date: date
    source_facility: Optional[str] = None
    structured_data: Dict[str, Any]
    raw_text: Optional[str] = None
    auto_create_reminders: bool = False
