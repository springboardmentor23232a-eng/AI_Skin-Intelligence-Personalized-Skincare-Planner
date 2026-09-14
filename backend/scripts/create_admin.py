"""
Administrative Account Provisioning CLI
AI Skin Intelligence & Personalized Skincare Planner
====================================================
Securely provisions or synchronizes an administrator account in the
active database (PostgreSQL or SQLite).

Usage:
    python -m backend.scripts.create_admin [OPTIONS]
    python backend/scripts/create_admin.py [OPTIONS]

Options:
    --email TEXT        Administrator email address (default: admin@skincare.com)
    --password TEXT     Administrator password (or prompted securely)
    --full-name TEXT    Administrator display name (default: System Administrator)
"""

import sys
import os
import argparse
import getpass
from datetime import datetime

# Ensure project backend directory is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.db.session import SessionLocal
from app.models import User, AuthProvider, AdminAuditLog
from app.auth.service import hash_password


def provision_admin(email: str, password: str, full_name: str = "System Administrator") -> User:
    norm_email = email.strip().lower()
    if not norm_email or "@" not in norm_email:
        raise ValueError("A valid email address is required.")
    if not password or len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == norm_email).first()
        hashed = hash_password(password)
        now = datetime.utcnow()

        if user:
            action_desc = "UPDATED" if user.role == "ADMIN" else "PROMOTED_TO_ADMIN"
            user.role = "ADMIN"
            user.password = hashed
            user.full_name = full_name.strip() or user.full_name
            user.is_active = 1
            user.is_blocked = 0
            user.is_verified = 1
            user.email_verified = True
            user.email_verified_at = user.email_verified_at or now
            user.updated_at = now

            audit = AdminAuditLog(
                admin_user_id=user.id,
                target_user_id=user.id,
                action="ADMIN_PROVISION_CLI",
                previous_value="EXISTING",
                new_value="ADMIN",
                reason=f"Administrator account {norm_email} synchronized via provisioning CLI tool.",
                created_at=now
            )
            db.add(audit)
            db.commit()
            db.refresh(user)
            print(f"[OK] Administrator account {norm_email} successfully {action_desc} (ID: {user.id}).")
            return user
        else:
            new_admin = User(
                full_name=full_name.strip(),
                email=norm_email,
                password=hashed,
                role="ADMIN",
                provider=AuthProvider.LOCAL.value,
                is_active=1,
                is_blocked=0,
                is_verified=1,
                email_verified=True,
                email_verified_at=now,
                created_at=now,
                updated_at=now
            )
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)

            audit = AdminAuditLog(
                admin_user_id=new_admin.id,
                target_user_id=new_admin.id,
                action="ADMIN_CREATE_CLI",
                previous_value="NONE",
                new_value="ADMIN",
                reason=f"Administrator account {norm_email} created via provisioning CLI tool.",
                created_at=now
            )
            db.add(audit)
            db.commit()
            print(f"[OK] Administrator account {norm_email} successfully CREATED (ID: {new_admin.id}).")
            return new_admin
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="AI Skin Intelligence Admin Provisioning CLI")
    parser.add_argument("--email", default=os.environ.get("ADMIN_EMAIL", "admin@skincare.com"), help="Admin email")
    parser.add_argument("--password", default=os.environ.get("ADMIN_PASSWORD", ""), help="Admin password")
    parser.add_argument("--full-name", default=os.environ.get("ADMIN_FULL_NAME", "System Administrator"), help="Admin display name")

    args = parser.parse_args()

    password = args.password
    if not password:
        if sys.stdin.isatty():
            password = getpass.getpass("Enter administrator password (min 8 chars): ")
        else:
            print("[ERROR] Password must be supplied via --password argument or ADMIN_PASSWORD env variable.")
            sys.exit(1)

    try:
        provision_admin(args.email, password, args.full_name)
    except Exception as e:
        print(f"[ERROR] Provisioning failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
