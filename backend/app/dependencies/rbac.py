from typing import List
from fastapi import Depends
from app.models import User
from app.exceptions import PermissionDeniedException
from app.dependencies.auth import get_current_user

class RoleChecker:
    """Dependency validator enforcing role access constraints on FastAPI endpoints."""
    def __init__(self, allowed_roles: List[str]):
        # Normalize all roles to uppercase to avoid styling mismatch issues
        self.allowed_roles = [r.upper().strip() for r in allowed_roles]

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role.upper().strip()
        if user_role not in self.allowed_roles:
            raise PermissionDeniedException(
                f"Role '{user_role}' does not possess clearance permissions. Authorized roles: {self.allowed_roles}"
            )
        return current_user
