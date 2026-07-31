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
from app.models import Admin, Consultant, User

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

SECRET_KEY = "[ENCRYPTION_KEY]"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
    email: str
    role: str
    created_at: Optional[datetime] = None


class StatusResponse(BaseModel):
    status: str


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

    if not db_user or not pwd_context.verify(request.password, db_user.password_hash):
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
        email=record.email,
        role=current_user.role,
        created_at=record.created_at,
    )


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


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
