"""
Local Database Reset Script
AI Skin Intelligence & Personalized Skincare Planner
====================================================
Safely resets all user accounts, sessions, skin assessments, routines,
progress logs, consultations, and audit logs from the local database.
Preserves:
- Database schema and Alembic migration state (alembic_version)
- Core catalog tables (ingredients, products)
"""

import sys
import os

# Ensure backend directory is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.session import SessionLocal, engine
from app.models import (
    User, SkinProfile, SkinAssessment, SkincareRoutine,
    Ingredient, IngredientCompatibilityCheck, Product,
    ProductRecommendation, SkincareLog, SkinProgressPhoto,
    Consultation, ClinicalReview, Notification, ReminderSetting,
    ImageAnalysis, AdminAuditLog, EmailVerificationToken,
    PhoneOtpVerification
)

def reset_local_database():
    db = SessionLocal()
    print("=" * 60)
    print("AI SKIN INTELLIGENCE - LOCAL APPLICATION DATA RESET")
    print("=" * 60)
    print(f"Database Engine: {engine.name}")
    print("Capturing before-reset counts...")

    before_counts = {
        "users": db.query(User).count(),
        "skin_profiles": db.query(SkinProfile).count(),
        "skin_assessments": db.query(SkinAssessment).count(),
        "skincare_routines": db.query(SkincareRoutine).count(),
        "product_recommendations": db.query(ProductRecommendation).count(),
        "skincare_logs": db.query(SkincareLog).count(),
        "skin_progress_photos": db.query(SkinProgressPhoto).count(),
        "consultations": db.query(Consultation).count(),
        "clinical_reviews": db.query(ClinicalReview).count(),
        "notifications": db.query(Notification).count(),
        "reminder_settings": db.query(ReminderSetting).count(),
        "image_analyses": db.query(ImageAnalysis).count(),
        "admin_audit_logs": db.query(AdminAuditLog).count(),
        "email_tokens": db.query(EmailVerificationToken).count(),
        "phone_otps": db.query(PhoneOtpVerification).count(),
        "ingredient_checks": db.query(IngredientCompatibilityCheck).count(),
        "catalog_ingredients": db.query(Ingredient).count(),
        "catalog_products": db.query(Product).count(),
    }

    for entity, count in before_counts.items():
        print(f"  {entity}: {count}")

    print("\nExecuting reverse-dependency data purge...")
    try:
        # Delete user-owned rows in reverse dependency order
        deleted_audit = db.query(AdminAuditLog).delete(synchronize_session=False)
        deleted_reviews = db.query(ClinicalReview).delete(synchronize_session=False)
        deleted_consultations = db.query(Consultation).delete(synchronize_session=False)
        deleted_phone_otps = db.query(PhoneOtpVerification).delete(synchronize_session=False)
        deleted_email_tokens = db.query(EmailVerificationToken).delete(synchronize_session=False)
        deleted_analyses = db.query(ImageAnalysis).delete(synchronize_session=False)
        deleted_reminders = db.query(ReminderSetting).delete(synchronize_session=False)
        deleted_notifications = db.query(Notification).delete(synchronize_session=False)
        deleted_photos = db.query(SkinProgressPhoto).delete(synchronize_session=False)
        deleted_logs = db.query(SkincareLog).delete(synchronize_session=False)
        deleted_recommendations = db.query(ProductRecommendation).delete(synchronize_session=False)
        deleted_checks = db.query(IngredientCompatibilityCheck).delete(synchronize_session=False)
        deleted_routines = db.query(SkincareRoutine).delete(synchronize_session=False)
        deleted_assessments = db.query(SkinAssessment).delete(synchronize_session=False)
        deleted_profiles = db.query(SkinProfile).delete(synchronize_session=False)
        
        # Reset self-referencing blocked_by foreign keys before user deletion
        db.query(User).update({"blocked_by": None}, synchronize_session=False)
        deleted_users = db.query(User).delete(synchronize_session=False)

        db.commit()
        print("Database commit successful.")
    except Exception as e:
        db.rollback()
        print(f"Error resetting database: {e}")
        db.close()
        sys.exit(1)

    print("\nCapturing after-reset counts...")
    after_counts = {
        "users": db.query(User).count(),
        "skin_profiles": db.query(SkinProfile).count(),
        "skin_assessments": db.query(SkinAssessment).count(),
        "skincare_routines": db.query(SkincareRoutine).count(),
        "product_recommendations": db.query(ProductRecommendation).count(),
        "skincare_logs": db.query(SkincareLog).count(),
        "skin_progress_photos": db.query(SkinProgressPhoto).count(),
        "consultations": db.query(Consultation).count(),
        "clinical_reviews": db.query(ClinicalReview).count(),
        "notifications": db.query(Notification).count(),
        "reminder_settings": db.query(ReminderSetting).count(),
        "image_analyses": db.query(ImageAnalysis).count(),
        "admin_audit_logs": db.query(AdminAuditLog).count(),
        "email_tokens": db.query(EmailVerificationToken).count(),
        "phone_otps": db.query(PhoneOtpVerification).count(),
        "ingredient_checks": db.query(IngredientCompatibilityCheck).count(),
        "catalog_ingredients": db.query(Ingredient).count(),
        "catalog_products": db.query(Product).count(),
    }

    for entity, count in after_counts.items():
        status = "CLEARED (0)" if count == 0 and not entity.startswith("catalog") else f"PRESERVED ({count})"
        print(f"  {entity}: {status}")

    db.close()
    print("\nLocal database reset complete.")

if __name__ == "__main__":
    reset_local_database()
