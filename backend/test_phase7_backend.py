import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app
import time

client = TestClient(app)


def test_phase7():
    print("=" * 65)
    print("      PHASE 7 NOTIFICATIONS, REMINDERS & EXPORT VERIFICATION SUITE      ")
    print("=" * 65)

    timestamp = int(time.time() * 1000)
    user_email = f"phase7_user_{timestamp}@skincare.com"
    admin_email = f"phase7_admin_{timestamp}@skincare.com"
    pwd = "Password123!"

    # 1. Register User & Admin
    res_user = client.post("/api/auth/register", json={
        "full_name": "Phase 7 User",
        "email": user_email,
        "password": pwd,
        "role": "USER"
    })
    assert res_user.status_code == 201
    headers = {"Authorization": f"Bearer {res_user.json()['access_token']}"}

    res_admin = client.post("/api/auth/register", json={
        "full_name": "Phase 7 Admin",
        "email": admin_email,
        "password": pwd,
        "role": "ADMIN"
    })
    assert res_admin.status_code == 201
    admin_headers = {"Authorization": f"Bearer {res_admin.json()['access_token']}"}

    print("[OK] Step 1: User & Admin Registered for Phase 7")

    # 2. Get Reminder Settings (Seeds default 4 reminders)
    rem_res = client.get("/api/reminders/settings", headers=headers)
    assert rem_res.status_code == 200
    reminders = rem_res.json()
    assert len(reminders) == 4
    print(f"[OK] Step 2: Reminder Settings Seeded ({len(reminders)} preferences active)")

    # 3. Update Reminder Settings
    update_rem_res = client.post("/api/reminders/settings", json=[
        {"reminder_type": "ROUTINE_MORNING", "enabled": True, "time_of_day": "07:30", "recurrence": "DAILY"},
        {"reminder_type": "HYDRATION", "enabled": True, "time_of_day": "12:00", "recurrence": "DAILY"}
    ], headers=headers)
    assert update_rem_res.status_code == 200
    print("[OK] Step 3: Reminder Preferences Updated Successfully")

    # 4. Trigger Automated Reminder Engine
    trig_res = client.post("/api/reminders/trigger", headers=headers)
    assert trig_res.status_code == 200
    gen_count = len(trig_res.json()["reminders"])
    print(f"[OK] Step 4: Reminder Engine Triggered ({gen_count} fresh notifications generated)")

    # 5. Fetch Notifications Center List
    notif_res = client.get("/api/notifications", headers=headers)
    assert notif_res.status_code == 200
    notif_data = notif_res.json()
    assert notif_data["unread_count"] >= 3
    first_notif_id = notif_data["notifications"][0]["id"]
    print(f"[OK] Step 5: Notification Center List Fetched (Unread: {notif_data['unread_count']})")

    # 6. Mark Single & All Notifications as Read
    read_res = client.put(f"/api/notifications/{first_notif_id}/read", headers=headers)
    assert read_res.status_code == 200

    read_all_res = client.post("/api/notifications/read-all", headers=headers)
    assert read_all_res.status_code == 200

    check_notif = client.get("/api/notifications", headers=headers)
    assert check_notif.json()["unread_count"] == 0
    print("[OK] Step 6: Marked Notifications Read (Unread count reduced to 0)")

    # 7. Delete Notification
    del_res = client.delete(f"/api/notifications/{first_notif_id}", headers=headers)
    assert del_res.status_code == 200
    print("[OK] Step 7: Notification Item Deleted")

    # 8. Fetch Skin Health Report Summary
    report_res = client.get("/api/reports/summary", headers=headers)
    assert report_res.status_code == 200
    rep = report_res.json()
    assert rep["patient"]["email"] == user_email
    print(f"[OK] Step 8: Patient Report Summary JSON Generated for '{rep['patient']['full_name']}'")

    # 9. Test Exports (CSV, XLSX, PDF)
    csv_res = client.get("/api/reports/export?format=csv", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "=== AI SKIN INTELLIGENCE PLATFORM REPORT ===" in csv_res.text
    print("[OK] Step 9a: CSV Data Stream Export Verified")

    xlsx_res = client.get("/api/reports/export?format=xlsx", headers=headers)
    assert xlsx_res.status_code == 200
    assert "application/vnd.ms-excel" in xlsx_res.headers["content-type"]
    print("[OK] Step 9b: Excel (.xlsx) Document Stream Export Verified")

    pdf_res = client.get("/api/reports/export?format=pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert "application/pdf" in pdf_res.headers["content-type"]
    print("[OK] Step 9c: Clinical PDF Report Stream Export Verified")

    # 10. Test Admin Summary Report API
    admin_summary = client.get("/api/reports/admin/summary", headers=admin_headers)
    assert admin_summary.status_code == 200
    assert admin_summary.json()["system_status"] == "OPERATIONAL"
    print(f"[OK] Step 10: Admin Summary Report Verified (Users: {admin_summary.json()['platform_statistics']['total_registered_users']})")

    print("\n" + "=" * 65)
    print("   ALL PHASE 7 NOTIFICATION, REMINDER & EXPORT TESTS PASSED 100%   ")
    print("=" * 65)


if __name__ == "__main__":
    test_phase7()
