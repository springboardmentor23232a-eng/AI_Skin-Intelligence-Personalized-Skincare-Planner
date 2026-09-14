import random
from datetime import datetime, date, timedelta
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import (
    User, 
    Routine, 
    RoutineItem, 
    RoutineProfile, 
    DailyChecklistLog, 
    SkinHealthScoreRecord,
    SkinAssessment,
    SkinConcern,
    Notification,
    NotificationPreference,
    UserProductTracker
)
from app.services import notification_service, email_service

client = TestClient(app)

def test_module10_complete_notifications_role_targeting_and_email_consent():
    rand_id = random.randint(100000, 999999)
    admin_email = f"admin_mail_{rand_id}@demo.com"
    consultant_email = f"consultant_mail_{rand_id}@demo.com"
    doctor_email = f"doctor_mail_{rand_id}@demo.com"
    user_email = f"user_mail_{rand_id}@demo.com"
    other_user_email = f"other_mail_{rand_id}@demo.com"

    print("\n===================================================================")
    print("RUNNING MODULE 10: NOTIFICATIONS, ROLE TARGETING & EMAIL CONSENT TEST")
    print("===================================================================")

    # 1. Register & Login Accounts for all 4 roles
    # Admin
    reg_admin = client.post("/api/auth/register", json={
        "name": f"Admin Mail {rand_id}",
        "email": admin_email,
        "password": "Password123!",
        "role": "ADMIN"
    })
    admin_id = reg_admin.json()["id"]
    login_admin = client.post("/api/auth/login", json={"email": admin_email, "password": "Password123!"})
    admin_token = login_admin.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Consultant
    reg_consultant = client.post("/api/auth/register", json={
        "name": f"Consultant Mail {rand_id}",
        "email": consultant_email,
        "password": "Password123!",
        "role": "CONSULTANT"
    })
    consultant_id = reg_consultant.json()["id"]
    login_consultant = client.post("/api/auth/login", json={"email": consultant_email, "password": "Password123!"})
    consultant_token = login_consultant.json()["access_token"]
    consultant_headers = {"Authorization": f"Bearer {consultant_token}"}

    # Doctor
    reg_doctor = client.post("/api/auth/register", json={
        "name": f"Doctor Mail {rand_id}",
        "email": doctor_email,
        "password": "Password123!",
        "role": "DOCTOR"
    })
    doctor_id = reg_doctor.json()["id"]
    login_doctor = client.post("/api/auth/login", json={"email": doctor_email, "password": "Password123!"})
    doctor_token = login_doctor.json()["access_token"]
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}

    # User
    reg_user = client.post("/api/auth/register", json={
        "name": f"User Mail {rand_id}",
        "email": user_email,
        "password": "Password123!",
        "role": "USER"
    })
    user_id = reg_user.json()["id"]
    login_user = client.post("/api/auth/login", json={"email": user_email, "password": "Password123!"})
    user_token = login_user.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # Other User
    reg_other = client.post("/api/auth/register", json={
        "name": f"Other User {rand_id}",
        "email": other_user_email,
        "password": "Password123!",
        "role": "USER"
    })
    other_id = reg_other.json()["id"]
    login_other = client.post("/api/auth/login", json={"email": other_user_email, "password": "Password123!"})
    other_token = login_other.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    print("--- 1. Accounts registered for ADMIN, CONSULTANT, DOCTOR, USER ---")

    # 2. Verify Default Preferences (Email consent = False by default)
    pref_res = client.get("/api/notifications/preferences", headers=user_headers)
    assert pref_res.status_code == 200
    pref_json = pref_res.json()
    assert pref_json["email_notifications_enabled"] is False, "Email notifications must default to FALSE for user privacy"
    assert pref_json["registered_email"] == user_email
    print("PASS: Default preferences verified (Email Notifications = OFF by default).")

    # 3. Test Email Consent Disabled Behavior (Email OFF)
    db = SessionLocal()
    try:
        # Create routine for user
        routine = Routine(user_id=user_id, is_user_modified=False)
        db.add(routine)
        db.flush()

        item_am = RoutineItem(
            routine_id=routine.id,
            routine_type="MORNING",
            category="CLEANSING",
            step_order=1,
            name="Gentle Cleanser",
            description="Cleansing",
            frequency="Daily",
            is_enabled=True
        )
        db.add(item_am)

        # Create scores with distinct timestamps
        t1 = datetime.utcnow() - timedelta(days=5)
        t2 = datetime.utcnow()
        s1 = SkinHealthScoreRecord(user_id=user_id, overall_score=72, condition_score=70.0, lifestyle_score=70.0, sleep_score=70.0, routine_score=70.0, hydration_score=70.0, calculated_at=t1)
        s2 = SkinHealthScoreRecord(user_id=user_id, overall_score=78, condition_score=75.0, lifestyle_score=80.0, sleep_score=80.0, routine_score=80.0, hydration_score=80.0, calculated_at=t2)
        db.add_all([s1, s2])

        # Create unreviewed assessment (for consultant test) and high-risk assessment (for doctor test)
        a1 = SkinAssessment(
            user_id=user_id,
            assessment_date=datetime.utcnow(),
            skin_health_score=78,
            overall_condition="Moderate Acne & Redness",
            notes="" # unreviewed
        )
        db.add(a1)
        db.flush()

        c1 = SkinConcern(
            assessment_id=a1.id,
            concern_name="Acne Vulgaris",
            severity=3.5,
            priority="HIGH"
        )
        db.add(c1)
        db.commit()
    finally:
        db.close()

    # Create Product Tracker
    client.post("/api/notifications/trackers", headers=user_headers, json={
        "product_name": "Hydrating Barrier Serum",
        "opened_on": (date.today() - timedelta(days=40)).isoformat(),
        "cycle_days": 45
    })

    print("\n--- 2. Testing Notifications with Email Consent OFF ---")
    user_notifs_off = client.get("/api/notifications", headers=user_headers).json()["notifications"]
    assert len(user_notifs_off) > 0, "In-app notifications must be created independently of email preference"
    for n in user_notifs_off:
        assert n["email_delivery_status"] == "NOT_REQUESTED", "When email is disabled, status must be NOT_REQUESTED"
        assert n["email_sent_at"] is None
    print("PASS: In-app notifications generated cleanly while email delivery was suppressed.")

    # 4. Enable Email Consent for User (Email ON)
    print("\n--- 3. Testing Notification with Email Consent ON ---")
    update_res = client.put("/api/notifications/preferences", headers=user_headers, json={
        "email_notifications_enabled": True,
        "email_routine_enabled": True,
        "email_hydration_enabled": True,
        "email_progress_enabled": True
    })
    assert update_res.status_code == 200
    assert update_res.json()["email_notifications_enabled"] is True

    # Trigger a specific notification for the user with email enabled
    db = SessionLocal()
    try:
        test_notif = notification_service.create_notification(
            user_id=user_id,
            type="ROUTINE",
            title="Evening Hydration Routine Due",
            message="Time to complete your PM barrier restoration routine.",
            priority="NORMAL",
            action_url="/dashboard/checklist",
            dedup_key=f"TEST_PM_EMAIL_{rand_id}",
            db=db
        )
        assert test_notif is not None
        assert test_notif.email_delivery_status == "SENT"
        assert test_notif.email_sent_at is not None
    finally:
        db.close()
    print("PASS: When email is enabled, notification was dispatched with email_delivery_status = 'SENT'.")

    # 5. Category-Level Opt-Out Test (Global Email ON + Specific Category OFF)
    print("\n--- 4. Testing Category-Level Opt-Out (Hydration Email OFF) ---")
    client.put("/api/notifications/preferences", headers=user_headers, json={
        "email_notifications_enabled": True,
        "email_hydration_enabled": False # Opted out of hydration emails
    })

    db = SessionLocal()
    try:
        hyd_notif = notification_service.create_notification(
            user_id=user_id,
            type="HYDRATION",
            title="Afternoon Water Check-in",
            message="Drink a glass of water to support skin hydration.",
            dedup_key=f"TEST_HYD_OPT_OUT_{rand_id}",
            db=db
        )
        assert hyd_notif is not None, "In-app notification must still be created"
        assert hyd_notif.email_delivery_status == "NOT_REQUESTED", "Email must be suppressed when category is disabled"
    finally:
        db.close()
    print("PASS: Category-level opt-out prevented email while in-app notification was preserved.")

    # 6. Role-Specific Notification & Email Separation
    print("\n--- 5. Testing Role Separation for Notifications & Emails ---")
    # Enable email for Consultant & Doctor
    client.put("/api/notifications/preferences", headers=consultant_headers, json={"email_notifications_enabled": True})
    client.put("/api/notifications/preferences", headers=doctor_headers, json={"email_notifications_enabled": True})
    client.put("/api/notifications/preferences", headers=admin_headers, json={"email_notifications_enabled": True})

    # Consultant check
    c_res = client.get("/api/notifications", headers=consultant_headers).json()["notifications"]
    c_types = {n["type"] for n in c_res}
    assert "CONSULTANT" in c_types
    assert "HYDRATION" not in c_types and "ROUTINE" not in c_types and "SLEEP" not in c_types
    print("PASS: CONSULTANT received consultant alerts & zero personal skincare alerts.")

    # Doctor check
    d_res = client.get("/api/notifications", headers=doctor_headers).json()["notifications"]
    d_types = {n["type"] for n in d_res}
    assert "DOCTOR" in d_types
    assert "HYDRATION" not in d_types and "ROUTINE" not in d_types and "SLEEP" not in d_types
    print("PASS: DOCTOR received clinical alerts & zero personal skincare alerts.")

    # Admin check
    a_res = client.get("/api/notifications", headers=admin_headers).json()["notifications"]
    a_types = {n["type"] for n in a_res}
    assert "ADMIN" in a_types
    assert "HYDRATION" not in a_types and "ROUTINE" not in a_types and "SLEEP" not in a_types
    print("PASS: ADMIN received telemetry alerts & zero personal skincare alerts.")

    # 7. Admin Broadcast Targeting & Email Preference Check
    print("\n--- 6. Testing Admin Broadcast & Independent Email Consent ---")
    # User email is ON, Other User email is OFF
    client.put("/api/notifications/preferences", headers=user_headers, json={"email_notifications_enabled": True, "email_platform_enabled": True})
    client.put("/api/notifications/preferences", headers=other_headers, json={"email_notifications_enabled": False})

    b_res = client.post("/api/admin/notifications/broadcast", headers=admin_headers, json={
        "title": "Clinical Maintenance Notice",
        "message": "Routine server updates tonight at 02:00 UTC.",
        "target_role": "USER"
    })
    assert b_res.status_code == 200

    u_broadcast = [n for n in client.get("/api/notifications?type=PLATFORM", headers=user_headers).json()["notifications"] if n["title"] == "Clinical Maintenance Notice"]
    o_broadcast = [n for n in client.get("/api/notifications?type=PLATFORM", headers=other_headers).json()["notifications"] if n["title"] == "Clinical Maintenance Notice"]
    
    assert len(u_broadcast) > 0
    assert len(o_broadcast) > 0
    assert u_broadcast[0]["email_delivery_status"] == "SENT", "User with email enabled should have email_delivery_status = 'SENT'"
    assert o_broadcast[0]["email_delivery_status"] == "NOT_REQUESTED", "User with email disabled should have email_delivery_status = 'NOT_REQUESTED'"
    print("PASS: Admin broadcast respected individual recipient email preferences independently.")

    # 8. Duplicate Prevention Test
    print("\n--- 7. Testing Deduplication for Notifications & Emails ---")
    db = SessionLocal()
    try:
        n1 = notification_service.create_notification(
            user_id=user_id,
            type="PLATFORM",
            title="Deduplication Verification Alert",
            message="This alert should never duplicate.",
            dedup_key=f"DEDUP_TEST_KEY_{rand_id}",
            db=db
        )
        n2 = notification_service.create_notification(
            user_id=user_id,
            type="PLATFORM",
            title="Deduplication Verification Alert",
            message="This alert should never duplicate.",
            dedup_key=f"DEDUP_TEST_KEY_{rand_id}",
            db=db
        )
        assert n1.id == n2.id, "Second call with same dedup_key must return identical existing notification"
    finally:
        db.close()
    print("PASS: Deterministic deduplication verified (Zero duplicate notifications or emails).")

    # 9. Email Transport Failure Safety Test
    print("\n--- 8. Testing Email Provider Failure Safety ---")
    with patch("app.services.email_service.send_notification_email", return_value=False):
        db = SessionLocal()
        try:
            fail_notif = notification_service.create_notification(
                user_id=user_id,
                type="PLATFORM",
                title="Simulated SMTP Outage Alert",
                message="Testing graceful transport failure handling.",
                dedup_key=f"FAIL_TEST_KEY_{rand_id}",
                db=db
            )
            assert fail_notif is not None, "In-app notification must still be created when email transport fails"
            assert fail_notif.email_delivery_status == "FAILED"
        finally:
            db.close()
    print("PASS: Email failure handled safely without interrupting in-app notifications or crashing.")

    # 10. Multi-Tenant User Isolation
    print("\n--- 9. Testing User Isolation on Email Preferences & Notifications ---")
    user_first_notif_id = user_notifs_off[0]["id"]
    unauth_read = client.put(f"/api/notifications/{user_first_notif_id}/read", headers=other_headers)
    assert unauth_read.status_code == 404
    unauth_del = client.delete(f"/api/notifications/{user_first_notif_id}", headers=other_headers)
    assert unauth_del.status_code == 404
    print("PASS: Multi-tenant user data isolation verified.")

    print("\n===================================================================")
    print("ALL MODULE 10 NOTIFICATIONS, ROLE TARGETING & EMAIL TESTS PASSED!")
    print("===================================================================\n")


