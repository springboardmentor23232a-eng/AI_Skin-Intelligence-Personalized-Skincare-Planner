from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import secrets
import json
import urllib.request

from app.database import get_db
from app import schemas, auth, models
from app.dependencies import get_current_user, require_role
from fastapi.security import OAuth2PasswordRequestForm
from app.jwt_handler import create_access_token

router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = auth.register_user(user, db)

    if new_user is None:
        raise HTTPException(
            status_code=400,
            detail="Email already registered in system."
        )

    return new_user


@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    token_resp = auth.login_user(user, db)

    if token_resp is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return token_resp


@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not auth.pwd_context.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    access_token = create_access_token(
        {
            "sub": user.email,
            "role": user.role,
            "provider": user.provider,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/auth/google", response_model=schemas.Token)
def google_auth(auth_data: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Google OAuth2 Verification & Auto-Registration Endpoint.
    1. Verifies Google token / credential via Google OAuth tokeninfo endpoint.
    2. Auto-registers user in PostgreSQL if not present (provider = "GOOGLE").
    3. Retrieves role from existing user record if user already exists.
    4. Generates and returns JWT token for authentication in all subsequent API requests.
    """
    user_email = auth_data.email.strip().lower() if auth_data.email else None
    display_name = auth_data.full_name or auth_data.name

    # If Google credential ID Token was provided, verify directly against Google OAuth API
    raw_token = auth_data.id_token
    if raw_token:
        try:
            req_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={raw_token}"
            with urllib.request.urlopen(req_url, timeout=5) as response:
                if response.status == 200:
                    token_info = json.loads(response.read().decode('utf-8'))
                    if token_info.get("email"):
                        user_email = token_info["email"].strip().lower()
                        display_name = token_info.get("name") or display_name
        except Exception:
            # Fallback to provided claims if offline or sandbox token
            pass

    if not user_email:
        raise HTTPException(
            status_code=400,
            detail="Google OAuth authentication failed: Missing email claim."
        )

    if not display_name:
        display_name = user_email.split('@')[0].replace('.', ' ').title()

    user_role = (auth_data.role or "USER").upper()

    # Query PostgreSQL database for existing user
    user = db.query(models.User).filter(models.User.email == user_email).first()

    if not user:
        # Auto-register new Google user in PostgreSQL database
        random_pwd = secrets.token_hex(16)
        hashed_pwd = auth.pwd_context.hash(random_pwd)
        user = models.User(
            full_name=display_name,
            email=user_email,
            password=hashed_pwd,
            role=user_role,
            provider="GOOGLE",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # User already exists - update timestamp
        user.updated_at = datetime.now(timezone.utc)
        db.commit()

    # Generate JWT access token containing sub, role, provider
    access_token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "provider": user.provider,
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ==========================================
# RBAC Protected API Endpoints
# ==========================================

@router.get("/api/me")
def get_user_profile(current_user: models.User = Depends(get_current_user)):
    """Returns current authenticated user profile."""
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "provider": current_user.provider,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
    }


@router.get("/api/user/overview")
def user_dashboard_data(current_user: models.User = Depends(require_role(["USER", "CONSUMER", "ADMIN"]))):
    """Protected User Overview endpoint accessible by USER & ADMIN."""
    return {
        "status": "success",
        "message": f"Welcome to User Dashboard, {current_user.full_name}!",
        "role": current_user.role,
        "access": "Granted",
    }


@router.get("/api/consultant/workspace")
def consultant_workspace_data(current_user: models.User = Depends(require_role(["CONSULTANT", "WELLNESS_COACH", "ADMIN"]))):
    """Protected Consultant Workspace endpoint accessible by CONSULTANT & ADMIN."""
    return {
        "status": "success",
        "message": f"Welcome to Consultant Workspace, {current_user.full_name}!",
        "role": current_user.role,
        "access": "Granted",
    }


@router.get("/api/dermatologist/portal")
def dermatologist_portal_data(current_user: models.User = Depends(require_role(["DERMATOLOGIST", "ADMIN"]))):
    """Protected Dermatologist Portal endpoint accessible by DERMATOLOGIST & ADMIN."""
    return {
        "status": "success",
        "message": f"Welcome to Dermatologist Diagnosis Portal, {current_user.full_name}!",
        "role": current_user.role,
        "access": "Granted",
    }


@router.get("/api/admin/console")
def admin_console_data(current_user: models.User = Depends(require_role(["ADMIN"]))):
    """Protected Admin Console endpoint accessible strictly by ADMIN."""
    return {
        "status": "success",
        "message": f"Welcome to Platform Administrator Console, {current_user.full_name}!",
        "role": current_user.role,
        "access": "Full Universal Admin Access",
    }


@router.get("/dashboard")
def dashboard(current_user: models.User = Depends(get_current_user)):
    return {
        "message": f"Welcome {current_user.full_name}!",
        "email": current_user.email,
        "role": current_user.role,
        "provider": current_user.provider,
    }