import asyncio
import datetime
import re
from typing import Annotated

import httpx
from fastapi import APIRouter, Cookie, HTTPException, Security
from pydantic import BaseModel

from backend.auth import check_upstream, proxy_headers, verify_admin, verify_not_revoked
from backend.env_defaults import getenv

router = APIRouter(prefix="/api/v1")

_mail_service_url: str = getenv("MAIL_SERVICE_URL")
_attendee_service_url: str = getenv("ATTENDEE_SERVICE_URL")

_TEMPLATE_CACHE_TTL_SECONDS = 10.0
_NO_CACHE_ENTRY = object()
_template_cache: dict[
    tuple[object, ...], tuple[datetime.datetime, object]
] = {}


def _utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)


def _template_cache_get(key: tuple[object, ...]) -> object:
    now = _utc_now()
    entry = _template_cache.get(key)
    if entry is None:
        return _NO_CACHE_ENTRY
    last_access, value = entry
    if now - last_access > datetime.timedelta(seconds=_TEMPLATE_CACHE_TTL_SECONDS):
        del _template_cache[key]
        return _NO_CACHE_ENTRY
    _template_cache[key] = (now, value)
    return value


def _template_cache_set(key: tuple[object, ...], value: object) -> None:
    _template_cache[key] = (_utc_now(), value)

_NO_FLAG = "<no_flag>"
_NO_PACKAGE = "<no_package>"

_VARIABLE_PATTERN = re.compile(r"\{\{\s*([\w.\-]+)\s*\}\}")

_ATTENDEE_VAR_ALIASES: dict[str, str] = {
    "badge_number": "badge_id",
    "badge_id": "badge_id",
    "nick": "nickname",
    "nickname": "nickname",
    "given_name": "first_name",
    "first_name": "first_name",
    "family_name": "last_name",
    "last_name": "last_name",
    "name": "transFullName",
    "full_name": "transFullName",
    "email": "email",
    "country_code": "country",
    "country": "transCountryName",
    "birthday": "transBirthday",
    "age": "transAge",
    "conbook": "transConbookChoice",
    "conbook_choice": "transConbookChoice",
    "sponsor": "transSponsorChoice",
    "conrole": "transConRole",
    "con_role": "transConRole",
    "spoken_language": "registration_language",
    "spoken_languages": "registration_language",
    "language": "registration_language",
}

_CONBOOK_FLAG = "digi-book"
_SPONSOR_PACKAGES = ("contributor", "sponsor", "sponsor2")
_CONROLE_FLAGS = ("guest", "director", "staff")

_MONEY_FIELDS = ("total_dues", "payment_balance", "current_dues")

