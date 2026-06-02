"""Short-lived JWT for anonymous demo users."""
from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta, timezone

from jose import jwt
from pydantic import BaseModel

GUEST_ISSUER = "hydrosight-guest"
GUEST_AUDIENCE = "hydrosight-guest"
GUEST_TTL_HOURS = 24


def _guest_secret() -> str:
    secret = os.getenv("GUEST_JWT_SECRET") or os.getenv("SUPABASE_JWT_SECRET") or "dev-guest-secret-change-me"
    return secret


class GuestTokenBody(BaseModel):
    guestId: str | None = None


def issue_guest_token(guest_id: str | None = None) -> dict:
    gid = guest_id or str(uuid.uuid4())
    if not _is_valid_uuid(gid):
        gid = str(uuid.uuid4())

    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=GUEST_TTL_HOURS)
    payload = {
        "sub": f"guest:{gid}",
        "role": "guest",
        "plan": "guest",
        "iss": GUEST_ISSUER,
        "aud": GUEST_AUDIENCE,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    token = jwt.encode(payload, _guest_secret(), algorithm="HS256")
    return {
        "token": token,
        "guestId": gid,
        "expiresIn": GUEST_TTL_HOURS * 3600,
        "principalId": payload["sub"],
    }


def decode_guest_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            _guest_secret(),
            algorithms=["HS256"],
            audience=GUEST_AUDIENCE,
            issuer=GUEST_ISSUER,
        )
        if payload.get("role") != "guest":
            return None
        sub = payload.get("sub")
        if not sub or not str(sub).startswith("guest:"):
            return None
        return payload
    except Exception:
        return None


def _is_valid_uuid(value: str) -> bool:
    try:
        uuid.UUID(str(value))
        return True
    except ValueError:
        return False