def test_role_specific_settings_and_preferences():
    rand_id = random.randint(100000, 999999)
    admin_email = f"admin_role_{rand_id}@demo.com"
    consultant_email = f"consultant_role_{rand_id}@demo.com"
    doctor_email = f"doctor_role_{rand_id}@demo.com"
    user_email = f"user_role_{rand_id}@demo.com"

    print("\n===================================================================")
    print("RUNNING ROLE-SPECIFIC SETTINGS & PREFERENCES TESTS (1-10)")
    print("===================================================================")

    # 1. Setup accounts
    reg_admin = client.post("/api/auth/register", json={"name": "Admin Role", "email": admin_email, "password": "Password123!", "role": "ADMIN"})
    admin_token = client.post("/api/auth/login", json={"email": admin_email, "password": "Password123!"}).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    reg_consultant = client.post("/api/auth/register", json={"name": "Consultant Role", "email": consultant_email, "password": "Password123!", "role": "CONSULTANT"})
    consultant_token = client.post("/api/auth/login", json={"email": consultant_email, "password": "Password123!"}).json()["access_token"]
    consultant_headers = {"Authorization": f"Bearer {consultant_token}"}

    reg_doctor = client.post("/api/auth/register", json={"name": "Doctor Role", "email": doctor_email, "password": "Password123!", "role": "DOCTOR"})
    doctor_token = client.post("/api/auth/login", json={"email": doctor_email, "password": "Password123!"}).json()["access_token"]
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}

    reg_user = client.post("/api/auth/register", json={"name": "User Role", "email": user_email, "password": "Password123!", "role": "USER"})
    user_token = client.post("/api/auth/login", json={"email": user_email, "password": "Password123!"}).json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # Test 1: USER receives only USER notification preferences/categories
    user_pref = client.get("/api/notifications/preferences", headers=user_headers).json()
    assert user_pref["user_role"] == "USER"
    assert "routine_reminders_enabled" in user_pref
    assert "hydration_reminders_enabled" in user_pref
    assert "sleep_reminders_enabled" in user_pref
    assert "replenishment_reminders_enabled" in user_pref
    print("PASS 1: USER receives personal skincare preference categories.")

    # Test 2: CONSULTANT receives consultant preferences/categories
    cons_pref = client.get("/api/notifications/preferences", headers=consultant_headers).json()
    assert cons_pref["user_role"] == "CONSULTANT"
    assert "consultant_client_updates_enabled" in cons_pref
    assert "consultant_progress_enabled" in cons_pref
    assert "consultant_assessment_enabled" in cons_pref
    assert "consultant_routine_enabled" in cons_pref
    print("PASS 2: CONSULTANT receives consultant-specific preference categories.")

    # Test 3: DOCTOR/DERMATOLOGIST receives clinical preferences/categories
    doc_pref = client.get("/api/notifications/preferences", headers=doctor_headers).json()
    assert doc_pref["user_role"] in ["DOCTOR", "DERMATOLOGIST"]
    assert "doctor_patient_alerts_enabled" in doc_pref
    assert "doctor_assessment_enabled" in doc_pref
    assert "doctor_progress_enabled" in doc_pref
    assert "doctor_treatment_enabled" in doc_pref
    print("PASS 3: DOCTOR/DERMATOLOGIST receives clinical preference categories.")

    # Test 4: ADMIN receives admin/platform preferences/categories
    adm_pref = client.get("/api/notifications/preferences", headers=admin_headers).json()
    assert adm_pref["user_role"] == "ADMIN"
    assert "admin_system_alerts_enabled" in adm_pref
    assert "admin_user_alerts_enabled" in adm_pref
    assert "admin_analytics_alerts_enabled" in adm_pref
    assert "admin_recommendation_alerts_enabled" in adm_pref
    assert "admin_reports_alerts_enabled" in adm_pref
    print("PASS 4: ADMIN receives admin/platform preference categories.")

    # Test 5: USER-only Product Tracker is inaccessible to other roles (403 Forbidden)
    pt_user = client.get("/api/notifications/trackers", headers=user_headers)
    assert pt_user.status_code == 200, "USER must have access to Product Tracker"

    pt_doc_get = client.get("/api/notifications/trackers", headers=doctor_headers)
    assert pt_doc_get.status_code == 403, "DOCTOR must be forbidden from Product Tracker"

    pt_cons_get = client.get("/api/notifications/trackers", headers=consultant_headers)
    assert pt_cons_get.status_code == 403, "CONSULTANT must be forbidden from Product Tracker"

    pt_adm_get = client.get("/api/notifications/trackers", headers=admin_headers)
    assert pt_adm_get.status_code == 403, "ADMIN must be forbidden from Product Tracker"

    pt_doc_post = client.post("/api/notifications/trackers", headers=doctor_headers, json={
        "product_name": "Pro Cream",
        "opened_on": date.today().isoformat(),
        "cycle_days": 30
    })
    assert pt_doc_post.status_code == 403, "DOCTOR cannot create Product Tracker item"
    print("PASS 5: USER-only Product Tracker correctly returns 403 Forbidden for Doctor, Consultant, and Admin.")

    # Test 6: Changing one role's preferences does not modify another role's preferences
    client.put("/api/notifications/preferences", headers=doctor_headers, json={
        "doctor_patient_alerts_enabled": False,
        "email_notifications_enabled": True
    })
    doc_pref_after = client.get("/api/notifications/preferences", headers=doctor_headers).json()
    cons_pref_after = client.get("/api/notifications/preferences", headers=consultant_headers).json()
    user_pref_after = client.get("/api/notifications/preferences", headers=user_headers).json()

    assert doc_pref_after["doctor_patient_alerts_enabled"] is False
    assert doc_pref_after["email_notifications_enabled"] is True
    assert cons_pref_after["email_notifications_enabled"] is False
    assert user_pref_after["email_notifications_enabled"] is False
    print("PASS 6: Changing Doctor's preferences does not modify Consultant or User preferences.")

    # Test 7: Backend rejects attempts to submit another role's preference categories (400 Bad Request)
    bad_doc_update = client.put("/api/notifications/preferences", headers=doctor_headers, json={
        "hydration_reminders_enabled": False, # USER-only category
        "sleep_reminders_enabled": False
    })
    assert bad_doc_update.status_code == 400, "Backend must reject Doctor attempting to submit USER categories"
    assert "not permitted for role" in bad_doc_update.json()["detail"]

    bad_cons_update = client.put("/api/notifications/preferences", headers=consultant_headers, json={
        "doctor_patient_alerts_enabled": True # DOCTOR-only category
    })
    assert bad_cons_update.status_code == 400, "Backend must reject Consultant attempting to submit Doctor categories"

    bad_user_update = client.put("/api/notifications/preferences", headers=user_headers, json={
        "admin_system_alerts_enabled": True # ADMIN-only category
    })
    assert bad_user_update.status_code == 400, "Backend must reject User attempting to submit Admin categories"
    print("PASS 7: Backend strictly rejects cross-role preference updates with HTTP 400 Bad Request.")

    # Test 8: Email delivery follows role-specific filtering
    # Doctor enables email for doctor alerts
    client.put("/api/notifications/preferences", headers=doctor_headers, json={
        "email_notifications_enabled": True,
        "doctor_patient_alerts_enabled": True
    })
    db = SessionLocal()
    try:
        doc_notif = notification_service.create_notification(
            user_id=reg_doctor.json()["id"],
            type="DOCTOR",
            title="High-Risk Patient Alert",
            message="Severe cystic acne assessment submitted.",
            dedup_key=f"DOC_EMAIL_ALERT_{rand_id}",
            db=db
        )
        assert doc_notif.email_delivery_status == "SENT"
    finally:
        db.close()
    print("PASS 8: Email delivery respects role-specific categories for clinical notifications.")

    # Test 9: Notification bell/list follows role-specific filtering
    doc_notifs = client.get("/api/notifications", headers=doctor_headers).json()["notifications"]
    for n in doc_notifs:
        assert n["type"] in ["DOCTOR", "PLATFORM"], f"Doctor should only receive DOCTOR or PLATFORM notifications, got {n['type']}"
    print("PASS 9: Notification bell/list strictly respects role-specific filtering.")

    # Test 10: Admin targeted broadcasts reach only the selected role
    b_res = client.post("/api/admin/notifications/broadcast", headers=admin_headers, json={
        "title": "Doctor CME Seminar Announcement",
        "message": "Continuing education seminar on retinoid therapies.",
        "target_role": "DOCTOR"
    })
    assert b_res.status_code == 200

    doc_b = [n for n in client.get("/api/notifications?type=PLATFORM", headers=doctor_headers).json()["notifications"] if n["title"] == "Doctor CME Seminar Announcement"]
    user_b = [n for n in client.get("/api/notifications?type=PLATFORM", headers=user_headers).json()["notifications"] if n["title"] == "Doctor CME Seminar Announcement"]
    cons_b = [n for n in client.get("/api/notifications?type=PLATFORM", headers=consultant_headers).json()["notifications"] if n["title"] == "Doctor CME Seminar Announcement"]

    assert len(doc_b) > 0, "Doctor must receive DOCTOR-targeted broadcast"
    assert len(user_b) == 0, "User must NOT receive DOCTOR-targeted broadcast"
    assert len(cons_b) == 0, "Consultant must NOT receive DOCTOR-targeted broadcast"
    print("PASS 10: Admin targeted broadcast reached only DOCTOR role.")

    print("\n===================================================================")
    print("ALL 10 ROLE-SPECIFIC SETTINGS & PREFERENCES TESTS PASSED!")
    print("===================================================================\n")


if __name__ == "__main__":
    test_module10_complete_notifications_role_targeting_and_email_consent()
    test_role_specific_settings_and_preferences()

