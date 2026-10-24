from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.health_log import HealthLog
from app.models.medical_record import MedicalRecord
from app.models.medication import MedicationReminder
from app.models.appointment import Appointment
from app.services.health_service import health_service, GOALS
from app.schemas.dashboard import DashboardSummaryOut, DashboardTrendsOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryOut)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve full dashboard summary for authenticated user."""
    today = date.today()
    today_log = db.query(HealthLog).filter(
        HealthLog.user_id == current_user.id,
        HealthLog.log_date == today,
    ).first()

    # Calculate transparent health score
    score, score_explanation = health_service.calculate_wellness_score(today_log)

    # Metrics and Alerts
    metrics = health_service.generate_metric_stats(today_log)
    alerts = health_service.generate_smart_alerts(today_log)

    # Calculate streak from historical logs
    all_logs = db.query(HealthLog).filter(HealthLog.user_id == current_user.id).all()
    streak = health_service.calculate_streak(all_logs)

    # Calculate BMI
    bmi, bmi_cat = None, None
    if current_user.profile:
        bmi, bmi_cat = health_service.calculate_bmi(
            current_user.profile.height_cm,
            current_user.profile.weight_kg,
        )

    # Additional counts
    rec_count = db.query(MedicalRecord).filter(MedicalRecord.user_id == current_user.id).count()
    rem_count = db.query(MedicationReminder).filter(
        MedicationReminder.user_id == current_user.id,
        MedicationReminder.is_active == True,
    ).count()
    app_count = db.query(Appointment).filter(
        Appointment.user_id == current_user.id,
        Appointment.status == "scheduled",
    ).count()

    greeting_name = current_user.profile.full_name if current_user.profile and current_user.profile.full_name else current_user.username
    today_str = today.strftime("%A, %B %d")

    if score >= 75:
        msg = "You are doing great today! 🎉 Keep up the healthy hydration and activity."
    elif score >= 40:
        msg = "Good progress today! A little more water or a walk will complete your goals. 💪"
    else:
        msg = "Let's log your hydration, sleep, and steps to build your daily health momentum. 🌱"

    return DashboardSummaryOut(
        user_name=greeting_name,
        greeting=f"Hello, {greeting_name}!",
        today_date_str=today_str,
        wellness_message=msg,
        health_score=score,
        health_score_explanation=score_explanation,
        metrics=metrics,
        alerts=alerts,
        streak_days=streak,
        bmi=bmi,
        bmi_category=bmi_cat,
        recent_records_count=rec_count,
        active_reminders_count=rem_count,
        upcoming_appointments_count=app_count,
    )


@router.get("/trends", response_model=DashboardTrendsOut)
def get_dashboard_trends(
    metric: str = Query("water", pattern="^(water|sleep|steps|mood)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve 7-day trend history for specified metric."""
    today = date.today()
    seven_days_ago = today - timedelta(days=6)

    logs = db.query(HealthLog).filter(
        HealthLog.user_id == current_user.id,
        HealthLog.log_date >= seven_days_ago,
        HealthLog.log_date <= today,
    ).all()

    log_map = {log.log_date: log for log in logs}
    trend_days = []
    total_val = 0.0

    field_map = {
        "water": "water_glasses",
        "sleep": "sleep_hours",
        "steps": "steps",
        "mood": "mood",
    }
    field_name = field_map[metric]

    for i in range(7):
        target_date = seven_days_ago + timedelta(days=i)
        log = log_map.get(target_date)
        val = getattr(log, field_name) if log else 0.0
        total_val += float(val)

        trend_days.append({
            "date": target_date.strftime("%a %d"),
            "full_date": target_date.isoformat(),
            "value": val,
            "goal": GOALS[metric]["target"],
        })

    avg = round(total_val / 7.0, 1)
    all_logs = db.query(HealthLog).filter(HealthLog.user_id == current_user.id).all()
    streak = health_service.calculate_streak(all_logs)

    return DashboardTrendsOut(
        metric_key=metric,
        days=trend_days,
        average=avg,
        goal=GOALS[metric]["target"],
        streak=streak,
    )
