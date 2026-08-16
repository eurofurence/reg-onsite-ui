from fastapi import FastAPI

from backend import attendee, idp, media, payment, sumup

app = FastAPI()

app.include_router(sumup.router)
app.include_router(payment.router)
app.include_router(idp.router)
app.include_router(attendee.router)
app.include_router(media.router)


@app.get("/")
def health_check() -> dict:
    return {"status": "ok"}
