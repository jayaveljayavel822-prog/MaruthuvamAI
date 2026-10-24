from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.medical_record import MedicalRecord, MedicalRecordFile
from app.models.medication import MedicationReminder
from app.schemas.medical_record import (
    MedicalRecordIn,
    MedicalRecordUpdate,
    MedicalRecordOut,
    OcrResultOut,
    OcrReviewIn,
)
from app.services.storage_service import storage_service
from app.services.ocr_service import ocr_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])


@router.get("", response_model=List[MedicalRecordOut])
def list_medical_records(
    record_type: Optional[str] = Query(None, pattern="^(rx|lab|dc|dx|other)$"),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all medical records for authenticated user with filters."""
    query = db.query(MedicalRecord).filter(MedicalRecord.user_id == current_user.id)

    if record_type:
        query = query.filter(MedicalRecord.record_type == record_type)

    records = query.order_by(MedicalRecord.record_date.desc()).all()

    if search:
        s_lower = search.lower()
        records = [
            r for r in records
            if s_lower in r.title.lower()
            or (r.source_facility and s_lower in r.source_facility.lower())
            or (r.raw_text and s_lower in r.raw_text.lower())
        ]

    return records


@router.post("", response_model=MedicalRecordOut, status_code=status.HTTP_201_CREATED)
def create_medical_record(
    payload: MedicalRecordIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Manually create a new medical record."""
    new_record = MedicalRecord(
        user_id=current_user.id,
        title=payload.title,
        record_type=payload.record_type,
        record_date=payload.record_date,
        source_facility=payload.source_facility,
        raw_text=payload.raw_text,
        structured_data=payload.structured_data or {},
        file_attachment=payload.file_attachment,
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.get("/{record_id}", response_model=MedicalRecordOut)
def get_medical_record(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve details of a specific medical record."""
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id,
    ).first()

    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")
    return record


@router.patch("/{record_id}", response_model=MedicalRecordOut)
def update_medical_record(
    record_id: str,
    payload: MedicalRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update medical record details."""
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id,
    ).first()

    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(record, field, val)

    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medical_record(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete medical record and any associated storage files."""
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id,
    ).first()

    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")

    # Clean up files if attached
    if record.file_attachment:
        storage_service.delete_file(record.file_attachment)

    db.delete(record)
    db.commit()
    return None


@router.post("/upload")
async def upload_record_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Securely upload prescription or medical report document."""
    storage_key, orig_name, size = await storage_service.save_file(file, current_user.id)
    return {
        "storage_key": storage_key,
        "original_filename": orig_name,
        "size_bytes": size,
    }


@router.post("/ocr", response_model=OcrResultOut)
async def process_document_ocr(
    raw_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
):
    """
    Run OCR extraction pipeline on uploaded image or pasted document text.
    Returns structured medical candidates for patient review before saving.
    """
    file_path = None
    orig_name = None
    if file:
        storage_key, orig_name, _ = await storage_service.save_file(file, current_user.id)
        file_path = str(storage_service.get_file_path(storage_key))

    extracted = await ocr_service.extract_from_text_or_file(
        text_content=raw_text,
        file_path=file_path,
        file_name=orig_name,
    )
    return extracted


@router.post("/ocr/confirm", response_model=MedicalRecordOut, status_code=status.HTTP_201_CREATED)
def confirm_and_save_ocr_record(
    payload: OcrReviewIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Save confirmed and user-verified OCR extraction data to PostgreSQL.
    Optionally auto-creates medication reminders if confirmed by patient.
    """
    new_record = MedicalRecord(
        user_id=current_user.id,
        title=payload.title,
        record_type=payload.record_type,
        record_date=payload.record_date,
        source_facility=payload.source_facility,
        raw_text=payload.raw_text,
        structured_data=payload.structured_data,
    )
    db.add(new_record)
    db.flush()

    # If requested and medicines are present, create reminders
    if payload.auto_create_reminders and payload.structured_data:
        meds = payload.structured_data.get("medications") or []
        for m in meds:
            if not isinstance(m, dict):
                continue
            med_name = (m.get("name") or "").strip()
            dose = (m.get("dosage") or "").strip()
            # Never invent a default 09:00/daily schedule from OCR. Only create a
            # reminder when the prescription explicitly yielded a valid time and frequency.
            reminder_time = m.get("reminder_time") or m.get("time")
            frequency = m.get("reminder_frequency") or m.get("frequency")
            if not med_name or not reminder_time or not frequency:
                continue
            import re
            if not re.fullmatch(r"(?:[01]\d|2[0-3]):[0-5]\d", str(reminder_time)):
                continue
            full_name = f"{med_name} {dose}".strip()
            rem = MedicationReminder(
                user_id=current_user.id,
                medicine_name=full_name,
                reminder_time=str(reminder_time),
                frequency=str(frequency),
                is_active=True,
            )
            db.add(rem)

    db.commit()
    db.refresh(new_record)
    return new_record


@router.post("/{record_id}/explain")
async def explain_medical_record(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate patient-friendly plain-language explanation of a medical document."""
    record = db.query(MedicalRecord).filter(
        MedicalRecord.id == record_id,
        MedicalRecord.user_id == current_user.id,
    ).first()

    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found.")

    prompt = (
        f"Explain this {record.record_type.upper()} report to a patient in clear, supportive language.\n"
        f"Title: {record.title}\n"
        f"Facility: {record.source_facility or 'Not specified'}\n"
        f"Text: {record.raw_text or 'None'}\n"
        f"Structured Data: {record.structured_data}\n"
        "Provide: 1. Simple Summary, 2. Abnormal values explained in plain terms, 3. Practical questions to ask their doctor."
    )
    res = await ai_service.generate_response(prompt, language=current_user.preferred_language)
    return {"explanation": res["text"], "disclaimer": "This explanation is for educational purposes and is not a clinical diagnosis."}


@router.post("/summary")
async def generate_unified_records_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Combine fragmented medical records into a unified patient summary."""
    records = db.query(MedicalRecord).filter(MedicalRecord.user_id == current_user.id).all()
    if not records:
        return {"summary": "No medical records found. Upload a prescription or lab report to generate your summary."}

    records_text = "\n---\n".join(
        f"{r.record_type.upper()} ({r.record_date}): {r.title} | {r.source_facility or ''} | {r.raw_text or ''}"[:350]
        for r in records
    )
    prompt = (
        "You are a health records assistant. Combine these fragmented records into ONE patient-friendly summary "
        "with sections: 1. Current Medicines, 2. Key Lab Findings (flag abnormal values), 3. Past Hospital/Doctor Visits, "
        "4. Follow-ups to discuss with your doctor.\n\nRecords:\n" + records_text
    )
    res = await ai_service.generate_response(prompt, language=current_user.preferred_language)
    return {
        "summary": res["text"],
        "records_analyzed": len(records),
        "disclaimer": "Consolidated health overview for patient reference. Verify all medications with your pharmacist.",
    }
