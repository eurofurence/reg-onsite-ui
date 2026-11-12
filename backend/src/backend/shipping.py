import json
from typing import Annotated

import httpx
from fastapi import APIRouter, Cookie, Security
from pydantic import BaseModel

from backend.auth import check_upstream, proxy_headers, verify_admin
from backend.env_defaults import getenv

router = APIRouter(prefix="/api/v1")

_attendee_service_url: str = getenv("ATTENDEE_SERVICE_URL")

_SHIPPING_FIELDS = (
    "nickname",
    "first_name",
    "last_name",
    "street",
    "zip",
    "city",
    "country",
    "state",
    "email",
    "comments",
    "tshirt_size",
    "tshirt_shape",
    "shipping_email",
)
_ATTENDEE_FALLBACK_FIELDS = (
    "nickname",
    "first_name",
    "last_name",
    "street",
    "zip",
    "city",
    "country",
    "state",
    "email",
)


class ShippingExportRequest(BaseModel):
    attendee_ids: list[int]


def _parse_shipping_values(payload: dict) -> dict[int, dict]:
    result: dict[int, dict] = {}
    for raw_id, raw_value in (payload.get("values") or {}).items():
        try:
            attendee_id = int(raw_id)
        except (TypeError, ValueError):
            continue
        try:
            parsed = json.loads(raw_value)
        except (TypeError, ValueError):
            parsed = {}
        if isinstance(parsed, dict):
            result[attendee_id] = parsed
    return result


@router.post("/shipping/addresses")
async def shipping_addresses(
    request: ShippingExportRequest,
    claims: Annotated[dict, Security(verify_admin)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
    if not request.attendee_ids:
        return {"addresses": []}

    headers = proxy_headers(JWT, AUTH)
    async with httpx.AsyncClient(timeout=30) as client:
        shipping_resp = await client.get(
            f"{_attendee_service_url}/api/rest/v1/additional-info/shipping",
            headers=headers,
        )
        check_upstream(shipping_resp)
        shipping_by_id = _parse_shipping_values(shipping_resp.json())

        attendees_resp = await client.post(
            f"{_attendee_service_url}/api/rest/v1/attendees/find",
            json={
                "match_any": [{"ids": request.attendee_ids}],
                "fill_fields": ["id", *_ATTENDEE_FALLBACK_FIELDS],
            },
            headers=headers,
        )
        check_upstream(attendees_resp)
        attendees_by_id = {
            int(attendee["id"]): attendee
            for attendee in attendees_resp.json().get("attendees") or []
            if attendee.get("id") is not None
        }

    addresses: list[dict] = []
    for attendee_id in request.attendee_ids:
        attendee = attendees_by_id.get(attendee_id, {})
        shipping = shipping_by_id.get(attendee_id, {})
        entry: dict = {"id": attendee_id}
        for field in _SHIPPING_FIELDS:
            value = shipping.get(field)
            if value in (None, "") and field in _ATTENDEE_FALLBACK_FIELDS:
                value = attendee.get(field)
            entry[field] = "" if value is None else value
        addresses.append(entry)

    return {"addresses": addresses}