_COUNTRY_NAMES: dict[str, str] = {
    "AC": "Ascension",
    "AD": "Andorra",
    "AE": "United Arab Emirates",
    "AF": "Afghanistan",
    "AG": "Antigua and Barbuda",
    "AI": "Anguilla",
    "AL": "Albania",
    "AM": "Armenia",
    "AO": "Angola",
    "AQ": "Antarctica",
    "AR": "Argentina",
    "AS": "American Samoa",
    "AT": "Austria",
    "AU": "Australia",
    "AW": "Aruba",
    "AX": "Åland Islands",
    "AZ": "Azerbaijan",
    "BA": "Bosnia and Herzegovina",
    "BB": "Barbados",
    "BD": "Bangladesh",
    "BE": "Belgium",
    "BF": "Burkina Faso",
    "BG": "Bulgaria",
    "BH": "Bahrain",
    "BI": "Burundi",
    "BJ": "Benin",
    "BL": "Saint Barthélemy",
    "BM": "Bermuda",
    "BN": "Brunei Darussalam",
    "BO": "Bolivia",
    "BQ": "Bonaire",
    "BR": "Brazil",
    "BS": "Bahamas",
    "BT": "Bhutan",
    "BV": "Bouvet Island",
    "BW": "Botswana",
    "BY": "Belarus",
    "BZ": "Belize",
    "CA": "Canada",
    "CC": "Cocos (Keeling) Islands",
    "CD": "Congo (Democratic Republic of the)",
    "CF": "Central African Republic",
    "CG": "Congo",
    "CH": "Switzerland",
    "CI": "Côte d'Ivoire",
    "CK": "Cook Islands",
    "CL": "Chile",
    "CM": "Cameroon",
    "CN": "China",
    "CO": "Colombia",
    "CP": "Clipperton",
    "CR": "Costa Rica",
    "CU": "Cuba",
    "CV": "Cabo Verde",
    "CW": "Curaçao",
    "CX": "Christmas Island",
    "CY": "Cyprus",
    "CZ": "Czechia",
    "DE": "Germany",
    "DG": "Diego Garcia",
    "DJ": "Djibouti",
    "DK": "Denmark",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    "DZ": "Algeria",
    "EA": "Ceuta, Melilla",
    "EC": "Ecuador",
    "EE": "Estonia",
    "EG": "Egypt",
    "EH": "Western Sahara",
    "ER": "Eritrea",
    "ES": "Spain",
    "ET": "Ethiopia",
    "FI": "Finland",
    "FJ": "Fiji",
    "FK": "Falkland Islands",
    "FM": "Micronesia",
    "FO": "Faroe Islands",
    "FR": "France",
    "GA": "Gabon",
    "GB": "United Kingdom",
    "GD": "Grenada",
    "GE": "Georgia",
    "GF": "French Guiana",
    "GG": "Guernsey",
    "GH": "Ghana",
    "GI": "Gibraltar",
    "GL": "Greenland",
    "GM": "Gambia",
    "GN": "Guinea",
    "GP": "Guadeloupe",
    "GQ": "Equatorial Guinea",
    "GR": "Greece",
    "GS": "South Georgia and the South Sandwich Islands",
    "GT": "Guatemala",
    "GU": "Guam",
    "GW": "Guinea-Bissau",
    "GY": "Guyana",
    "HK": "Hong Kong",
    "HM": "Heard Island and McDonald Islands",
    "HN": "Honduras",
    "HR": "Croatia",
    "HT": "Haiti",
    "HU": "Hungary",
    "IC": "Kanarische Inseln",
    "ID": "Indonesia",
    "IE": "Ireland",
    "IL": "Israel",
    "IM": "Isle of Man",
    "IN": "India",
    "IO": "British Indian Ocean Territory",
    "IQ": "Iraq",
    "IR": "Iran",
    "IS": "Iceland",
    "IT": "Italy",
    "JE": "Jersey",
    "JM": "Jamaica",
    "JO": "Jordan",
    "JP": "Japan",
    "KE": "Kenya",
    "KG": "Kyrgyzstan",
    "KH": "Cambodia",
    "KI": "Kiribati",
    "KM": "Comoros",
    "KN": "Saint Kitts and Nevis",
    "KP": "North Korea",
    "KR": "South Korea",
    "KW": "Kuwait",
    "KY": "Cayman Islands",
    "KZ": "Kazakhstan",
    "LA": "Lao",
    "LB": "Lebanon",
    "LC": "Saint Lucia",
    "LI": "Liechtenstein",
    "LK": "Sri Lanka",
    "LR": "Liberia",
    "LS": "Lesotho",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "LV": "Latvia",
    "LY": "Libya",
    "MA": "Morocco",
    "MC": "Monaco",
    "MD": "Moldova",
    "ME": "Montenegro",
    "MF": "Saint Martin (French part)",
    "MG": "Madagascar",
    "MH": "Marshall Islands",
    "MK": "North Macedonia",
    "ML": "Mali",
    "MM": "Myanmar",
    "MN": "Mongolia",
    "MO": "Macao",
    "MP": "Northern Mariana Islands",
    "MQ": "Martinique",
    "MR": "Mauritania",
    "MS": "Montserrat",
    "MT": "Malta",
    "MU": "Mauritius",
    "MV": "Maldives",
    "MW": "Malawi",
    "MX": "Mexico",
    "MY": "Malaysia",
    "MZ": "Mozambique",
    "NA": "Namibia",
    "NC": "New Caledonia",
    "NE": "Niger",
    "NF": "Norfolk Island",
    "NG": "Nigeria",
    "NI": "Nicaragua",
    "NL": "Netherlands",
    "NO": "Norway",
    "NP": "Nepal",
    "NR": "Nauru",
    "NU": "Niue",
    "NZ": "New Zealand",
    "OM": "Oman",
    "PA": "Panama",
    "PE": "Peru",
    "PF": "French Polynesia",
    "PG": "Papua New Guinea",
    "PH": "Philippines",
    "PK": "Pakistan",
    "PL": "Poland",
    "PM": "Saint Pierre and Miquelon",
    "PN": "Pitcairn",
    "PR": "Puerto Rico",
    "PS": "Palestine, State of",
    "PT": "Portugal",
    "PW": "Palau",
    "PY": "Paraguay",
    "QA": "Qatar",
    "RE": "Réunion",
    "RO": "Romania",
    "RS": "Serbia",
    "RU": "Russian Federation",
    "RW": "Rwanda",
    "SA": "Saudi Arabia",
    "SB": "Solomon Islands",
    "SC": "Seychelles",
    "SD": "Sudan",
    "SE": "Sweden",
    "SG": "Singapore",
    "SH": "Saint Helena",
    "SI": "Slovenia",
    "SJ": "Svalbard",
    "SK": "Slovakia",
    "SL": "Sierra Leone",
    "SM": "San Marino",
    "SN": "Senegal",
    "SO": "Somalia",
    "SR": "Suriname",
    "SS": "South Sudan",
    "ST": "Sao Tome and Principe",
    "SV": "El Salvador",
    "SX": "Sint Maarten (Dutch part)",
    "SY": "Syrian Arab Republic",
    "SZ": "Eswatini",
    "TA": "Tristan da Cunha",
    "TC": "Turks and Caicos Islands",
    "TD": "Chad",
    "TF": "French Southern Territories",
    "TG": "Togo",
    "TH": "Thailand",
    "TJ": "Tajikistan",
    "TK": "Tokelau",
    "TL": "Timor-Leste",
    "TM": "Turkmenistan",
    "TN": "Tunisia",
    "TO": "Tonga",
    "TR": "Türkiye",
    "TT": "Trinidad and Tobago",
    "TV": "Tuvalu",
    "TW": "Taiwan",
    "TZ": "Tanzania",
    "UA": "Ukraine",
    "UG": "Uganda",
    "UM": "United States Minor Outlying Islands",
    "US": "United States of America",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    "VA": "Holy See (Vatican City State)",
    "VC": "Saint Vincent and the Grenadines",
    "VE": "Venezuela",
    "VG": "Virgin Islands (British)",
    "VI": "Virgin Islands (U.S.)",
    "VN": "Viet Nam",
    "VU": "Vanuatu",
    "WF": "Wallis and Futuna",
    "WS": "Samoa",
    "YE": "Yemen",
    "YT": "Mayotte",
    "ZA": "South Africa",
    "ZM": "Zambia",
    "ZW": "Zimbabwe",
}


