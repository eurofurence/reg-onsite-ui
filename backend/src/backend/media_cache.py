import hashlib
from collections import OrderedDict
from dataclasses import dataclass

_MAX_CACHE_ENTRIES = 200


@dataclass
class CachedMedia:
    content: bytes
    content_type: str


_cache: OrderedDict[str, CachedMedia] = OrderedDict()


def store_bytes(content: bytes, content_type: str) -> str:
    key = hashlib.sha256(content).hexdigest()
    _cache[key] = CachedMedia(content=content, content_type=content_type)
    _cache.move_to_end(key)
    while len(_cache) > _MAX_CACHE_ENTRIES:
        _cache.popitem(last=False)
    return key


def get(key: str) -> CachedMedia | None:
    return _cache.get(key)
