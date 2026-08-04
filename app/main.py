import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()


from app.database import Base, engine, get_db, SessionLocal
from app.models import Admin, Assignment, Consultant, User, SkinProfile

# Automatically create PostgreSQL tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not automatically create PostgreSQL tables: {e}")

# Migrate existing tables: add `name` column if missing
try:
    with engine.connect() as conn:
        conn.execute(
            __import__('sqlalchemy').text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT ''"
            )
        )
        conn.execute(
            __import__('sqlalchemy').text(
                "ALTER TABLE consultants ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT ''"
            )
        )
        conn.commit()
except Exception as e:
    print(f"Warning: Could not migrate name column: {e}")

# Migrate skin_profiles: widen environmental_exposure column if it exists
try:
    with engine.connect() as conn:
        conn.execute(
            __import__('sqlalchemy').text(
                "ALTER TABLE skin_profiles ALTER COLUMN environmental_exposure TYPE VARCHAR(500)"
            )
        )
        conn.commit()
except Exception as e:
    print(f"Note: skin_profiles migration skipped (table may not exist yet): {e}")

# Ensure assignments table exists
try:
    Base.metadata.create_all(bind=engine, tables=[Assignment.__table__])
except Exception as e:
    print(f"Note: assignments table creation skipped: {e}")

SECRET_KEY = os.getenv("SECRET_KEY","fallback-insecure-key-for-development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 5

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "Frontend"
INDEX_FILE = FRONTEND_DIR / "index.html"

app = FastAPI(title="Skincare Planner API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


class RegisterRequest(BaseModel):
    name: Optional[str] = ""
    email: str
    password: str
    role: str


class GoogleOAuthRequest(BaseModel):
    credential: str
    role: str
    name: Optional[str] = ""


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPayload(BaseModel):
    email: str
    role: str


class UserProfileResponse(BaseModel):
    id: int
    name: Optional[str] = ""
    email: str
    role: str
    created_at: Optional[datetime] = None


class StatusResponse(BaseModel):
    status: str


class SkinProfileResponse(BaseModel):
    id: int
    user_id: int
    skin_type: Optional[str] = ""
    age_group: Optional[str] = ""
    skin_concerns: Optional[str] = ""
    allergies: Optional[str] = ""
    sensitivities: Optional[str] = ""
    lifestyle_habits: Optional[str] = ""
    sleep_quality: Optional[str] = ""
    water_intake: Optional[str] = ""
    environmental_exposure: Optional[str] = ""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SkinProfileUpdate(BaseModel):
    skin_type: Optional[str] = ""
    age_group: Optional[str] = ""
    skin_concerns: Optional[str] = ""
    allergies: Optional[str] = ""
    sensitivities: Optional[str] = ""
    lifestyle_habits: Optional[str] = ""
    sleep_quality: Optional[str] = ""
    water_intake: Optional[str] = ""
    environmental_exposure: Optional[str] = ""


class AssignRequest(BaseModel):
    user_id: int
    consultant_id: int



# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_model_for_role(role: str):
    """Return the SQLAlchemy model class for a given role string."""
    mapping = {"user": User, "consultant": Consultant, "admin": Admin}
    return mapping.get(role.lower())


def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)





def seed_admin() -> None:
    """Create the seed admin from .env if they don't already exist."""
    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "").strip()
    if not admin_email or not admin_password:
        print("Warning: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed.")
        return
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.email == admin_email).first()
        if not existing:
            hashed = pwd_context.hash(admin_password)
            admin = Admin(email=admin_email, password_hash=hashed)
            db.add(admin)
            db.commit()
            print(f"Seed admin created: {admin_email}")
        else:
            print(f"Seed admin already exists: {admin_email}")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def on_startup() -> None:
    seed_admin()


# ---------------------------------------------------------------------------
# Auth dependencies
# ---------------------------------------------------------------------------

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> UserPayload:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")
        if not email or not role:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return UserPayload(email=email, role=role)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


async def require_admin(current_user: UserPayload = Depends(get_current_user)) -> UserPayload:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


# ---------------------------------------------------------------------------
# Static root
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
async def root() -> FileResponse:
    return FileResponse(INDEX_FILE)


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------

