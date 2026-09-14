"""
End-to-end workflow test: register -> create assessment -> generate routine ->
log progress -> generate reminders -> check notifications -> export reports.
Exercises the integration across modules 3 (assessment), 4 (routine),
8 (progress), 9 (dashboard), 10 (notifications), and 11 (reports).
"""


def test_full_user_workflow(client, auth_headers):
    # 1. Create a skin assessment (module 3)
    resp = client.post("/api/assessment", json={"notes": "First check-in", "concerns": ["acne"]}, headers=auth_headers)
    assert resp.status_code == 201
    assessment = resp.json()
    assert assessment["skin_health_score"] >= 0

    # 2. Generate a routine from that assessment (module 4)
    resp = client.post("/api/routine/generate", params={"routine_type": "morning"}, headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) > 0

    # 3. Log progress (module 8) — should not error, and may raise a progress alert
    resp = client.post("/api/progress", json={"routine_adherence_pct": 40, "skin_health_score": 55}, headers=auth_headers)
    assert resp.status_code == 201

    # 4. User dashboard reflects the new data (module 9)
    resp = client.get("/api/dashboard/user", headers=auth_headers)
    assert resp.status_code == 200

    # 5. Generate reminders and confirm notifications list works (module 10)
    resp = client.post("/api/notifications/generate-reminders", headers=auth_headers)
    assert resp.status_code == 200
    resp = client.get("/api/notifications", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    # 6. Export reports as both PDF and Excel (module 11)
    for report in ("skin-assessment", "routine", "product-recommendations", "progress", "skin-health"):
        for fmt in ("pdf", "excel"):
            resp = client.get(f"/api/reports/{report}", params={"format": fmt}, headers=auth_headers)
            assert resp.status_code == 200, f"{report} ({fmt}) failed: {resp.text}"
            assert len(resp.content) > 0


def test_invalid_report_format_rejected(client, auth_headers):
    resp = client.get("/api/reports/progress", params={"format": "docx"}, headers=auth_headers)
    assert resp.status_code == 400
