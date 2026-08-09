import asyncio
import json
import os
from typing import Annotated

import httpx
import jwt
from fastapi import Body, Cookie, Depends, FastAPI, HTTPException, Query, Security
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


@app.post("/api/sumup/token")
async def set_sumup_token(
    claims: Annotated[dict, Security(verify_admin)],
    token: Annotated[str, Body(embed=True)],
) -> dict:
    global _sumup_access_token
    _sumup_access_token = token
    return {"status": "ok"}


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


@app.get("/api/checkin-time/{attendee_id}")
async def checkin_time(
    attendee_id: int,
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
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

    if upstream.status_code != 200:
        raise HTTPException(status_code=upstream.status_code, detail="upstream error")

    history: list[dict] = upstream.json().get("status_history") or []
    checked_in_at = None
    for entry in reversed(history):
        if entry.get("status") == "checked in":
            checked_in_at = entry["timestamp"]
            break
    return {"checked_in_at": checked_in_at}


_GRACE_CENTS = 100  # 1 EUR grace, matching reg-attendee-service's graceAmountCents


@app.get("/api/package-payment-status/{attendee_id}")
async def package_payment_status(
    attendee_id: int,
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
    cookie_header = f"JWT={JWT}"
    if AUTH:
        cookie_header += f"; AUTH={AUTH}"

    url = f"{_payment_service_url}/api/rest/v1/transactions?debitor_id={attendee_id}"
    async with httpx.AsyncClient() as client:
        upstream = await client.get(
            url,
            headers={"Cookie": cookie_header, "X-Admin-Request": "available"},
        )

    if upstream.status_code == 404:
        return {"packages": []}

    if upstream.status_code != 200:
        raise HTTPException(status_code=upstream.status_code, detail="upstream error")

    payload: list[dict] = upstream.json().get("payload") or []

    valid_dues = [t for t in payload if t.get("transaction_type") == "due" and t.get("status") == "valid"]
    valid_payments = [t for t in payload if t.get("transaction_type") == "payment" and t.get("status") == "valid"]

    # Walk due transactions chronologically, tracking the cumulative dues total at the
    # point each package first appeared. That cumulative threshold is what payments must
    # reach before that package is considered fully paid.
    sorted_dues = sorted(valid_dues, key=lambda t: t.get("creation_date") or "")
    package_threshold: dict[str, int] = {}
    running_dues = 0
    for tx in sorted_dues:
        running_dues += tx["amount"]["gross_cent"]
        try:
            reason = json.loads(tx.get("reason") or "{}")
            for pkg in (reason.get("packages_list") or []):
                name = pkg.get("name")
                if name and name not in package_threshold:
                    package_threshold[name] = running_dues
        except (json.JSONDecodeError, TypeError):
            pass

    # Current package list comes from the latest due transaction's reason
    current_packages: list[dict] = []
    if sorted_dues:
        try:
            reason = json.loads(sorted_dues[-1].get("reason") or "{}")
            current_packages = reason.get("packages_list") or []
        except (json.JSONDecodeError, TypeError):
            pass

    # Build a timeline of (cumulative_payments, timestamp) milestones
    sorted_payments = sorted(valid_payments, key=lambda t: t.get("creation_date") or "")
    milestones: list[tuple[int, str | None]] = []
    running_payments = 0
    for tx in sorted_payments:
        running_payments += tx["amount"]["gross_cent"]
        milestones.append((running_payments, tx.get("creation_date")))

    def find_paid_at(threshold: int) -> str | None:
        for total, ts in milestones:
            if total >= threshold - _GRACE_CENTS:
                return ts
        return None

    packages = [
        {**pkg, "fully_paid_at": find_paid_at(package_threshold[pkg["name"]])}
        for pkg in current_packages
        if pkg.get("name") in package_threshold
    ]

    return {"packages": packages}


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
