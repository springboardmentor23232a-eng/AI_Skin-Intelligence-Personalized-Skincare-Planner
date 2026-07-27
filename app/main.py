import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

load_dotenv()

from supabase_oauth import SupabaseOAuth

SECRET_KEY = "change-me-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

BASE_DIR = Path(__file__).resolve().parent.parent
INDEX_FILE = BASE_DIR / "index.html"

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
supabase_oauth = SupabaseOAuth()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPayload(BaseModel):
    email: str
    role: str


class UserRecord(BaseModel):
    email: str
    password_hash: str
    role: str


USERS_DB = {
    "user@example.com": UserRecord(
        email="user@example.com",
        password_hash=pwd_context.hash("secret123"),
        role="user",
    ),
    "admin@example.com": UserRecord(
        email="admin@example.com",
        password_hash=pwd_context.hash("secret456"),
        role="admin",
    ),
    "consultant@example.com": UserRecord(
        email="consultant@example.com",
        password_hash=pwd_context.hash("secret789"),
        role="consultant",
    ),
}


def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def authenticate_user(email: str, password: str, role: str) -> Optional[UserRecord]:
    user = USERS_DB.get(email)
    if not user:
        return None
    if not pwd_context.verify(password, user.password_hash):
        return None
    if role.lower() != user.role.lower():
        return None
    return user


@app.get("/", include_in_schema=False)
async def root() -> FileResponse:
    return FileResponse(INDEX_FILE)


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> UserPayload:
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


@app.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest) -> TokenResponse:
    user = authenticate_user(request.email, request.password, request.role)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email, password, or role")

    token = create_access_token(user.email, user.role)
    return TokenResponse(access_token=token)


@app.get("/auth/me", response_model=UserPayload)
async def get_me(current_user: UserPayload = Depends(get_current_user)) -> UserPayload:
    return current_user


@app.get("/auth/supabase/login")
async def supabase_login(provider: str | None = None) -> RedirectResponse:
    if not supabase_oauth.configured:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Supabase OAuth is not configured")

    authorize_url = supabase_oauth.build_authorize_url(provider=provider)
    return RedirectResponse(url=authorize_url)


@app.get("/auth/supabase/callback")
async def supabase_callback(code: str, state: str | None = None) -> HTMLResponse:
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing OAuth code")

    try:
        token_data = supabase_oauth.exchange_code_for_session(code)
        user_data = supabase_oauth.get_user_info(token_data.get("access_token", ""))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    session_id = supabase_oauth.store_session(token_data, user_data)

    script = f"""
    <script>
      const tokenData = {json.dumps(token_data)};
      const userData = {json.dumps(user_data)};
      if (tokenData.access_token) localStorage.setItem('access_token', tokenData.access_token);
      if (tokenData.refresh_token) localStorage.setItem('refresh_token', tokenData.refresh_token);
      localStorage.setItem('supabase_session_id', {json.dumps(session_id)});
      localStorage.setItem('supabase_user', JSON.stringify(userData));
      localStorage.setItem('user_role', 'user');
      window.location.href = '/user/user.html';
    </script>
    """
    return HTMLResponse(content=f"<!DOCTYPE html><html><body>{script}</body></html>")


app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
