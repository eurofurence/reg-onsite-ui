from typing import Annotated, Optional

import httpx
from fastapi import APIRouter, Cookie, HTTPException, Security
from pydantic import BaseModel

from backend.auth import check_upstream, proxy_headers, verify_admin
from backend.env_defaults import getenv

router = APIRouter(prefix="/api/v1")

_attendee_service_url: str = getenv("ATTENDEE_SERVICE_URL")


async def get_payment_summary(
    client: httpx.AsyncClient, attendee_id: int, headers: dict,
) -> dict:
    resp = await client.post(
        f"{_attendee_service_url}/api/rest/v1/attendees/find",
        json={
            "match_any": [{"ids": [attendee_id]}],
            "fill_fields": ["payment_balance", "first_name", "last_name"],
        },
        headers=headers,
    )
    check_upstream(resp)
    attendees: list[dict] = resp.json().get("attendees") or []
    if not attendees:
        raise HTTPException(status_code=404, detail="attendee not found")
    return attendees[0]


@router.get("/attendees/{attendee_id}/check-in")
async def checkin_time(
    attendee_id: int,
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
    url = f"{_attendee_service_url}/api/rest/v1/attendees/{attendee_id}/status-history"
    async with httpx.AsyncClient() as client:
        upstream = await client.get(url, headers=proxy_headers(JWT, AUTH))

    check_upstream(upstream)

    history: list[dict] = upstream.json().get("status_history") or []
    checked_in_at = None
    for entry in reversed(history):
        if entry.get("status") == "checked in":
            checked_in_at = entry["timestamp"]
            break
    return {"checked_in_at": checked_in_at}


class AttendeeFindRequest(BaseModel):
    match_any: list[dict]


@router.post("/attendees/search")
async def attendee_find(
    request: AttendeeFindRequest,
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{_attendee_service_url}/api/rest/v1/attendees/find",
            json={"match_any": request.match_any},
            headers=proxy_headers(JWT, AUTH),
        )
    check_upstream(resp)
    return resp.json()


class AttendeeRow(BaseModel):
    regId: Optional[str] = None
    nickname: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    fullName: Optional[str] = None
    email: Optional[str] = None
    idpId: Optional[str] = None
    item: Optional[str] = None


class AttendeeLookupRequest(BaseModel):
    rows: list[AttendeeRow]


@router.post("/attendees/match")
async def attendee_lookup(
    request: AttendeeLookupRequest,
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{_attendee_service_url}/api/rest/v1/attendees/find",
            json={
                "match_any": [{"nickname": "*"}],
                "fill_fields": ["id", "nickname", "first_name", "last_name", "email", "identity_subject"],
            },
            headers=proxy_headers(JWT, AUTH),
        )
    check_upstream(resp)
    attendees = resp.json().get("attendees") or []

    by_reg = {str(a["id"]): a for a in attendees if a.get("id") is not None}
    by_nickname = {(a.get("nickname") or "").strip().lower(): a for a in attendees if a.get("nickname")}
    by_email = {(a.get("email") or "").strip().lower(): a for a in attendees if a.get("email")}
    by_idp = {a["identity_subject"]: a for a in attendees if a.get("identity_subject")}
    by_name: dict[tuple[str, str], dict] = {}
    for a in attendees:
        fn = (a.get("first_name") or "").strip().lower()
        ln = (a.get("last_name") or "").strip().lower()
        if fn and ln:
            by_name[(fn, ln)] = a

    results = []
    for row in request.rows:
        hits: list[dict] = []

        if row.regId and row.regId.strip():
            hit = by_reg.get(row.regId.strip())
            if hit:
                hits.append(hit)

        if row.idpId and row.idpId.strip():
            hit = by_idp.get(row.idpId.strip())
            if hit:
                hits.append(hit)

        if row.email and row.email.strip():
            hit = by_email.get(row.email.strip().lower())
            if hit:
                hits.append(hit)

        if row.nickname and row.nickname.strip():
            hit = by_nickname.get(row.nickname.strip().lower())
            if hit:
                hits.append(hit)

        if row.firstName and row.lastName:
            hit = by_name.get((row.firstName.strip().lower(), row.lastName.strip().lower()))
            if hit:
                hits.append(hit)

        if row.fullName and row.fullName.strip():
            parts = row.fullName.strip().split(None, 1)
            if len(parts) == 2:
                hit = by_name.get((parts[0].lower(), parts[1].lower()))
                if hit:
                    hits.append(hit)

        candidates = {a["id"]: a for a in hits}

        matches = [
            {
                "id": candidate["id"],
                "nickname": candidate.get("nickname"),
                "firstName": candidate.get("first_name"),
                "lastName": candidate.get("last_name"),
                "email": candidate.get("email"),
                "idpId": candidate.get("identity_subject"),
            }
            for candidate in candidates.values()
        ]

        results.append({
            "matches": matches,
            "item": row.item,
            "found": len(matches) == 1,
            "input": {
                "regId": row.regId,
                "nickname": row.nickname,
                "firstName": row.firstName,
                "lastName": row.lastName,
                "fullName": row.fullName,
                "email": row.email,
                "idpId": row.idpId,
                "item": row.item,
            },
        })

    return {"results": results}
