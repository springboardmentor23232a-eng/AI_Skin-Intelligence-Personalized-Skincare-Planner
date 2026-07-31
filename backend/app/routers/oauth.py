"""
OAuth2 login (Google).

Flow:
  1. Frontend redirects the browser to GET /api/auth/google/login
  2. We redirect to Google's consent screen
  3. Google redirects back to GET /api/auth/google/callback with a code
  4. We exchange the code for Google's access token, fetch the user's
     profile, find-or-create a local User record, issue our own JWT,
     and redirect back to the frontend with that token in the URL.
"""
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.oauth import oauth
from app.core.config import settings
from app.core.security import create_access_token
from app.database import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/auth/google", tags=["OAuth2 Login"])


@router.get("/login")
async def google_login(request: Request):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured on this server yet.")
    return await oauth.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)


@router.get("/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)

    resp = await oauth.google.get("https://openidconnect.googleapis.com/v1/userinfo", token=token)
    userinfo = resp.json()

    email = userinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google did not return an email address.")
    full_name = userinfo.get("name") or email.split("@")[0]

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            full_name=full_name,
            email=email,
            hashed_password=None,
            auth_provider="google",
            role=UserRole.user,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/oauth-callback?token={access_token}")