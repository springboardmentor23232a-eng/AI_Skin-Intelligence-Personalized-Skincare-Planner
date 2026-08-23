from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token
from app.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

ALLOWED_SELF_SIGNUP_ROLES = {"user", "consultant", "dermatologist"}


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    role = payload.role if payload.role in ALLOWED_SELF_SIGNUP_ROLES else "user"

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=role,
        phone=payload.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role})
    return schemas.Token(access_token=token, role=user.role, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled.")

    token = create_access_token({"sub": user.id, "role": user.role})
    return schemas.Token(access_token=token, role=user.role, user=schemas.UserOut.model_validate(user))


@router.post("/google", response_model=schemas.Token)
def google_oauth_login(payload: schemas.GoogleOAuthIn, db: Session = Depends(get_db)):
    """
    Verifies a Google ID token (obtained client-side via Google Identity Services)
    and logs the user in, creating an account on first login.
    """
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests
    from app.config import settings

    try:
        idinfo = google_id_token.verify_oauth2_token(
            payload.id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google ID token.")

    email = idinfo.get("email")
    google_id = idinfo.get("sub")
    full_name = idinfo.get("name", email.split("@")[0])

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            full_name=full_name, email=email, google_id=google_id, role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_id:
        user.google_id = google_id
        db.commit()

    token = create_access_token({"sub": user.id, "role": user.role})
    return schemas.Token(access_token=token, role=user.role, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
