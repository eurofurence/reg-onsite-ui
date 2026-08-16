import hashlib
from collections import OrderedDict
from dataclasses import dataclass

_MAX_CACHE_ENTRIES = 200


@dataclass
class CachedMedia:
    source: str
    content: bytes
    content_type: str


_cache: OrderedDict[str, CachedMedia] = OrderedDict()


def store_bytes(source: str, content: bytes, content_type: str) -> str:
    key = hashlib.sha256(source.encode()).hexdigest()
    _cache[key] = CachedMedia(
        source=source, content=content, content_type=content_type
    )
    _cache.move_to_end(key)
    while len(_cache) > _MAX_CACHE_ENTRIES:
        _cache.popitem(last=False)
    return key


def get(key: str) -> CachedMedia | None:
    return _cache.get(key)


def find_by_source_hashes(source_hashes: list[str]) -> dict[str, str]:
    return {
        source_hash: source_hash
        for source_hash in source_hashes
        if source_hash in _cache
    }
