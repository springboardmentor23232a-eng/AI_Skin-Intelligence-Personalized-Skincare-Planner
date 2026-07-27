import json
import os
import secrets
from typing import Any, Dict, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class SupabaseOAuth:
    def __init__(self) -> None:
        self.base_url = (os.getenv("SUPABASE_URL") or "").rstrip("/")
        self.anon_key = os.getenv("SUPABASE_ANON_KEY") or ""
        self.service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""
        self.redirect_uri = os.getenv("SUPABASE_REDIRECT_URI") or "http://127.0.0.1:8000/auth/supabase/callback"
        self.provider = os.getenv("SUPABASE_PROVIDER") or "google"
        self._token_store: Dict[str, Dict[str, Any]] = {}

    @property
    def configured(self) -> bool:
        return bool(self.base_url and self.anon_key)

    def build_authorize_url(self, state: Optional[str] = None, provider: Optional[str] = None) -> str:
        if not self.configured:
            raise RuntimeError("Supabase OAuth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.")

        selected_provider = provider or self.provider
        params = {
            "provider": selected_provider,
            "redirect_to": self.redirect_uri,
            "response_type": "code",
        }
        if state:
            params["state"] = state
        return f"{self.base_url}/auth/v1/authorize?{urlencode(params)}"

    def exchange_code_for_session(self, code: str) -> Dict[str, Any]:
        if not self.configured:
            raise RuntimeError("Supabase OAuth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.")

        payload = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_to": self.redirect_uri,
        }
        return self._request_json(
            "POST",
            "/auth/v1/token",
            payload=payload,
            headers={"apikey": self.anon_key},
        )

    def refresh_session(self, refresh_token: str) -> Dict[str, Any]:
        if not self.configured:
            raise RuntimeError("Supabase OAuth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.")

        return self._request_json(
            "POST",
            "/auth/v1/token",
            payload={"grant_type": "refresh_token", "refresh_token": refresh_token},
            headers={"apikey": self.anon_key},
        )

    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        if not self.configured:
            raise RuntimeError("Supabase OAuth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.")

        return self._request_json(
            "GET",
            "/auth/v1/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    def store_session(self, token_data: Dict[str, Any], user_data: Optional[Dict[str, Any]] = None) -> str:
        session_id = f"sb_{secrets.token_hex(8)}"
        self._token_store[session_id] = {
            "token_data": token_data,
            "user_data": user_data or {},
        }
        return session_id

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self._token_store.get(session_id)

    def clear_session(self, session_id: str) -> None:
        self._token_store.pop(session_id, None)

    def _request_json(self, method: str, path: str, payload: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        if not self.base_url:
            raise RuntimeError("SUPABASE_URL is not configured.")

        url = f"{self.base_url}{path}"
        request_headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if headers:
            request_headers.update(headers)

        body = None
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")

        request = Request(url, data=body, headers=request_headers, method=method)
        try:
            with urlopen(request, timeout=20) as response:
                payload_bytes = response.read()
                if not payload_bytes:
                    return {}
                return json.loads(payload_bytes.decode("utf-8"))
        except HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Supabase request failed ({exc.code}): {error_body}") from exc
        except URLError as exc:
            raise RuntimeError(f"Unable to reach Supabase at {url}: {exc.reason}") from exc
