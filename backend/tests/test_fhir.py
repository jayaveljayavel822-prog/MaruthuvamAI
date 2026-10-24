from datetime import date


def test_fhir_bundle_preview_and_export(client, auth_headers):
    # 1. Add a sample lab and prescription record
    client.post(
        "/api/v1/medical-records",
        headers=auth_headers,
        json={
            "title": "Hemoglobin Test",
            "record_type": "lab",
            "record_date": date.today().isoformat(),
            "structured_data": {
                "diagnoses": ["Microcytic Anemia"],
                "medications": [{"name": "Ferrous Ascorbate", "dosage": "100mg", "frequency": "Daily", "duration": "30 days"}],
                "tests": [{"name": "Hemoglobin", "value": 11.0, "unit": "g/dL", "low_ref": 13.0, "high_ref": 17.0, "flag": "LOW"}],
            },
        },
    )

    # 2. Preview FHIR bundle
    preview_resp = client.get("/api/v1/fhir/preview", headers=auth_headers)
    assert preview_resp.status_code == 200
    bundle = preview_resp.json()
    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "collection"
    assert bundle["total_resources"] >= 4

    resource_types = [e["resource"]["resourceType"] for e in bundle["entry"]]
    assert "Patient" in resource_types
    assert "Condition" in resource_types
    assert "MedicationRequest" in resource_types
    assert "Observation" in resource_types
    assert "Composition" in resource_types


def test_abha_link_and_import(client, auth_headers):
    link_resp = client.post("/api/v1/fhir/abha/link?abha_number=91-1234-5678-9012", headers=auth_headers)
    assert link_resp.status_code == 200
    assert link_resp.json()["status"] == "linked"

    import_resp = client.post("/api/v1/fhir/abha/import", headers=auth_headers)
    assert import_resp.status_code == 200
    assert import_resp.json()["records_imported"] == 2
