import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend import attendee, idp, payment, sumup


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(sumup.run_auto_fetch_loop())
    yield
    task.cancel()


app = FastAPI(lifespan=lifespan)

app.include_router(sumup.router)
app.include_router(payment.router)
app.include_router(idp.router)
app.include_router(attendee.router)


@app.get("/")
def health_check() -> dict:
    return {"status": "ok"}
