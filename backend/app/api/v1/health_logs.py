from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.health_log import HealthLog
from app.schemas.health_log import HealthLogIn, HealthLogUpdate, HealthLogOut

router = APIRouter(prefix="/health-logs", tags=["Health Tracking"])


@router.get("", response_model=List[HealthLogOut])
def get_health_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve logged health entries for the authenticated user."""
    query = db.query(HealthLog).filter(HealthLog.user_id == current_user.id)
    if start_date:
        query = query.filter(HealthLog.log_date >= start_date)
    if end_date:
        query = query.filter(HealthLog.log_date <= end_date)

    logs = query.order_by(HealthLog.log_date.desc()).limit(limit).all()
    return logs


@router.post("", response_model=HealthLogOut, status_code=status.HTTP_201_CREATED)
def create_or_update_health_log(
    payload: HealthLogIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Record or update daily health log for authenticated user.
    Prevents duplicates on the same date by updating the day's record cleanly.
    """
    existing_log = db.query(HealthLog).filter(
        HealthLog.user_id == current_user.id,
        HealthLog.log_date == payload.log_date,
    ).first()

    if existing_log:
        existing_log.water_glasses = payload.water_glasses
        existing_log.sleep_hours = payload.sleep_hours
        existing_log.steps = payload.steps
        existing_log.mood = payload.mood
        if payload.notes is not None:
            existing_log.notes = payload.notes
        db.commit()
        db.refresh(existing_log)
        return existing_log

    new_log = HealthLog(
        user_id=current_user.id,
        log_date=payload.log_date,
        water_glasses=payload.water_glasses,
        sleep_hours=payload.sleep_hours,
        steps=payload.steps,
        mood=payload.mood,
        notes=payload.notes,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.patch("/{log_id}", response_model=HealthLogOut)
def update_health_log(
    log_id: str,
    payload: HealthLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Edit an existing health log entry belonging to the authenticated user."""
    log = db.query(HealthLog).filter(
        HealthLog.id == log_id,
        HealthLog.user_id == current_user.id,
    ).first()

    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Health log not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(log, field, val)

    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_health_log(
    log_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a health log entry belonging to the authenticated user."""
    log = db.query(HealthLog).filter(
        HealthLog.id == log_id,
        HealthLog.user_id == current_user.id,
    ).first()

    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Health log not found.")

    db.delete(log)
    db.commit()
    return None
