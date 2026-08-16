from fastapi import FastAPI

from backend import attendee, idp, payment, sumup

app = FastAPI()

app.include_router(sumup.router)
app.include_router(payment.router)
app.include_router(idp.router)
app.include_router(attendee.router)


@app.get("/")
def health_check() -> dict:
    return {"status": "ok"}