class MassMailRequest(BaseModel):
    cid: str
    attendee_ids: list[int]
    cc: list[str] = []
    bcc: list[str] = []
    variables: dict[str, str] = {}
    attachments: list[str] = []
    embedded: list[str] = []


class MailPreviewRequest(BaseModel):
    cid: str
    lang: str
    attendee_ids: list[int]
    variables: dict[str, str] = {}


def _normalize_variable_name(name: str) -> str:
    return re.sub(r"[\s.]+", "_", name.strip().lower())


def _extract_template_variables(
    subject: str | None, text: str | None, html: str | None
) -> list[str]:
    content = "\n".join(s for s in (subject, text, html) if s)
    names: list[str] = []
    seen: set[str] = set()
    for match in _VARIABLE_PATTERN.finditer(content):
        name = _normalize_variable_name(match.group(1))
        if name and name not in seen:
            seen.add(name)
            names.append(name)
    return names


def _as_string(value: object) -> str:
    if value is None:
        return ""
    return str(value)


def _as_money(value: object) -> str:
    if value is None:
        return ""
    try:
        cents = int(value)
    except (TypeError, ValueError):
        return _as_string(value)
    return f"EUR {cents / 100:.2f}"


def _trim_birthday(value: object) -> str:
    if not value:
        return ""
    text = str(value)
    parts = text.split("-")
    if len(parts) != 3:
        return text
    try:
        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
    except ValueError:
        return text
    return f"{year}-{month:02d}-{day:02d}"


def _age_in_years(value: object) -> str:
    if not value:
        return ""
    try:
        birthday = datetime.date.fromisoformat(str(value))
    except ValueError:
        return ""
    today = _utc_now().date()
    years = (
        today.year
        - birthday.year
        - ((today.month, today.day) < (birthday.month, birthday.day))
    )
    return str(years)


