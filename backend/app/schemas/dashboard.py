from datetime import date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class MetricStat(BaseModel):
    name: str
    key: str
    value: float
    goal: float
    unit: str
    progress_ratio: float
    percentage: int


class AlertItem(BaseModel):
    id: str
    message: str
    level: str  # ok, warning, info
    category: str


class DayMetric(BaseModel):
    date: str
    water: int
    sleep: float
    steps: int
    mood: int


class DashboardSummaryOut(BaseModel):
    user_name: str
    greeting: str
    today_date_str: str
    wellness_message: str
    health_score: int
    health_score_explanation: str
    metrics: List[MetricStat]
    alerts: List[AlertItem]
    streak_days: int
    bmi: Optional[float] = None
    bmi_category: Optional[str] = None
    recent_records_count: int = 0
    active_reminders_count: int = 0
    upcoming_appointments_count: int = 0


class DashboardTrendsOut(BaseModel):
    metric_key: str
    days: List[Dict[str, Any]]
    average: float
    goal: float
    streak: int
