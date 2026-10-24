from datetime import date, timedelta
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.medical_record import MedicalRecord
from app.schemas.fhir import FhirBundleOut
from app.services.fhir_service import fhir_service

router = APIRouter(prefix="/fhir", tags=["FHIR & ABHA Interoperability"])


@router.get("/preview", response_model=FhirBundleOut)
def preview_fhir_bundle(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and preview ABDM-compliant FHIR R4 Bundle from authenticated user's records."""
    records = db.query(MedicalRecord).filter(MedicalRecord.user_id == current_user.id).all()
    bundle = fhir_service.export_bundle(current_user, records)
    return bundle


@router.get("/export")
def export_fhir_json(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download FHIR R4 Bundle as a JSON file."""
    import json
    records = db.query(MedicalRecord).filter(MedicalRecord.user_id == current_user.id).all()
    bundle = fhir_service.export_bundle(current_user, records)
    json_bytes = json.dumps(bundle, indent=2).encode("utf-8")

    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=maruthuvam_fhir_{current_user.username}.json"},
    )


@router.post("/abha/link")
def link_abha_sandbox(
    abha_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Link 14-digit ABHA number in sandbox mode."""
    cleaned = abha_number.replace("-", "").strip()
    if len(cleaned) != 14 or not cleaned.isdigit():
        cleaned = "91123456789012"  # fallback sandbox number

    formatted = f"{cleaned[:2]}-{cleaned[2:6]}-{cleaned[6:10]}-{cleaned[10:14]}"
    current_user.abha_number = formatted
    current_user.abha_address = f"{current_user.username}@abdm"
    db.commit()
    return {
        "status": "linked",
        "abha_number": current_user.abha_number,
        "abha_address": current_user.abha_address,
        "message": "ABHA sandbox account linked successfully.",
    }


@router.post("/abha/import")
def import_abdm_demo_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Simulate importing ABDM health records via FHIR DiagnosticReport and MedicationRequest."""
    today = date.today()
    rec1 = MedicalRecord(
        user_id=current_user.id,
        title="Lipid Profile (ABDM Import)",
        record_type="lab",
        record_date=today - timedelta(days=5),
        source_facility="Apollo Diagnostics (ABDM Network)",
        raw_text="Imported via ABDM consent: Total Cholesterol 214 mg/dL, LDL 138 mg/dL, HDL 46 mg/dL.",
        structured_data={
            "diagnoses": ["Dyslipidemia"],
            "medications": [],
            "tests": [
                {"name": "Total Cholesterol", "value": 214, "unit": "mg/dL", "low_ref": 0, "high_ref": 200, "flag": "HIGH"},
                {"name": "LDL Cholesterol", "value": 138, "unit": "mg/dL", "low_ref": 0, "high_ref": 100, "flag": "HIGH"},
                {"name": "HDL Cholesterol", "value": 46, "unit": "mg/dL", "low_ref": 40, "high_ref": 80, "flag": "NORMAL"},
            ]
        }
    )
    rec2 = MedicalRecord(
        user_id=current_user.id,
        title="Diabetes Follow-up Prescription (ABDM)",
        record_type="rx",
        record_date=today - timedelta(days=2),
        source_facility="City Healthcare (ABDM Network)",
        raw_text="Imported via ABDM consent: Tab Metformin 500mg twice daily with meals for 30 days.",
        structured_data={
            "diagnoses": ["Prediabetes"],
            "medications": [{"name": "Metformin", "dosage": "500 mg", "frequency": "Twice daily", "duration": "30 days"}],
            "tests": [],
        }
    )
    db.add(rec1)
    db.add(rec2)
    db.commit()
    return {"message": "Imported 2 clinical records from ABDM sandbox.", "records_imported": 2}


@router.post("/abha/unlink")
def unlink_abha(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Unlink ABHA credentials."""
    current_user.abha_number = None
    current_user.abha_address = None
    db.commit()
    return {"message": "ABHA profile unlinked."}
