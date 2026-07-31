"""
Google OAuth2 client setup (Authlib).

Uses explicit Google endpoints rather than the discovery/well-known URL,
so registration doesn't depend on an extra network round-trip at request
time -- these URLs are stable, published Google endpoints.
"""
from authlib.integrations.starlette_client import OAuth
from app.core.config import settings

oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile",
    },
)