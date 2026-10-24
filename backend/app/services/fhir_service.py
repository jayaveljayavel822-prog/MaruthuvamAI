from datetime import datetime, timezone
import uuid
from typing import Dict, Any, List
from app.models.user import User
from app.models.medical_record import MedicalRecord


class FHIRService:
    def export_bundle(self, user: User, records: List[MedicalRecord]) -> Dict[str, Any]:
        """
        Generate ABDM-compliant FHIR R4 Collection Bundle from patient records.
        Maps Patient, Condition, MedicationRequest, Observation, DiagnosticReport, Composition.
        """
        patient_ref = f"urn:uuid:{user.id}"
        entries: List[Dict[str, Any]] = []

        # 1. Patient Resource
        patient_identifiers = []
        if user.abha_number:
            patient_identifiers.append({
                "system": "https://healthid.ndhm.gov.in",
                "value": user.abha_number,
            })
        
        patient_resource = {
            "resourceType": "Patient",
            "id": user.id,
            "identifier": patient_identifiers,
            "name": [{"text": (user.profile.full_name if user.profile and user.profile.full_name else user.username)}],
            "telecom": [{"system": "email", "value": user.email}] if user.email else [],
            "gender": (user.profile.gender.lower() if user.profile and user.profile.gender else "unknown"),
        }
        entries.append({
            "fullUrl": patient_ref,
            "resource": patient_resource,
        })

        # 2. Iterate Records and map to FHIR resources
        for rec in records:
            rec_id = rec.id
            data = rec.structured_data or {}
            rec_entry_refs = []

            # Conditions
            diagnoses = data.get("diagnoses") or []
            for dx in diagnoses:
                c_id = f"condition-{uuid.uuid4().hex[:8]}"
                condition_resource = {
                    "resourceType": "Condition",
                    "id": c_id,
                    "clinicalStatus": {
                        "coding": [{
                            "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                            "code": "active",
                            "display": "Active"
                        }],
                        "text": "active",
                    },
                    "code": {"text": dx},
                    "subject": {"reference": patient_ref},
                    "recordedDate": rec.record_date.isoformat(),
                }
                c_urn = f"urn:uuid:{c_id}"
                entries.append({"fullUrl": c_urn, "resource": condition_resource})
                rec_entry_refs.append({"reference": c_urn})

            # Medications -> MedicationRequest
            meds = data.get("medications") or []
            for m in meds:
                med_name = m.get("name") if isinstance(m, dict) else str(m)
                dose_instr = []
                if isinstance(m, dict):
                    if m.get("dosage"): dose_instr.append(m["dosage"])
                    if m.get("frequency"): dose_instr.append(m["frequency"])
                    if m.get("duration"): dose_instr.append(m["duration"])

                mr_id = f"medreq-{uuid.uuid4().hex[:8]}"
                med_req_resource = {
                    "resourceType": "MedicationRequest",
                    "id": mr_id,
                    "status": "active",
                    "intent": "order",
                    "subject": {"reference": patient_ref},
                    "authoredOn": rec.record_date.isoformat(),
                    "medicationCodeableConcept": {"text": med_name},
                    "dosageInstruction": [{"text": ", ".join(dose_instr)}] if dose_instr else [],
                }
                mr_urn = f"urn:uuid:{mr_id}"
                entries.append({"fullUrl": mr_urn, "resource": med_req_resource})
                rec_entry_refs.append({"reference": mr_urn})

            # Lab Tests -> Observation & DiagnosticReport
            tests = data.get("tests") or []
            obs_refs = []
            for t in tests:
                if not isinstance(t, dict):
                    continue
                obs_id = f"obs-{uuid.uuid4().hex[:8]}"
                obs_resource = {
                    "resourceType": "Observation",
                    "id": obs_id,
                    "status": "final",
                    "category": [{
                        "coding": [{
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "laboratory",
                            "display": "Laboratory"
                        }]
                    }],
                    "code": {"text": t.get("name", "Test")},
                    "subject": {"reference": patient_ref},
                    "effectiveDateTime": rec.record_date.isoformat(),
                    "valueQuantity": {
                        "value": t.get("value"),
                        "unit": t.get("unit", ""),
                    },
                }
                if t.get("low_ref") is not None and t.get("high_ref") is not None:
                    obs_resource["referenceRange"] = [{
                        "low": {"value": t["low_ref"]},
                        "high": {"value": t["high_ref"]},
                    }]
                obs_urn = f"urn:uuid:{obs_id}"
                entries.append({"fullUrl": obs_urn, "resource": obs_resource})
                obs_refs.append({"reference": obs_urn})
                rec_entry_refs.append({"reference": obs_urn})

            if obs_refs:
                dr_id = f"diagrep-{uuid.uuid4().hex[:8]}"
                diag_rep_resource = {
                    "resourceType": "DiagnosticReport",
                    "id": dr_id,
                    "status": "final",
                    "code": {"text": rec.title},
                    "subject": {"reference": patient_ref},
                    "effectiveDateTime": rec.record_date.isoformat(),
                    "result": obs_refs,
                }
                dr_urn = f"urn:uuid:{dr_id}"
                entries.append({"fullUrl": dr_urn, "resource": diag_rep_resource})
                rec_entry_refs.append({"reference": dr_urn})

            # Composition (Document Summary)
            comp_id = f"comp-{uuid.uuid4().hex[:8]}"
            comp_resource = {
                "resourceType": "Composition",
                "id": comp_id,
                "status": "final",
                "type": {"text": rec.record_type.upper()},
                "title": rec.title,
                "date": rec.record_date.isoformat(),
                "subject": {"reference": patient_ref},
                "author": [{"display": rec.source_facility or "Self-documented"}],
                "section": [{
                    "title": rec.title,
                    "entry": rec_entry_refs,
                }],
            }
            entries.append({"fullUrl": f"urn:uuid:{comp_id}", "resource": comp_resource})

        bundle = {
            "resourceType": "Bundle",
            "type": "collection",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "meta": {
                "tag": [{
                    "system": "https://nrces.in/ndhm/fhir/r4",
                    "code": "ABDM-FHIR-R4",
                    "display": "ABDM-Compliant Health Record Bundle"
                }]
            },
            "total_resources": len(entries),
            "entry": entries,
        }
        return bundle


fhir_service = FHIRService()
