from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.vitals import VitalsLog, FoodLog, FamilyCaregiver, AIMemoryNote
from app.schemas.vitals import (
    VitalsLogIn,
    VitalsLogOut,
    FoodLogIn,
    FoodLogOut,
    CaregiverIn,
    CaregiverOut,
    MemoryNoteIn,
    MemoryNoteOut,
)

router = APIRouter(prefix="/vitals", tags=["Vitals, Nutrition & Care Hub"])


# --- Vitals Tracker ---

def check_vitals_alerts(systolic: Optional[int], diastolic: Optional[int], spo2: Optional[float], glucose: Optional[float]) -> List[str]:
    alerts = []
    if systolic and diastolic:
        if systolic >= 180 or diastolic >= 120:
            alerts.append("🚨 Hypertensive Crisis: Blood pressure extremely elevated. Seek immediate emergency care.")
        elif systolic >= 140 or diastolic >= 90:
            alerts.append("⚠️ Elevated Blood Pressure: Recheck after 15 minutes of rest; consult your physician.")
        elif systolic < 90 or diastolic < 60:
            alerts.append("⚠️ Low Blood Pressure: Sit down, hydrate, and notify your doctor if accompanied by dizziness.")

    if spo2 is not None:
        if spo2 < 90:
            alerts.append("🚨 Hypoxemia Alert: SpO₂ under 90% is dangerously low. Seek urgent medical attention.")
        elif spo2 < 94:
            alerts.append("⚠️ Low Oxygen Saturation: SpO₂ under 94%; rest upright and check with a doctor.")

    if glucose is not None:
        if glucose > 200 or glucose < 70:
            alerts.append(f"⚠️ Glucose Alert: Blood glucose of {glucose} mg/dL is outside normal parameters.")

    return alerts


@router.get("", response_model=List[VitalsLogOut])
def get_vitals_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List recorded vitals readings with alerts."""
    logs = db.query(VitalsLog).filter(
        VitalsLog.user_id == current_user.id
    ).order_by(VitalsLog.log_date.desc()).limit(15).all()

    res = []
    for l in logs:
        alerts = check_vitals_alerts(l.systolic, l.diastolic, l.spo2, l.blood_glucose)
        out = VitalsLogOut(
            id=l.id,
            user_id=l.user_id,
            log_date=l.log_date,
            systolic=l.systolic,
            diastolic=l.diastolic,
            heart_rate=l.heart_rate,
            spo2=l.spo2,
            blood_glucose=l.blood_glucose,
            weight_kg=l.weight_kg,
            alerts=alerts,
            created_at=l.created_at,
        )
        res.append(out)
    return res


@router.post("", response_model=VitalsLogOut, status_code=status.HTTP_201_CREATED)
def record_vitals(
    payload: VitalsLogIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save vitals measurement and evaluate clinical range alerts."""
    log_date = payload.log_date or date.today()
    vl = VitalsLog(
        user_id=current_user.id,
        log_date=log_date,
        systolic=payload.systolic,
        diastolic=payload.diastolic,
        heart_rate=payload.heart_rate,
        spo2=payload.spo2,
        blood_glucose=payload.blood_glucose,
        weight_kg=payload.weight_kg,
    )
    db.add(vl)

    # Sync weight to profile if provided
    if payload.weight_kg and current_user.profile:
        current_user.profile.weight_kg = payload.weight_kg

    db.commit()
    db.refresh(vl)

    alerts = check_vitals_alerts(vl.systolic, vl.diastolic, vl.spo2, vl.blood_glucose)
    return VitalsLogOut(
        id=vl.id,
        user_id=vl.user_id,
        log_date=vl.log_date,
        systolic=vl.systolic,
        diastolic=vl.diastolic,
        heart_rate=vl.heart_rate,
        spo2=vl.spo2,
        blood_glucose=vl.blood_glucose,
        weight_kg=vl.weight_kg,
        alerts=alerts,
        created_at=vl.created_at,
    )


# --- Food Logging ---

@router.get("/food", response_model=List[FoodLogOut])
def get_food_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List today's logged food entries."""
    return db.query(FoodLog).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.log_date == date.today(),
    ).all()


@router.post("/food", response_model=FoodLogOut, status_code=status.HTTP_201_CREATED)
def add_food_log(
    payload: FoodLogIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a meal or food log entry with calories."""
    f = FoodLog(
        user_id=current_user.id,
        log_date=payload.log_date or date.today(),
        food_item=payload.food_item,
        calories=payload.calories,
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


# --- Family Caregiver Hub ---

@router.get("/caregivers", response_model=List[CaregiverOut])
def list_caregivers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List family caregivers with granted consent scopes."""
    return db.query(FamilyCaregiver).filter(FamilyCaregiver.user_id == current_user.id).all()


@router.post("/caregivers", response_model=CaregiverOut, status_code=status.HTTP_201_CREATED)
def add_caregiver(
    payload: CaregiverIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a family caregiver with explicit granular consent."""
    c = FamilyCaregiver(
        user_id=current_user.id,
        name=payload.name,
        relation=payload.relation,
        consent_scopes=payload.consent_scopes,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/caregivers/{caregiver_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_caregiver(
    caregiver_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke caregiver consent access."""
    c = db.query(FamilyCaregiver).filter(
        FamilyCaregiver.id == caregiver_id,
        FamilyCaregiver.user_id == current_user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Caregiver not found.")
    db.delete(c)
    db.commit()
    return None


# --- AI Memory Notes ---

@router.get("/memory", response_model=List[MemoryNoteOut])
def get_ai_memory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve user-approved facts stored in AI memory."""
    return db.query(AIMemoryNote).filter(AIMemoryNote.user_id == current_user.id).all()


@router.post("/memory", response_model=MemoryNoteOut, status_code=status.HTTP_201_CREATED)
def add_ai_memory(
    payload: MemoryNoteIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add user-controlled health context memory note."""
    m = AIMemoryNote(user_id=current_user.id, note=payload.note)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.delete("/memory/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ai_memory(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an AI memory note."""
    m = db.query(AIMemoryNote).filter(
        AIMemoryNote.id == note_id,
        AIMemoryNote.user_id == current_user.id,
    ).first()
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")
    db.delete(m)
    db.commit()
    return None
