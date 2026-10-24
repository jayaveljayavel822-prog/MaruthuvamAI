def test_emergency_triage_detection(client, auth_headers):
    resp = client.post(
        "/api/v1/triage/assess",
        headers=auth_headers,
        json={
            "symptom_text": "Sudden severe crushing chest pain radiating to left arm and cannot breathe properly",
            "selected_symptom_ids": [],
            "severity": "severe",
            "is_worsening_quickly": True,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["urgency_level"] == "emergency"
    assert data["level_code"] == 2
    assert "EMERGENCY" in data["title"]
    assert any(c["number"] == "108" for c in data["emergency_contacts"])
    assert any(c["number"] == "112" for c in data["emergency_contacts"])


def test_routine_triage_detection(client, auth_headers):
    resp = client.post(
        "/api/v1/triage/assess",
        headers=auth_headers,
        json={
            "symptom_text": "Mild running nose and slight dry cough since yesterday",
            "selected_symptom_ids": [],
            "severity": "mild",
            "is_worsening_quickly": False,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["urgency_level"] == "routine"
    assert data["level_code"] == 0
