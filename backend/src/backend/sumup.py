import asyncio
import uuid
from typing import Annotated

import httpx
from fastapi import APIRouter, Body, HTTPException, Security

from backend.auth import verify_admin
from backend.env_defaults import getenv

router = APIRouter(prefix="/api/v1")

_access_token: str = getenv("SUMUP_ACCESS_TOKEN")
_merchant_code: str = getenv("SUMUP_MERCHANT_CODE")

# Only the most recent SumUp product-count job is kept — the UI only ever
# cares about "the current fetch", so starting a new job discards the old one.
_job: dict | None = None
# Cursor for SumUp's oldest_ref history param — the most recent transaction
# id seen, so subsequent runs only page through transactions created since.
_last_tx_id: str | None = None
# Running product-name -> quantity totals across all transactions ever
# seen; persisted across jobs so repeat fetches only add newly seen sales.
_product_counts: dict[str, int] = {}
# Bumped whenever setup resets the cache, so an in-flight job started before
# a credential change doesn't write stale-account data into the fresh state.
_generation: int = 0

_AUTO_FETCH_INTERVAL_SECONDS = 15 * 60


@router.put("/sumup/credentials")
async def setup(
    claims: Annotated[dict, Security(verify_admin)],
    token: Annotated[str, Body(embed=True)],
    merchant_code: Annotated[str, Body(embed=True)],
) -> dict:
    global _access_token, _merchant_code, _last_tx_id, _product_counts, _job, _generation
    _access_token = token
    _merchant_code = merchant_code
    # New credentials may point at a different account/con — the resume
    # cursor and accumulated counts from before are no longer valid. Bump
    # the generation so any in-flight job from before this reset discards
    # its results instead of merging them into the fresh state.
    _last_tx_id = None
    _product_counts = {}
    _job = None
    _generation += 1
    return {"status": "ok"}


def _parse_product_lines(detail_json: dict) -> list[tuple[str, int]]:
    lines: list[tuple[str, int]] = []
    for item in detail_json.get("products") or []:
        name = item.get("name") or "(unknown)"
        description = item.get("description") or ""
        key = f"{name}: {description}" if description else name
        lines.append((key, item.get("quantity", 1)))
    return lines


async def _run_product_counts_job(job: dict, generation: int) -> None:
    global _last_tx_id
    headers = {"Authorization": f"Bearer {_access_token}"}
    try:
        transactions: list[dict] = []
        sem = asyncio.Semaphore(10)

        async with httpx.AsyncClient(timeout=30) as client:
            query = "limit=100"
            if _last_tx_id:
                query += f"&oldest_ref={_last_tx_id}"
            while True:
                resp = await client.get(
                    f"https://api.sumup.com/v0.1/me/transactions/history?{query}",
                    headers=headers,
                )
                resp.raise_for_status()
                page = resp.json()
                items = page.get("items", [])
                transactions.extend(items)
                job["pages_fetched"] += 1
                next_link = next((l for l in page.get("links", []) if l.get("rel") == "next"), None)
                if not next_link:
                    break
                query = next_link["href"]

            transactions.sort(key=lambda tx: tx["timestamp"])
            job["transactions_found"] = len(transactions)

            async def fetch_detail(tx_id: str) -> list[tuple[str, int]]:
                async with sem:
                    resp = await client.get(
                        f"https://api.sumup.com/v2.1/merchants/{_merchant_code}/transactions?id={tx_id}",
                        headers=headers,
                    )
                    resp.raise_for_status()
                    return _parse_product_lines(resp.json())

            # Fetch details concurrently for progress feedback, but only ever
            # advance the resume cursor past a contiguous (ascending-order)
            # prefix of transactions whose detail fetch succeeded — so a
            # failure partway through leaves the cursor before the gap
            # instead of skipping an unfetched transaction on the next run.
            detail_tasks = [asyncio.ensure_future(fetch_detail(tx["id"])) for tx in transactions]
            for done_task in asyncio.as_completed(detail_tasks):
                try:
                    await done_task
                except Exception:
                    pass
                job["details_fetched"] += 1

            newest_ok_index = -1
            for index, task in enumerate(detail_tasks):
                if task.exception() is not None:
                    break
                newest_ok_index = index

            if generation != _generation:
                # Setup was reconfigured while this job was running — discard
                # results rather than merging stale-account data into the
                # freshly reset cache.
                job["status"] = "error"
                job["error"] = "SumUp setup changed during fetch"
                return

            for index in range(newest_ok_index + 1):
                for key, quantity in detail_tasks[index].result():
                    _product_counts[key] = _product_counts.get(key, 0) + quantity

            if newest_ok_index >= 0:
                _last_tx_id = transactions[newest_ok_index]["id"]

        job["status"] = "done"
        job["counts"] = dict(_product_counts)
    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)


def _start_job_if_idle() -> str | None:
    global _job
    if not _access_token:
        return None

    if _job is not None and _job["status"] == "running":
        return _job["id"]

    job_id = uuid.uuid4().hex
    _job = {
        "id": job_id,
        "status": "running",
        "pages_fetched": 0,
        "transactions_found": 0,
        "details_fetched": 0,
        "counts": None,
        "error": None,
    }
    asyncio.create_task(_run_product_counts_job(_job, _generation))
    return job_id


async def run_auto_fetch_loop() -> None:
    while True:
        await asyncio.sleep(_AUTO_FETCH_INTERVAL_SECONDS)
        _start_job_if_idle()


@router.post("/sumup/product-count-job")
async def start_product_counts(
    claims: Annotated[dict, Security(verify_admin)],
) -> dict:
    job_id = _start_job_if_idle()
    if job_id is None:
        raise HTTPException(status_code=503, detail="SumUp token not configured")
    return {"job_id": job_id}


@router.get("/sumup/product-count-job")
async def get_product_counts_status(
    claims: Annotated[dict, Security(verify_admin)],
) -> dict:
    if _job is None:
        raise HTTPException(status_code=404, detail="job not found")
    return _job
