import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend import attendee, idp, mail, media, payment, sumup

logger = logging.getLogger("uvicorn.error")


def _log_routes(routes, prefix: str = "") -> None:
    for route in routes:
        path = prefix + getattr(route, "path", "")
        methods = ",".join(sorted(getattr(route, "methods", set()) or set())) or "-"
        sub_routes = getattr(getattr(route, "app", None), "routes", None)
        included_router = getattr(route, "original_router", None)
        if sub_routes:
            _log_routes(sub_routes, path)
        elif included_router is not None:
            _log_routes(included_router.routes, path)
        elif path:
            logger.info("route: %s %s", methods, path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _log_routes(app.routes)
    yield


app = FastAPI(lifespan=lifespan)

app.include_router(sumup.router)
app.include_router(payment.router)
app.include_router(idp.router)
app.include_router(attendee.router)
app.include_router(mail.router)
app.include_router(media.router)


@app.get("/")
def health_check() -> dict:
    return {"status": "ok"}
