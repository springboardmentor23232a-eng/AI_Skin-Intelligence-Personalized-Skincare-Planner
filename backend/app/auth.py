from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.jwt_handler import create_access_token
from app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def register_user(user: schemas.UserCreate, db: Session):

    # Check if email already exists
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        return None

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Determine full_name from full_name or name
    display_name = user.full_name or user.name or user.email.split('@')[0]
    user_role = (user.role or "USER").upper()
    user_provider = user.provider or "local"

    # Create new user
    new_user = models.User(
        full_name=display_name,
        email=user.email,
        password=hashed_password,
        role=user_role,
        provider=user_provider,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def login_user(user: schemas.UserLogin, db: Session):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user is None:
        return None

    if not pwd_context.verify(user.password, existing_user.password):
        return None

    token = create_access_token(
        {
            "sub": existing_user.email,
            "role": existing_user.role,
            "provider": existing_user.provider,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }