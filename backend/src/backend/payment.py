import json
from typing import Annotated, Literal

import httpx
from fastapi import APIRouter, Cookie, Security
from fastapi.responses import Response
from pydantic import BaseModel

from backend.auth import check_upstream, proxy_headers, verify_admin, verify_not_revoked
from backend.env_defaults import getenv

router = APIRouter(prefix="/api/v1")

_service_url: str = getenv("PAYMENT_SERVICE_URL")

_GRACE_CENTS = 100  # 1 EUR grace, matching reg-attendee-service's graceAmountCents


@router.get("/attendees/{attendee_id}/packages/payments")
async def package_payment_status(
    attendee_id: int,
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
    url = f"{_service_url}/api/rest/v1/transactions?debitor_id={attendee_id}"
    async with httpx.AsyncClient() as client:
        upstream = await client.get(url, headers=proxy_headers(JWT, AUTH))

    if upstream.status_code == 404:
        return {"packages": []}

    check_upstream(upstream)

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


class InitPaymentRequest(BaseModel):
    method: Literal["cash", "credit", "transfer", "internal", "gift"]


_REUSABLE_TENTATIVE_METHODS = {"credit", "transfer"}


async def _find_tentative_transaction(
    client: httpx.AsyncClient,
    attendee_id: int,
    method: str,
    headers: dict,
) -> dict | None:
    url = f"{_service_url}/api/rest/v1/transactions?debitor_id={attendee_id}"
    upstream = await client.get(url, headers=headers)

    if upstream.status_code == 404:
        return None

    check_upstream(upstream)

    transactions: list[dict] = upstream.json().get("payload") or []
    for transaction in transactions:
        if (
            transaction.get("transaction_type") == "payment"
            and transaction.get("method") == method
            and transaction.get("status") == "tentative"
        ):
            return transaction
    return None


@router.post("/attendees/{attendee_id}/payment")
async def init_payment(
    attendee_id: int,
    request: InitPaymentRequest,
    claims: Annotated[dict, Security(verify_admin)],
    not_revoked: Annotated[None, Security(verify_not_revoked)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> Response:
    headers = proxy_headers(JWT, AUTH)

    async with httpx.AsyncClient() as client:
        if request.method in _REUSABLE_TENTATIVE_METHODS:
            tentative_transaction = await _find_tentative_transaction(
                client, attendee_id, request.method, headers,
            )
            if tentative_transaction is not None:
                return Response(
                    content=json.dumps({"transaction": tentative_transaction}),
                    status_code=200,
                    media_type="application/json",
                )

        url = f"{_service_url}/api/rest/v1/transactions/initiate-payment"
        upstream = await client.post(
            url,
            json={"debitor_id": attendee_id, "method": request.method},
            headers=headers,
        )

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type", "application/json"),
    )