@app.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    clean_email = request.email.strip().lower()
    clean_role = request.role.strip().lower()

    model = get_model_for_role(clean_role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    try:
        db_user = db.query(model).filter(model.email == clean_email).first()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(exc)}",
        ) from exc

    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Google OAuth users cannot log in with a password
    if db_user.password_hash == "google-oauth":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="This account uses Google Sign-In. Please use Google to log in.")

    try:
        password_valid = pwd_context.verify(request.password, db_user.password_hash)
    except Exception:
        password_valid = False

    if not password_valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(db_user.email, clean_role)
    return TokenResponse(access_token=token)


@app.post("/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    clean_email = request.email.strip().lower()
    clean_role = request.role.strip().lower()

    if clean_role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin self-registration is not allowed",
        )

    if not clean_email or not request.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and password required")

    model = get_model_for_role(clean_role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    try:
        existing = db.query(model).filter(model.email == clean_email).first()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(exc)}",
        ) from exc

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    hashed_password = pwd_context.hash(request.password)
    clean_name = request.name.strip() if request.name else ""
    new_record = model(name=clean_name, email=clean_email, password_hash=hashed_password, status="pending")
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    token = create_access_token(new_record.email, clean_role)
    return TokenResponse(access_token=token)


@app.post("/auth/google", response_model=TokenResponse)
async def google_login(request: GoogleOAuthRequest, db: Session = Depends(get_db)) -> TokenResponse:
    clean_role = request.role.strip().lower()
    if not request.credential:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google credential token is required")

    google_client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    try:
        id_info = id_token.verify_oauth2_token(
            request.credential,
            google_requests.Request(),
            google_client_id if google_client_id else None
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Google token: {str(exc)}") from exc

    email = (id_info.get("email") or "").strip().lower()
    google_name = (id_info.get("name") or "").strip()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google account email not available")

    model = get_model_for_role(clean_role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    try:
        existing = db.query(model).filter(model.email == email).first()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(exc)}",
        ) from exc

    if not existing:
        if clean_role == "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin accounts cannot be created via Google Sign-In",
            )
        new_record = model(name=google_name, email=email, password_hash="google-oauth", status="pending")
        db.add(new_record)
        db.commit()
        db.refresh(new_record)

    token = create_access_token(email, clean_role)
    return TokenResponse(access_token=token)





@app.get("/auth/me", response_model=UserPayload)
async def get_me(current_user: UserPayload = Depends(get_current_user)) -> UserPayload:
    return current_user


