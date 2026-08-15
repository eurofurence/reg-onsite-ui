import json
import logging
from typing import Annotated

import httpx
import jwt
from fastapi import Cookie, HTTPException, Security

from backend.env_defaults import getenv

_logger = logging.getLogger(__name__)

_public_keys_pem: list[str] = json.loads(getenv("JWT_PUBLIC_KEYS"))
_audience: str = getenv("JWT_AUDIENCE")
_issuer: str = getenv("JWT_ISSUER")
_admin_group: str = getenv("ADMIN_GROUP")
idp_url: str = getenv("IDP_URL")
_idp_client_id: str = getenv("IDP_CLIENT_ID")
_idp_client_secret: str = getenv("IDP_CLIENT_SECRET")


if not _audience:
    raise RuntimeError("JWT_AUDIENCE environment variable must be set")


def proxy_headers(JWT: str | None, AUTH: str | None) -> dict:
    cookie = f"JWT={JWT}"
    if AUTH:
        cookie += f"; AUTH={AUTH}"
    return {"Cookie": cookie, "X-Admin-Request": "available"}


def check_upstream(resp: httpx.Response) -> None:
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="upstream error")


def _decode_jwt(token: str) -> dict:
    decode_kwargs: dict = dict(
        algorithms=["RS256", "RS512"],
        audience=_audience,
        options={"verify_aud": True},
    )
    if _issuer:
        decode_kwargs["issuer"] = _issuer

    last_err: Exception = Exception("no public keys configured")
    for pem in _public_keys_pem:
        try:
            return jwt.decode(token, pem, **decode_kwargs)
        except jwt.InvalidTokenError as e:
            last_err = e
    raise last_err


def verify_jwt(JWT: Annotated[str | None, Cookie()] = None) -> dict:
    if not JWT:
        raise HTTPException(status_code=401, detail="missing JWT cookie")
    try:
        return _decode_jwt(JWT)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="invalid token")


def verify_admin(claims: Annotated[dict, Security(verify_jwt)]) -> dict:
    groups: list[str] = claims.get("groups") or []
    if not _admin_group or _admin_group not in groups:
        raise HTTPException(status_code=403, detail="not in admin group")
    return claims


async def verify_not_revoked(
    JWT: Annotated[str | None, Cookie()] = None,
) -> None:
    if not _idp_client_id or not _idp_client_secret:
        _logger.warning(
            "IDP_CLIENT_ID/IDP_CLIENT_SECRET not configured — "
            "skipping token revocation check"
        )
        return

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{idp_url}/introspect",
            data={"token": JWT},
            auth=(_idp_client_id, _idp_client_secret),
        )
    resp.raise_for_status()

    if not resp.json().get("active"):
        raise HTTPException(status_code=401, detail="token revoked")
