from fastapi import APIRouter, Depends
from sqlmodel import Session
from db import get_session
from services.cron import update_pea_history_yesterday, update_ticker

router = APIRouter()

@router.get("/history/update")
def force_update_pea_history(session: Session = Depends(get_session)):
    update_pea_history_yesterday(session)
    return {"message": "PEA history updated for yesterday"}

@router.get("/tickers/update")
def force_update_tickers(session: Session = Depends(get_session)):
    update_ticker(session)
    return {"message": "Tickers updated"}
