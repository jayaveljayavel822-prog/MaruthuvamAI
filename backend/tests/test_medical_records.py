from datetime import date


def test_medical_record_crud_and_cross_user_isolation(client, auth_headers, other_auth_headers):
    # 1. User A creates a record
    create_resp = client.post(
        "/api/v1/medical-records",
        headers=auth_headers,
        json={
            "title": "CBC Blood Test",
            "record_type": "lab",
            "record_date": date.today().isoformat(),
            "source_facility": "City Diagnostic Center",
            "raw_text": "Hb 12.5 g/dL",
            "structured_data": {"diagnoses": ["Mild Anemia"], "medications": [], "tests": []},
        },
    )
    assert create_resp.status_code == 201
    rec_id = create_resp.json()["id"]

    # 2. User A reads record
    get_resp = client.get(f"/api/v1/medical-records/{rec_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "CBC Blood Test"

    # 3. User B attempts to access User A's record -> DENIED (404 / Cross-user isolation)
    other_get = client.get(f"/api/v1/medical-records/{rec_id}", headers=other_auth_headers)
    assert other_get.status_code == 404

    # 4. User B attempts to delete User A's record -> DENIED
    other_del = client.delete(f"/api/v1/medical-records/{rec_id}", headers=other_auth_headers)
    assert other_del.status_code == 404

    # 5. User A deletes record -> SUCCEEDS
    del_resp = client.delete(f"/api/v1/medical-records/{rec_id}", headers=auth_headers)
    assert del_resp.status_code == 204


def test_ocr_extraction_pipeline(client, auth_headers):
    sample_rx = (
        "Rx: Tab Paracetamol 500mg 1-1-1 x 3 days\n"
        "Tab Azithromycin 500mg 1-0-0 x 3 days\n"
        "Doctor: Dr. Kumar, City Clinic"
    )
    resp = client.post(
        "/api/v1/medical-records/ocr",
        headers=auth_headers,
        data={"raw_text": sample_rx},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["record_type"] == "rx"
    assert len(data["medications"]) >= 2
    assert any("Paracetamol" in m["name"] for m in data["medications"])
    assert data["status"] == "review_required"