def _derived_variables(attendee: dict) -> dict[str, str]:
    first_name = attendee.get("first_name") or ""
    last_name = attendee.get("last_name") or ""
    flags = set(attendee.get("flags_list") or [])
    packages = [
        package.get("name")
        for package in (attendee.get("packages_list") or [])
    ]

    conrole = _NO_FLAG
    for role in _CONROLE_FLAGS:
        if role in flags:
            conrole = role

    conbook = _CONBOOK_FLAG if _CONBOOK_FLAG in flags else _NO_FLAG

    sponsor = _NO_PACKAGE
    for package in _SPONSOR_PACKAGES:
        if package in packages:
            sponsor = package
            break

    country_code = attendee.get("country") or ""
    return {
        "transFullName": f"{first_name} {last_name}".strip(),
        "transBirthday": _trim_birthday(attendee.get("birthday")),
        "transAge": _age_in_years(attendee.get("birthday")),
        "transCountryName": _COUNTRY_NAMES.get(country_code, country_code),
        "transConbookChoice": conbook,
        "transSponsorChoice": sponsor,
        "transConRole": conrole,
    }


def _get_attendee_value(attendee: dict, variable_name: str) -> str:
    derived = _derived_variables(attendee)
    if variable_name in derived:
        return derived[variable_name]
    key = _ATTENDEE_VAR_ALIASES.get(variable_name, variable_name)
    if key in derived:
        return derived[key]
    if key in _MONEY_FIELDS:
        return _as_money(attendee.get(key))
    return _as_string(attendee.get(key))


def _build_mail_variables(
    attendee: dict, variable_names: list[str], overrides: dict[str, str]
) -> dict[str, str]:
    variables = {
        name: _get_attendee_value(attendee, name) for name in variable_names
    }
    for name in variable_names:
        value = overrides.get(name)
        if value not in (None, ""):
            variables[name] = value
    return variables


def _render_template(
    content: str | None, variables: dict[str, str]
) -> str | None:
    if content is None:
        return None

    def replace(match: re.Match[str]) -> str:
        name = _normalize_variable_name(match.group(1))
        return variables.get(name, match.group(0))

    return _VARIABLE_PATTERN.sub(replace, content)


def _render_template_fields(
    template: dict | None, variables: dict[str, str]
) -> dict[str, str | None]:
    if not template:
        return {"subject": None, "text": None, "html": None}
    return {
        "subject": _render_template(template.get("subject"), variables),
        "text": _render_template(template.get("text"), variables),
        "html": _render_template(template.get("html"), variables),
    }


async def _fetch_template(
    client: httpx.AsyncClient, cid: str, lang: str, headers: dict
) -> dict | None:
    key = ("template", cid, lang)
    cached = _template_cache_get(key)
    if cached is not _NO_CACHE_ENTRY:
        return cached

    url = f"{_mail_service_url}/api/v1/templates"
    resp = await client.get(
        url, params={"cid": cid, "lang": lang}, headers=headers
    )
    check_upstream(resp)
    templates = resp.json().get("templates") or []
    if not templates:
        template = None
    else:
        source = templates[0]
        template = {
            "cid": source.get("cid"),
            "lang": source.get("lang"),
            "subject": source.get("subject"),
            "text": source.get("data"),
            "html": None,
        }
    _template_cache_set(key, template)
    return template


def _template_variable_names(templates: list[dict]) -> list[str]:
    names: list[str] = []
    seen: set[str] = set()
    for template in templates:
        for name in _extract_template_variables(
            template.get("subject"), template.get("text"), template.get("html")
        ):
            if name not in seen:
                seen.add(name)
                names.append(name)
    return names


def _lang_for_attendee(templates: list[dict], attendee: dict) -> str | None:
    if not templates:
        return None
    preferred = attendee.get("registration_language")
    for template in templates:
        if template.get("lang") == preferred:
            return preferred
    template_langs = [entry.get("lang") for entry in templates]
    err_msg = f'Preferred language {preferred} has no match in {template_langs}'
    raise KeyError(err_msg)


async def _fetch_templates(
    client: httpx.AsyncClient, cid: str, headers: dict
) -> list[dict]:
    key = ("templates", cid)
    cached = _template_cache_get(key)
    if cached is not _NO_CACHE_ENTRY:
        return cached

    url = f"{_mail_service_url}/api/v1/templates"
    resp = await client.get(url, params={"cid": cid}, headers=headers)
    check_upstream(resp)
    templates = [
        {
            "cid": source.get("cid"),
            "lang": source.get("lang"),
            "subject": source.get("subject"),
            "text": source.get("data"),
            "html": None,
        }
        for source in resp.json().get("templates") or []
    ]
    _template_cache_set(key, templates)
    return templates


