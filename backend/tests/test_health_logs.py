from datetime import date


def test_create_and_read_health_log(client, auth_headers):
    today_str = date.today().isoformat()
    # 1. Create health log
    create_resp = client.post(
        "/api/v1/health-logs",
        headers=auth_headers,
        json={
            "log_date": today_str,
            "water_glasses": 8,
            "sleep_hours": 7.5,
            "steps": 8500,
            "mood": 4,
            "notes": "Feeling energized and hydrated.",
        },
    )
    assert create_resp.status_code == 201
    log_id = create_resp.json()["id"]

    # 2. Duplicate log on same date updates entry (idempotency check)
    update_resp = client.post(
        "/api/v1/health-logs",
        headers=auth_headers,
        json={
            "log_date": today_str,
            "water_glasses": 9,
            "sleep_hours": 7.5,
            "steps": 9000,
            "mood": 5,
        },
    )
    assert update_resp.status_code == 201
    assert update_resp.json()["id"] == log_id
    assert update_resp.json()["water_glasses"] == 9

    # 3. Read dashboard summary reflection
    summary_resp = client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["health_score"] > 80
    assert any(m["key"] == "water" and m["value"] == 9 for m in summary["metrics"])


def test_dashboard_trends(client, auth_headers):
    resp = client.get("/api/v1/dashboard/trends?metric=water", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["metric_key"] == "water"
    assert len(data["days"]) == 7
