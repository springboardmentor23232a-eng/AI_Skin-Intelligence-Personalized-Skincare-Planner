from typing import Optional
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserRegister
from app.exceptions import DuplicateEmailException, UserNotFoundException
from app.services.auth_service import hash_password

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Retrieves a user account by its auto-increment primary key ID."""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieves a user account by email address (case-insensitive)."""
    return db.query(User).filter(User.email == email.lower().strip()).first()

def create_local_user(db: Session, schema: UserRegister) -> User:
    """Registers a new email/password local user account in PostgreSQL."""
    # Check duplicate email
    existing_user = get_user_by_email(db, schema.email)
    if existing_user:
        raise DuplicateEmailException("An account with this email address already exists")
    
    # Hash password
    hashed_pwd = hash_password(schema.password)
    
    # Validate and clean role inputs (USER, CONSULTANT, DOCTOR, ADMIN)
    allowed_roles = {"USER", "CONSULTANT", "DOCTOR", "ADMIN"}
    role = schema.role.upper().strip() if schema.role else "USER"
    if role not in allowed_roles:
        role = "USER"
        
    db_user = User(
        name=schema.name.strip(),
        email=schema.email.lower().strip(),
        hashed_password=hashed_pwd,
        role=role,
        provider="LOCAL"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_or_create_google_user(db: Session, google_payload: dict) -> User:
    """Finds or registers a user account utilizing Google SSO payload."""
    email = google_payload.get("email", "").lower().strip()
    name = google_payload.get("name", "").strip()
    
    db_user = get_user_by_email(db, email)
    if db_user:
        # User already exists, return them (can be linked to Google)
        return db_user
    
    # Register new user account via Google
    db_user = User(
        name=name if name else "Google User",
        email=email,
        hashed_password=None, # Google accounts don't have local password hash
        role="USER",          # Default new Google registrations to USER role
        provider="GOOGLE"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile_name(db: Session, user_id: int, new_name: str) -> User:
    """Updates only the name attribute of the specified user profile."""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise UserNotFoundException("User profile not found")
        
    db_user.name = new_name.strip()
    db.commit()
    db.refresh(db_user)
    return db_user
