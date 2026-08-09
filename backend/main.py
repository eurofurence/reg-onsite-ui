import asyncio
import json
import os
from typing import Annotated

import httpx
import jwt
from fastapi import Cookie, Depends, FastAPI, HTTPException, Query, Security
from fastapi.responses import Response

app = FastAPI()

_public_keys_pem: list[str] = json.loads(os.environ.get("JWT_PUBLIC_KEYS", "[]"))
_audience: str = os.environ.get("JWT_AUDIENCE", "")
_issuer: str = os.environ.get("JWT_ISSUER", "https://identity.eurofurence.org/")
_attendee_service_url: str = os.environ.get("ATTENDEE_SERVICE_URL", "http://attendee-service:8080")
_payment_service_url: str = os.environ.get("PAYMENT_SERVICE_URL", "http://payment-service:8080")
_admin_group: str = os.environ.get("ADMIN_GROUP", "")
_sumup_access_token: str = os.environ.get("SUMUP_ACCESS_TOKEN", "")

if not _audience:
    raise RuntimeError("JWT_AUDIENCE environment variable must be set")


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


@app.get("/")
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/api/check_group")
def check_group(
    group: Annotated[str, Query()],
    claims: Annotated[dict, Depends(verify_jwt)],
) -> dict:
    groups: list[str] = claims.get("groups") or []
    return {"authorized": group in groups}


@app.get("/api/status-history/{attendee_id}")
async def status_history(
    attendee_id: int,
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> Response:
    cookie_header = f"JWT={JWT}"
    if AUTH:
        cookie_header += f"; AUTH={AUTH}"

    url = f"{_attendee_service_url}/api/rest/v1/attendees/{attendee_id}/status-history"
    async with httpx.AsyncClient() as client:
        upstream = await client.get(
            url,
            headers={
                "Cookie": cookie_header,
                "X-Admin-Request": "available",
            },
        )

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type", "application/json"),
    )


@app.get("/api/sumup/product-counts")
async def sumup_product_counts(
    claims: Annotated[dict, Security(verify_admin)],
) -> dict:
    if not _sumup_access_token:
        raise HTTPException(status_code=503, detail="SumUp token not configured")

    headers = {"Authorization": f"Bearer {_sumup_access_token}"}
    transactions: list[dict] = []
    sem = asyncio.Semaphore(10)

    async with httpx.AsyncClient(timeout=30) as client:
        query = "limit=100"
        while True:
            resp = await client.get(
                f"https://api.sumup.com/v0.1/me/transactions/history?{query}",
                headers=headers,
            )
            resp.raise_for_status()
            page = resp.json()
            items = page.get("items", [])
            transactions.extend(items)
            next_link = next((l for l in page.get("links", []) if l.get("rel") == "next"), None)
            if not next_link:
                break
            query = next_link["href"]

        async def fetch_detail(tx_id: str):
            async with sem:
                return await client.get(
                    f"https://api.sumup.com/v0.1/me/transactions?id={tx_id}",
                    headers=headers,
                )

        details = await asyncio.gather(*[fetch_detail(tx["id"]) for tx in transactions])

    counts: dict[str, int] = {}
    for resp in details:
        cart = resp.json().get("cart") or {}
        for item in cart.get("items") or []:
            key = item.get("product_summary") or "(unknown)"
            counts[key] = counts.get(key, 0) + item.get("quantity", 1)

    return counts


@app.post("/api/cash-payment/{attendee_id}")
async def cash_payment(
    attendee_id: int,
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> Response:
    cookie_header = f"JWT={JWT}"
    if AUTH:
        cookie_header += f"; AUTH={AUTH}"

    url = f"{_payment_service_url}/api/rest/v1/transactions/initiate-payment"
    async with httpx.AsyncClient() as client:
        upstream = await client.post(
            url,
            json={"debitor_id": attendee_id, "method": "cash"},
            headers={
                "Cookie": cookie_header,
                "X-Admin-Request": "available",
            },
        )

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type", "application/json"),
    )
