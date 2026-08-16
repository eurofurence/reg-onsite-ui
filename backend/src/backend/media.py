import hashlib
from typing import Annotated

import httpx
from fastapi import APIRouter, HTTPException, Response, Security, UploadFile
from pydantic import BaseModel

from backend import media_cache
from backend.auth import verify_admin

router = APIRouter(prefix="/api/v1")

_MAX_MEDIA_BYTES = 20 * 1024 * 1024


class CacheUrlRequest(BaseModel):
    url: str
    force: bool = False


class CacheResponse(BaseModel):
    key: str


async def _fetch_bounded(url: str) -> tuple[bytes, str]:
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        async with client.stream("GET", url) as resp:
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail="failed to fetch url")
            content_type = resp.headers.get("content-type", "application/octet-stream")
            chunks: list[bytes] = []
            total = 0
            async for chunk in resp.aiter_bytes():
                total += len(chunk)
                if total > _MAX_MEDIA_BYTES:
                    raise HTTPException(status_code=413, detail="url content too large")
                chunks.append(chunk)
            return b"".join(chunks), content_type


@router.post("/media/cache-url")
async def cache_url(
    request: CacheUrlRequest,
    claims: Annotated[dict, Security(verify_admin)],
) -> CacheResponse:
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="url must not be empty")
    if not request.force:
        source_hash = hashlib.sha256(url.encode()).hexdigest()
        existing_key = media_cache.find_by_source_hash(source_hash)
        if existing_key is not None:
            return CacheResponse(key=existing_key)
    content, content_type = await _fetch_bounded(url)
    key = media_cache.store_bytes(url, content, content_type)
    return CacheResponse(key=key)


@router.post("/media/cache-upload")
async def cache_upload(
    file: UploadFile,
    claims: Annotated[dict, Security(verify_admin)],
) -> CacheResponse:
    content = await file.read()
    if len(content) > _MAX_MEDIA_BYTES:
        raise HTTPException(status_code=413, detail="file too large")
    content_type = file.content_type or "application/octet-stream"
    source = file.filename or "upload"
    key = media_cache.store_bytes(source, content, content_type)
    return CacheResponse(key=key)


@router.get("/media/cache/{key}")
async def get_cached_media(key: str) -> Response:
    resolved_key = key
    cached = media_cache.get(key)
    if cached is None:
        resolved_key = media_cache.find_by_source_hash(key)
        if resolved_key is not None:
            cached = media_cache.get(resolved_key)
    if cached is None or resolved_key is None:
        raise HTTPException(status_code=404, detail="not found")
    return Response(
        content=cached.content,
        media_type=cached.content_type,
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Cache-Key": resolved_key,
        },
    )
