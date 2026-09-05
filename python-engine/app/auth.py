"""
Authentication middleware for Python FastAPI
Handles JWT token verification and user authentication
"""
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os
from datetime import datetime, timedelta
from typing import Optional

# Security scheme for JWT tokens
security = HTTPBearer()

# JWT Configuration (should match Node.js backend)
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Verify JWT token and return user information.
    
    Args:
        credentials: HTTP Authorization credentials containing Bearer token
        
    Returns:
        Dictionary containing user information (id, name, email, role)
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check if token has required fields
        user_id = payload.get("id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )
        
        # Return user information
        return {
            "id": str(user_id),
            "name": payload.get("name"),
            "email": payload.get("email"),
            "role": payload.get("role", "user")
        }
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Get current authenticated user from JWT token.
    Convenience wrapper for verify_token.
    
    Args:
        credentials: HTTP Authorization credentials
        
    Returns:
        Dictionary containing user information
    """
    return verify_token(credentials)


def require_role(*allowed_roles: str):
    """
    Role-based access control decorator.
    
    Args:
        *allowed_roles: Allowed roles for this endpoint
        
    Returns:
        Function that checks user role
    """
    def role_checker(user: dict = Security(get_current_user)) -> dict:
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        return user
    
    return role_checker


def create_access_token(user_data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    NOTE: This should primarily be done by the Node.js backend,
    but provided for testing purposes.
    
    Args:
        user_data: Dictionary containing user information
        expires_delta: Optional expiration time delta
        
    Returns:
        JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode = user_data.copy()
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt