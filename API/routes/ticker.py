from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlmodel import Session
from db import get_session
from models import Ticker, User
from routes.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_all_tickers(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> dict[str, str]:
    """
    Get all distinct tickers
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    tickers = session.exec(
        select(Ticker).distinct().order_by(Ticker.symbol)
    ).scalars().all()

    formatted_tickers = {t.name: t.symbol for t in tickers}

    return formatted_tickers