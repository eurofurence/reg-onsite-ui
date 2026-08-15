import json
import os
from pathlib import Path

_DEFAULTS: dict[str, str] = json.loads(
    (Path(__file__).parent / "env_defaults.json").read_text()
)


def getenv(key: str) -> str:
    return os.environ.get(key, _DEFAULTS[key])
