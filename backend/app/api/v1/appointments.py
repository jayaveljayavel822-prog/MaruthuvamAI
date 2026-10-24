from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentIn, AppointmentUpdate, AppointmentOut

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("", response_model=List[AppointmentOut])
def list_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all scheduled and past doctor appointments."""
    return db.query(Appointment).filter(
        Appointment.user_id == current_user.id
    ).order_by(Appointment.appointment_date.asc()).all()


@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Schedule a new doctor or hospital appointment."""
    app = Appointment(
        user_id=current_user.id,
        doctor_or_facility=payload.doctor_or_facility,
        specialty=payload.specialty,
        appointment_date=payload.appointment_date,
        reason=payload.reason,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.patch("/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    appointment_id: str,
    payload: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update appointment date, reason, or status."""
    app = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.user_id == current_user.id,
    ).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(app, field, val)

    db.commit()
    db.refresh(app)
    return app


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel or remove an appointment."""
    app = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.user_id == current_user.id,
    ).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found.")

    db.delete(app)
    db.commit()
    return None
