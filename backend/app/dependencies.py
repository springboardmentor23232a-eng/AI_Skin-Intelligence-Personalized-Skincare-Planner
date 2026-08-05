import os
from dotenv import load_dotenv
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Callable

from app.database import get_db
from app import models

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_jwt_key_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()

    if user is None:
        raise credentials_exception

    return user


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Role-Based Access Control (RBAC) Dependency Factory.
    - ADMIN role has complete access to ALL endpoints platform-wide.
    - Other roles are restricted to their authorized allowed_roles.
    - If unauthorized, returns HTTP 403 Forbidden with Access Denied message.
    """
    def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        user_role = (current_user.role or "USER").upper()
        normalized_allowed = [r.upper() for r in allowed_roles]

        # Administrator has complete access to the entire platform without restriction
        if user_role == "ADMIN" or "ADMIN" in normalized_allowed:
            return current_user

        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Role '{user_role}' is not authorized to access this resource."
            )

        return current_user

    return role_checker