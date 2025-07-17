from fastapi import FastAPI
from routes import auth, transaction, user, cron, ticker
from db import init_db
from fastapi.middleware.cors import CORSMiddleware



description = """
Peasy Money is a light and playful web app designed to help you track your investments inside a French PEA (Plan d'Épargne en Actions).

Log your trades, monitor your portfolio evolution, and prep your way to a maybe glorious retirement — one stonk at a time.
"""


app = FastAPI(
    title="Peasy Money API",
    version="0.1.0",
    description=description,
    swagger_ui_parameters={"defaultModelsExpandDepth": -1}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(transaction.router, prefix="/api/transaction")
app.include_router(ticker.router, prefix="/api/ticker", tags=["Ticker"])
app.include_router(cron.router, prefix="/api/cron", tags=['Cron'])
app.include_router(user.router, prefix="/api/user", tags=['User'])