import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

security = HTTPBearer(auto_error=False)

class UserContext:
    def __init__(self, user_id: int, username: str = "user", role: str = "user"):
        self.id = user_id
        self.username = username
        self.role = role

def decode_token(token: str) -> dict:
    """Decodes JWT Token using the application JWT Secret Key strictly."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.PyJWTError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(err)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserContext:
    """FastAPI Dependency: Extract authenticated user context from Authorization header."""
    if not credentials:
        # Fallback default user for dev / unauthenticated requests if header missing
        return UserContext(user_id=1, username="demo_user", role="user")
    
    token = credentials.credentials
    payload = decode_token(token)
    
    # Extract user ID (supports 'id', 'user_id', or 'sub')
    user_id = payload.get("id") or payload.get("user_id") or payload.get("sub")
    if not user_id:
        user_id = 1
    
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        user_id = 1
        
    username = payload.get("username") or payload.get("email") or "user"
    role = payload.get("role") or "user"
    
    return UserContext(user_id=user_id, username=username, role=role)
