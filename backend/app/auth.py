from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.jwt_handler import create_access_token
from app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def register_user(user: schemas.UserCreate, db: Session):

    # Normalize email to lowercase for consistent storage and lookup
    normalized_email = user.email.strip().lower()

    # Check if email already exists
    existing_user = db.query(models.User).filter(
        models.User.email == normalized_email
    ).first()

    if existing_user:
        return None

    # Hash the password using BCrypt
    hashed_password = pwd_context.hash(user.password)

    display_name = user.full_name or user.name or normalized_email.split('@')[0]
    
    # Store standard user role as "USER" (not "CONSUMER")
    requested_role = (user.role or "USER").upper()
    if requested_role in ["CONSUMER", "USER"]:
        user_role = "USER"
    elif requested_role == "ADMIN":
        user_role = "USER"
    else:
        user_role = requested_role

    # Create new user in PostgreSQL with provider = "LOCAL" and role = "USER"
    new_user = models.User(
        full_name=display_name,
        email=normalized_email,
        password=hashed_password,
        role=user_role,
        provider="LOCAL",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def login_user(user: schemas.UserLogin, db: Session):

    # Normalize email to lowercase for consistent lookup
    normalized_email = user.email.strip().lower()

    existing_user = db.query(models.User).filter(
        models.User.email == normalized_email
    ).first()

    if existing_user is None:
        return None

    if not pwd_context.verify(user.password, existing_user.password):
        return None

    # Always use the PostgreSQL database role for JWT generation & routing
    token = create_access_token(
        {
            "sub": existing_user.email,
            "role": existing_user.role,
            "provider": existing_user.provider,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": existing_user.role,
        "email": existing_user.email,
        "full_name": existing_user.full_name,
        "provider": existing_user.provider,
    }