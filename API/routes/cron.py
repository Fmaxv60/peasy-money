from fastapi import APIRouter, Depends
from sqlmodel import Session
from db import get_session
from services.cron import update_pea_history_yesterday, update_ticker, update_pea_history_for_month

router = APIRouter()

@router.get("/history/update")
def force_update_pea_history(session: Session = Depends(get_session)):
    update_pea_history_yesterday(session)
    return {"message": "PEA history updated for yesterday"}

@router.get("/history/update_month")
def force_update_pea_history_for_month(year: int, month: int, session: Session = Depends(get_session)):
    update_pea_history_for_month(session, year, month)
    return {"message": f"PEA history updated for {month}/{year}"}

@router.get("/tickers/update")
def force_update_tickers(session: Session = Depends(get_session)):
    update_ticker(session)
    return {"message": "Tickers updated"}