async def _fetch_attendees(
    client: httpx.AsyncClient, attendee_ids: list[int], headers: dict
) -> dict[int, dict]:
    resp = await client.post(
        f"{_attendee_service_url}/api/rest/v1/attendees/find",
        json={
            "match_any": [{"ids": attendee_ids}],
            "fill_fields": ["registration_language", "first_name", "last_name", "email", "flags_list", "nickname", "id", "total_dues", "payment_balance", "current_dues", "status", "badge_id", "birthday"],
        },
        headers=headers,
    )
    check_upstream(resp)
    attendees: dict[int, dict] = {}
    for attendee in resp.json().get("attendees") or []:
        attendees[int(attendee["id"])] = attendee
    return attendees


def _error_detail(resp: httpx.Response) -> str | None:
    if "application/json" in resp.headers.get("content-type", ""):
        try:
            body = resp.json()
        except ValueError:
            body = None
        if isinstance(body, dict) and body.get("message"):
            return body["message"]
    return resp.text


async def _fetch_template_and_attendees(
    client: httpx.AsyncClient,
    cid: str,
    lang: str,
    attendee_ids: list[int],
    headers: dict,
) -> tuple[dict | None, dict[int, dict], list[str]]:
    attendees = await _fetch_attendees(client, attendee_ids, headers)
    template = await _fetch_template(client, cid, lang, headers)
    variable_names = (
        _extract_template_variables(
            template.get("subject"), template.get("text"), template.get("html")
        )
        if template
        else []
    )
    return template, attendees, variable_names


def _not_found_entry(attendee_id: int) -> dict:
    return {
        "attendee_id": attendee_id,
        "ok": False,
        "recipient": str(attendee_id),
        "attendee_lang": None,
        "template_lang": None,
        "detail": "attendee.notfound.error",
    }


def _send_result(
    attendee_id: int,
    recipient: str,
    ok: bool,
    status_code: int | None,
    detail: str | None,
    attendee_lang: str | None = None,
    template_lang: str | None = None,
) -> dict:
    return {
        "ok": ok,
        "attendee_id": attendee_id,
        "recipient": recipient,
        "status_code": status_code,
        "detail": detail,
        "attendee_lang": attendee_lang,
        "template_lang": template_lang,
    }


@router.get("/mail/templates")
async def list_mail_templates(
    claims: Annotated[dict, Security(verify_admin)],
    not_revoked: Annotated[None, Security(verify_not_revoked)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
    cid: str | None = None,
    lang: str | None = None,
) -> dict:
    headers = proxy_headers(JWT, AUTH)
    params: dict[str, str] = {}
    if cid:
        params["cid"] = cid
    if lang:
        params["lang"] = lang

    url = f"{_mail_service_url}/api/v1/templates"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, params=params, headers=headers)
    check_upstream(resp)

    templates = sorted(
        (
            {
                "cid": t["cid"],
                "lang": t["lang"],
                "subject": t.get("subject"),
                "text": t.get("data"),
                "html": None,
            }
            for t in resp.json().get("templates") or []
        ),
        key=lambda t: (t["cid"], t["lang"]),
    )
    return {"templates": templates}