@app.get("/auth/status", response_model=StatusResponse)
async def get_status(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StatusResponse:
    if current_user.role == "admin":
        return StatusResponse(status="approved")

    model = get_model_for_role(current_user.role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    record = db.query(model).filter(model.email == current_user.email).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    return StatusResponse(status=record.status)


@app.get("/auth/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    model = get_model_for_role(current_user.role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    record = db.query(model).filter(model.email == current_user.email).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User record not found in database")

    return UserProfileResponse(
        id=record.id,
        name=getattr(record, "name", "") or "",
        email=record.email,
        role=current_user.role,
        created_at=record.created_at,
    )


@app.get("/user/profile", response_model=SkinProfileResponse)
async def get_user_skin_profile(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SkinProfileResponse:
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can access skin profiles",
        )
    
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_record.id).first()
    if not profile:
        profile = SkinProfile(user_id=user_record.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile


@app.post("/user/profile", response_model=SkinProfileResponse)
async def update_user_skin_profile(
    profile_update: SkinProfileUpdate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SkinProfileResponse:
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can update skin profiles",
        )
    
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_record.id).first()
    if not profile:
        profile = SkinProfile(user_id=user_record.id)
        db.add(profile)
    
    # Update fields
    profile.skin_type = profile_update.skin_type
    profile.age_group = profile_update.age_group
    profile.skin_concerns = profile_update.skin_concerns
    profile.allergies = profile_update.allergies
    profile.sensitivities = profile_update.sensitivities
    profile.lifestyle_habits = profile_update.lifestyle_habits
    profile.sleep_quality = profile_update.sleep_quality
    profile.water_intake = profile_update.water_intake
    profile.environmental_exposure = profile_update.environmental_exposure
    
    db.commit()
    db.refresh(profile)
    return profile



# ---------------------------------------------------------------------------
# Admin approval endpoints
# ---------------------------------------------------------------------------

@app.get("/admin/pending")
async def get_pending(
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    pending_users = db.query(User).filter(User.status == "pending").all()
    pending_consultants = db.query(Consultant).filter(Consultant.status == "pending").all()
    return {
        "users": [
            {
                "id": u.id,
                "name": u.name or "",
                "email": u.email,
                "role": "user",
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in pending_users
        ],
        "consultants": [
            {
                "id": c.id,
                "name": c.name or "",
                "email": c.email,
                "role": "consultant",
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in pending_consultants
        ],
    }


@app.get("/admin/all")
async def get_all_accounts(
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    all_users = db.query(User).all()
    all_consultants = db.query(Consultant).all()
    return {
        "users": [
            {
                "id": u.id,
                "name": u.name or "",
                "email": u.email,
                "status": u.status,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in all_users
        ],
        "consultants": [
            {
                "id": c.id,
                "name": c.name or "",
                "email": c.email,
                "status": c.status,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in all_consultants
        ],
    }


@app.post("/admin/approve/{role}/{account_id}")
async def approve_account(
    role: str,
    account_id: int,
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    model = get_model_for_role(role)
    if not model or role == "admin":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    record = db.query(model).filter(model.id == account_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    record.status = "approved"
    db.commit()
    return {"message": f"{role.capitalize()} approved successfully"}


@app.post("/admin/reject/{role}/{account_id}")
async def reject_account(
    role: str,
    account_id: int,
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    model = get_model_for_role(role)
    if not model or role == "admin":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    record = db.query(model).filter(model.id == account_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    db.delete(record)
    db.commit()
    return {"message": f"{role.capitalize()} account rejected and deleted successfully"}


# ---------------------------------------------------------------------------
# Admin allocation endpoints
# ---------------------------------------------------------------------------

@app.post("/admin/assign")
async def assign_user_to_consultant(
    req: AssignRequest,
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.status != "approved":
        user.status = "approved"

    consultant = db.query(Consultant).filter(Consultant.id == req.consultant_id).first()
    if not consultant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultant not found")
    if consultant.status != "approved":
        consultant.status = "approved"

    existing = (
        db.query(Assignment)
        .filter(Assignment.user_id == req.user_id, Assignment.consultant_id == req.consultant_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This user is already assigned to this consultant")

    assignment = Assignment(user_id=req.user_id, consultant_id=req.consultant_id)
    db.add(assignment)
    db.commit()
    return {"message": "User assigned to consultant successfully"}


@app.delete("/admin/unassign/{user_id}/{consultant_id}")
async def unassign_user_from_consultant(
    user_id: int,
    consultant_id: int,
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    assignment = (
        db.query(Assignment)
        .filter(Assignment.user_id == user_id, Assignment.consultant_id == consultant_id)
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    db.delete(assignment)
    db.commit()
    return {"message": "Assignment removed successfully"}


@app.get("/admin/assignments")
async def get_all_assignments(
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    assignments = db.query(Assignment).all()
    result = []
    for a in assignments:
        user = db.query(User).filter(User.id == a.user_id).first()
        consultant = db.query(Consultant).filter(Consultant.id == a.consultant_id).first()
        result.append({
            "id": a.id,
            "user_id": a.user_id,
            "user_name": (user.name or user.email) if user else "—",
            "user_email": user.email if user else "—",
            "consultant_id": a.consultant_id,
            "consultant_name": (consultant.name or consultant.email) if consultant else "—",
            "consultant_email": consultant.email if consultant else "—",
            "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
        })
    return {"assignments": result}


# ---------------------------------------------------------------------------
# Consultant — my assigned clients
# ---------------------------------------------------------------------------

@app.get("/consultant/my-clients")
async def get_my_clients(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    if current_user.role != "consultant":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Consultant access required")

    consultant = db.query(Consultant).filter(Consultant.email == current_user.email).first()
    if not consultant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultant not found")

    assignments = db.query(Assignment).filter(Assignment.consultant_id == consultant.id).all()
    clients = []
    for a in assignments:
        user = db.query(User).filter(User.id == a.user_id).first()
        if not user:
            continue
        profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
        clients.append({
            "id": user.id,
            "name": user.name or "",
            "email": user.email,
            "skin_type": profile.skin_type if profile else "",
            "age_group": profile.age_group if profile else "",
            "skin_concerns": profile.skin_concerns if profile else "",
            "allergies": profile.allergies if profile else "",
            "sensitivities": profile.sensitivities if profile else "",
            "lifestyle_habits": profile.lifestyle_habits if profile else "",
            "sleep_quality": profile.sleep_quality if profile else "",
            "water_intake": profile.water_intake if profile else "",
            "environmental_exposure": profile.environmental_exposure if profile else "",
        })
    return {"clients": clients}


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
