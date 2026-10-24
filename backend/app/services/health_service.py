from datetime import date, timedelta
from typing import List, Dict, Any, Optional, Tuple
from app.models.health_log import HealthLog
from app.schemas.dashboard import MetricStat, AlertItem

# Configurable transparent wellness targets
GOALS = {
    "water": {"target": 8.0, "unit": "glasses", "name": "💧 Water Intake"},
    "sleep": {"target": 8.0, "unit": "hrs", "name": "😴 Sleep Duration"},
    "steps": {"target": 8000.0, "unit": "steps", "name": "👣 Daily Steps"},
    "mood": {"target": 5.0, "unit": "/5", "name": "🙂 Mood Balance"},
}


class HealthService:
    def calculate_bmi(self, height_cm: Optional[float], weight_kg: Optional[float]) -> Tuple[Optional[float], Optional[str]]:
        """Calculate Body Mass Index and category."""
        if not height_cm or not weight_kg or height_cm <= 0 or weight_kg <= 0:
            return None, None
        
        height_m = height_cm / 100.0
        bmi = round(weight_kg / (height_m ** 2), 1)

        if bmi < 18.5:
            cat = "Underweight"
        elif bmi < 25.0:
            cat = "Healthy weight range"
        elif bmi < 30.0:
            cat = "Overweight"
        else:
            cat = "Obese range"

        return bmi, cat

    def calculate_wellness_score(self, today_log: Optional[HealthLog]) -> Tuple[int, str]:
        """
        Transparent wellness score based on today's logged lifestyle habits.
        Calculates percentage of completion across water, sleep, steps, and mood.
        Explicitly not a clinical diagnosis score.
        """
        if not today_log:
            return (
                0,
                "Health score is calculated transparently from your daily logged water, sleep, steps, and mood. Log today's entry to activate."
            )

        w_ratio = min(1.0, today_log.water_glasses / GOALS["water"]["target"])
        s_ratio = min(1.0, today_log.sleep_hours / GOALS["sleep"]["target"])
        st_ratio = min(1.0, today_log.steps / GOALS["steps"]["target"])
        m_ratio = min(1.0, today_log.mood / GOALS["mood"]["target"])

        avg_ratio = (w_ratio + s_ratio + st_ratio + m_ratio) / 4.0
        score = int(round(avg_ratio * 100))

        explanation = (
            f"Calculated from Water ({int(w_ratio*100)}%), Sleep ({int(s_ratio*100)}%), "
            f"Steps ({int(st_ratio*100)}%), and Mood ({int(m_ratio*100)}%). "
            "This is a transparent lifestyle progress index, not a diagnostic medical metric."
        )
        return score, explanation

    def generate_metric_stats(self, today_log: Optional[HealthLog]) -> List[MetricStat]:
        """Generate structured stats cards with progress ratios."""
        water = float(today_log.water_glasses) if today_log else 0.0
        sleep = float(today_log.sleep_hours) if today_log else 0.0
        steps = float(today_log.steps) if today_log else 0.0
        mood = float(today_log.mood) if today_log else 0.0

        stats = [
            MetricStat(
                name=GOALS["water"]["name"],
                key="water",
                value=water,
                goal=GOALS["water"]["target"],
                unit=GOALS["water"]["unit"],
                progress_ratio=min(1.0, water / GOALS["water"]["target"]),
                percentage=int(min(1.0, water / GOALS["water"]["target"]) * 100),
            ),
            MetricStat(
                name=GOALS["sleep"]["name"],
                key="sleep",
                value=sleep,
                goal=GOALS["sleep"]["target"],
                unit=GOALS["sleep"]["unit"],
                progress_ratio=min(1.0, sleep / GOALS["sleep"]["target"]),
                percentage=int(min(1.0, sleep / GOALS["sleep"]["target"]) * 100),
            ),
            MetricStat(
                name=GOALS["steps"]["name"],
                key="steps",
                value=steps,
                goal=GOALS["steps"]["target"],
                unit=GOALS["steps"]["unit"],
                progress_ratio=min(1.0, steps / GOALS["steps"]["target"]),
                percentage=int(min(1.0, steps / GOALS["steps"]["target"]) * 100),
            ),
            MetricStat(
                name=GOALS["mood"]["name"],
                key="mood",
                value=mood,
                goal=GOALS["mood"]["target"],
                unit=GOALS["mood"]["unit"],
                progress_ratio=min(1.0, mood / GOALS["mood"]["target"]),
                percentage=int(min(1.0, mood / GOALS["mood"]["target"]) * 100),
            ),
        ]
        return stats

    def generate_smart_alerts(self, today_log: Optional[HealthLog]) -> List[AlertItem]:
        """Generate rule-based wellness recommendations."""
        alerts = []
        if not today_log:
            alerts.append(
                AlertItem(
                    id="log_missing",
                    message="🌱 Log today's health entry to activate real-time wellness alerts.",
                    level="info",
                    category="wellness",
                )
            )
            return alerts

        if today_log.sleep_hours < 6.0:
            alerts.append(
                AlertItem(
                    id="sleep_low",
                    message="😴 Sleep duration is under 6 hours – consider resting early tonight.",
                    level="warning",
                    category="sleep",
                )
            )
        if today_log.water_glasses < 4:
            alerts.append(
                AlertItem(
                    id="water_low",
                    message="💧 Hydration is low – drink a glass of fresh water now.",
                    level="warning",
                    category="hydration",
                )
            )
        if today_log.steps < 3000:
            alerts.append(
                AlertItem(
                    id="steps_low",
                    message="👣 Under 3,000 steps so far – a gentle 15-minute walk will boost vitality.",
                    level="warning",
                    category="activity",
                )
            )
        if today_log.mood <= 2:
            alerts.append(
                AlertItem(
                    id="mood_low",
                    message="💛 Mood is marked low – take a mindful breath, talk to someone you trust, or rest.",
                    level="warning",
                    category="mental_wellness",
                )
            )

        if not alerts:
            alerts.append(
                AlertItem(
                    id="all_good",
                    message="✅ Excellent balance today! All daily wellness targets are on track.",
                    level="ok",
                    category="general",
                )
            )

        return alerts

    def calculate_streak(self, logs: List[HealthLog]) -> int:
        """Calculate consecutive days logged."""
        if not logs:
            return 0
        
        logged_dates = {log.log_date for log in logs}
        streak = 0
        curr = date.today()

        # Allow streak if logged today or starting yesterday
        if curr not in logged_dates:
            curr = curr - timedelta(days=1)

        while curr in logged_dates:
            streak += 1
            curr = curr - timedelta(days=1)

        return streak


health_service = HealthService()
