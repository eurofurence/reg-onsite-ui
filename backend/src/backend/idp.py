from typing import Annotated

import httpx
from fastapi import APIRouter, Body, Cookie, Depends, Security

from backend.auth import check_upstream, idp_url, proxy_headers, verify_admin, verify_jwt
from backend.env_defaults import getenv

router = APIRouter(prefix="/api/v1")

_attendee_service_url: str = getenv("ATTENDEE_SERVICE_URL")


@router.get("/me/groups")
def get_groups(
    claims: Annotated[dict, Depends(verify_jwt)],
) -> dict:
    groups: list[str] = claims.get("groups") or []
    return {"groups": groups}


@router.get("/me/groups/{group}")
def check_group(
    group: str,
    claims: Annotated[dict, Depends(verify_jwt)],
) -> dict:
    groups: list[str] = claims.get("groups") or []
    return {"authorized": group in groups}


@router.post("/groups/{group_id}/attendees")
async def group_members(
    group_id: str,
    idp_token: Annotated[str, Body(embed=True, alias="idpToken")],
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
    # Collect all IDP user IDs for the group, following pagination
    user_ids: set[str] = set()
    url = f"{idp_url}/api/v1/groups/{group_id}/users?page=1"
    async with httpx.AsyncClient(timeout=15) as client:
        while url:
            resp = await client.get(url, headers={"Authorization": f"Bearer {idp_token}"})
            resp.raise_for_status()
            body = resp.json()
            for entry in body.get("data") or []:
                user_ids.add(entry["user_id"])
            url = (body.get("links") or {}).get("next") or ""

    if not user_ids:
        return {"attendees": []}

    # Fetch all attendees with identity_subject populated
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{_attendee_service_url}/api/rest/v1/attendees/find",
            json={
                "match_any": [{"nickname": "*"}],
                "fill_fields": ["nickname", "identity_subject"],
            },
            headers=proxy_headers(JWT, AUTH),
        )

    check_upstream(resp)

    attendees = [
        {"id": a["id"], "nickname": a.get("nickname")}
        for a in (resp.json().get("attendees") or [])
        if a.get("identity_subject") in user_ids
    ]
    return {"attendees": attendees}
