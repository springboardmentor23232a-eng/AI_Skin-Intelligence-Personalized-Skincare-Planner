import jwt
from typing import Dict, Any, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import JWT_SECRET, JWT_ALGORITHM

security_bearer = HTTPBearer(auto_error=False)

class AuthenticatedUser:
    def __init__(self, id: int, email: str, role: str, name: str = ""):
        self.id = id
        self.email = email
        self.role = role.upper() if role else "USER"
        self.name = name

    def is_admin(self) -> bool:
        return self.role == "ADMIN"

    def is_consultant(self) -> bool:
        return self.role in ["SKINCARE_CONSULTANT", "CONSULTANT", "ADMIN"]

    def is_dermatologist(self) -> bool:
        return self.role in ["DERMATOLOGIST", "ADMIN"]


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)) -> AuthenticatedUser:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="401 Unauthorized: Bearer authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("id")
        email = payload.get("email")
        role = payload.get("role", "USER")
        name = payload.get("name", "")

        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="401 Unauthorized: Invalid token payload missing user ID or email"
            )

        return AuthenticatedUser(id=int(user_id), email=email, role=role, name=name)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="401 Unauthorized: Token has expired"
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"401 Unauthorized: Invalid JWT signature - {str(e)}"
        )


def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: AuthenticatedUser = Depends(get_current_user)):
        normalized_allowed = [r.upper() for r in allowed_roles]
        if "ADMIN" not in normalized_allowed:
            normalized_allowed.append("ADMIN")

        if current_user.role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"403 Forbidden: Role '{current_user.role}' is not authorized to perform this operation"
            )
        return current_user
    return role_checker
