from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.medication import Medication, MedicationReminder, ReminderLog
from app.schemas.medication import (
    MedicationIn,
    MedicationOut,
    ReminderIn,
    ReminderUpdate,
    ReminderOut,
    ReminderLogOut,
)

router = APIRouter(prefix="/medications", tags=["Medications & Reminders"])


# --- Medications Catalog ---

@router.get("", response_model=List[MedicationOut])
def list_medications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List medications saved in the patient's record."""
    return db.query(Medication).filter(Medication.user_id == current_user.id).all()


@router.post("", response_model=MedicationOut, status_code=status.HTTP_201_CREATED)
def create_medication(
    payload: MedicationIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new medication entry."""
    med = Medication(user_id=current_user.id, **payload.model_dump())
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


# --- Medication Reminders ---

@router.get("/reminders", response_model=List[ReminderOut])
def list_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all scheduled medication reminders for the user."""
    return db.query(MedicationReminder).filter(
        MedicationReminder.user_id == current_user.id
    ).order_by(MedicationReminder.reminder_time.asc()).all()


@router.post("/reminders", response_model=ReminderOut, status_code=status.HTTP_201_CREATED)
def create_reminder(
    payload: ReminderIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new daily medication reminder."""
    rem = MedicationReminder(
        user_id=current_user.id,
        medication_id=payload.medication_id,
        medicine_name=payload.medicine_name,
        reminder_time=payload.reminder_time,
        frequency=payload.frequency,
        is_active=payload.is_active,
    )
    db.add(rem)
    db.commit()
    db.refresh(rem)
    return rem


@router.patch("/reminders/{reminder_id}", response_model=ReminderOut)
def update_reminder(
    reminder_id: str,
    payload: ReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update reminder time or status."""
    rem = db.query(MedicationReminder).filter(
        MedicationReminder.id == reminder_id,
        MedicationReminder.user_id == current_user.id,
    ).first()
    if not rem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(rem, field, val)

    db.commit()
    db.refresh(rem)
    return rem


@router.delete("/reminders/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a medication reminder."""
    rem = db.query(MedicationReminder).filter(
        MedicationReminder.id == reminder_id,
        MedicationReminder.user_id == current_user.id,
    ).first()
    if not rem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found.")

    db.delete(rem)
    db.commit()
    return None


@router.post("/reminders/{reminder_id}/log", response_model=ReminderLogOut)
def log_reminder_taken(
    reminder_id: str,
    status_action: str = "taken",  # taken or skipped
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record that a reminder dose was taken or skipped."""
    rem = db.query(MedicationReminder).filter(
        MedicationReminder.id == reminder_id,
        MedicationReminder.user_id == current_user.id,
    ).first()
    if not rem:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found.")

    now = datetime.now(timezone.utc)
    log = ReminderLog(
        reminder_id=rem.id,
        user_id=current_user.id,
        scheduled_time=now,
        taken_at=now if status_action == "taken" else None,
        status=status_action,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
