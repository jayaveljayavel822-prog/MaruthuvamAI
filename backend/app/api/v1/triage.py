from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.triage import TriageAssessIn, TriageAssessOut
from app.services.triage_service import triage_service, TRIAGE_RULES

router = APIRouter(prefix="/triage", tags=["Symptom Triage"])


@router.get("/rules")
def get_triage_rules_catalog():
    """Return catalog of symptoms grouped by clinical category for UI checklists."""
    categories: Dict[str, List[Dict[str, Any]]] = {}
    for idx, rule in enumerate(TRIAGE_RULES):
        cat = rule[0]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append({
            "id": idx,
            "category": cat,
            "name": rule[1],
            "urgency_level": rule[2],
        })
    return categories


@router.post("/assess", response_model=TriageAssessOut)
def assess_symptoms(
    payload: TriageAssessIn,
    current_user: User = Depends(get_current_user),
):
    """
    Evaluate user-reported symptoms through transparent, safety-first deterministic rules.
    Outputs categorized urgency (Emergency / Urgent / Routine) and first aid.
    """
    res = triage_service.assess_symptoms(
        symptom_text=payload.symptom_text,
        selected_ids=payload.selected_symptom_ids,
        severity=payload.severity,
        is_worsening=payload.is_worsening_quickly,
    )
    return res