@router.post("/mail/preview")
async def preview_mail(
    request: MailPreviewRequest,
    claims: Annotated[dict, Security(verify_admin)],
    not_revoked: Annotated[None, Security(verify_not_revoked)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
    if not request.attendee_ids:
        raise HTTPException(status_code=400, detail="no attendees given")

    headers = proxy_headers(JWT, AUTH)
    async with httpx.AsyncClient(timeout=30) as client:
        template, attendees, variable_names = await _fetch_template_and_attendees(
            client, request.cid, request.lang, request.attendee_ids, headers
        )

        recipients: list[dict] = []
        for attendee_id in request.attendee_ids:
            attendee = attendees.get(attendee_id)
            if attendee is None:
                recipients.append(
                    {"id": attendee_id, **_not_found_entry(attendee_id)}
                )
                continue
            variables = _build_mail_variables(
                attendee, variable_names, request.variables
            )
            fields = _render_template_fields(template, variables)
            recipients.append(
                {
                    "id": attendee_id,
                    "email": attendee.get("email"),
                    "variables": variables,
                    **fields,
                }
            )

    return {"recipients": recipients}


@router.post("/mail/mass")
async def send_mass_mail(
    request: MassMailRequest,
    claims: Annotated[dict, Security(verify_admin)],
    not_revoked: Annotated[None, Security(verify_not_revoked)],
    JWT: Annotated[str | None, Cookie()] = None,
    AUTH: Annotated[str | None, Cookie()] = None,
) -> dict:
    if not request.attendee_ids:
        raise HTTPException(status_code=400, detail="no attendees given")

    headers = proxy_headers(JWT, AUTH)
    mail_url = f"{_mail_service_url}/api/v1/mail"

    async with httpx.AsyncClient(timeout=30) as client:
        templates = await _fetch_templates(client, request.cid, headers)
        if not templates:
            raise HTTPException(
                status_code=404, detail="template.notfound.error"
            )
        attendees = await _fetch_attendees(
            client, request.attendee_ids, headers
        )
        variable_names = _template_variable_names(templates)

        recipients: list[dict] = []
        for attendee_id in request.attendee_ids:
            attendee = attendees.get(attendee_id)
            if attendee is None:
                recipients.append(_not_found_entry(attendee_id))
                continue
            attendee_lang = attendee["registration_language"]
            template_lang = _lang_for_attendee(templates, attendee)
            if "nobulkmail" in (attendee.get("flags_list") or []):
                recipients.append({
                    "attendee_id": attendee_id,
                    "ok": False,
                    "recipient": attendee.get("email") or str(attendee_id),
                    "attendee_lang": attendee_lang,
                    "template_lang": template_lang,
                    "detail": "attendee.nobulkmail.error",
                })
                continue
            email = attendee.get("email")
            if not email:
                recipients.append({
                    "attendee_id": attendee_id,
                    "ok": False,
                    "recipient": str(attendee_id),
                    "attendee_lang": attendee_lang,
                    "template_lang": template_lang,
                    "detail": "attendee.noemail.error",
                })
                continue
            recipients.append({
                "attendee_id": attendee_id,
                "ok": True,
                "email": str(email),
                "attendee_lang": attendee_lang,
                "template_lang": template_lang,
                "variables": _build_mail_variables(
                    attendee, variable_names, request.variables
                ),
            })

        concurrency = min(10, len(recipients))
        semaphore = asyncio.Semaphore(concurrency)

        async def send_one(recipient: dict) -> dict:
            if not recipient["ok"]:
                return _send_result(
                    recipient["attendee_id"],
                    recipient["recipient"],
                    False,
                    None,
                    recipient["detail"],
                    recipient.get("attendee_lang"),
                    recipient.get("template_lang"),
                )
            async with semaphore:
                try:
                    resp = await client.post(
                        mail_url,
                        json={
                            "cid": request.cid,
                            "lang": recipient["template_lang"],
                            "to": [recipient["email"]],
                            "cc": request.cc,
                            "bcc": request.bcc,
                            "variables": recipient["variables"],
                        },
                        headers=headers,
                    )
                except httpx.HTTPError as e:
                    return _send_result(
                        recipient["attendee_id"],
                        recipient["email"],
                        False,
                        None,
                        str(e),
                        recipient.get("attendee_lang"),
                        recipient.get("template_lang"),
                    )
                if resp.is_success:
                    return _send_result(
                        recipient["attendee_id"],
                        recipient["email"],
                        True,
                        resp.status_code,
                        None,
                        recipient.get("attendee_lang"),
                        recipient.get("template_lang"),
                    )
                return _send_result(
                    recipient["attendee_id"],
                    recipient["email"],
                    False,
                    resp.status_code,
                    _error_detail(resp),
                    recipient.get("attendee_lang"),
                    recipient.get("template_lang"),
                )

        results = await asyncio.gather(*(send_one(r) for r in recipients))

    sent_entries: list[dict] = [
        {
            k: r[k]
            for k in (
                "attendee_id",
                "recipient",
                "status_code",
                "attendee_lang",
                "template_lang",
            )
        }
        for r in results
        if r["ok"]
    ]
    failures: list[dict] = [
        {
            k: r[k]
            for k in (
                "attendee_id",
                "recipient",
                "status_code",
                "detail",
                "attendee_lang",
                "template_lang",
            )
        }
        for r in results
        if not r["ok"]
    ]
    sent = len(sent_entries)

    return {
        "total": len(request.attendee_ids),
        "sent": sent,
        "failed": len(failures),
        "sent_entries": sent_entries,
        "failures": failures,
    }
