from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select, Session
from sqlalchemy import func, cast, Date, case
from typing import List, Dict, Optional
from db import get_session
import logging
from models import PEAHistoryPoint, Transaction, TransactionCreate, DailyQuantity, DailyQuantityByTicker, User
from routes.auth import get_current_user
from services.transactions import *
from datetime import date, timedelta
import yfinance as yf

router = APIRouter()
logger = logging.getLogger("api.log")


# -------------------------- GET --------------------------

@router.get("/", response_model=List[Transaction], tags=["Transactions"])
async def get_transactions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    limit: int = Query(None, le=100, alias="page_size"),
    offset: int = Query(0, ge=0, alias="page")
):
    """
    Get transactions for the authenticated user, with optional pagination.
    """
    return get_user_transactions(session, current_user, limit, offset)


@router.get("/total", response_model=int, tags=["Transactions"])
async def get_total_transactions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get the total number of transactions for the authenticated user.
    """
    return get_user_total_transactions(session, current_user)


@router.get("/{transaction_id}", response_model=Transaction, tags=["Transactions"])
async def get_transaction(
    transaction_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific transaction for the authenticated user.
    """
    return get_user_transaction_by_id(transaction_id, session, current_user)


@router.get("/tickers/", response_model=List[str], tags=["Transactions"])
async def get_all_tickers(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tickers for the authenticated user.
    """
    return get_user_all_tickers(session, current_user)


@router.get("/ticker/daily-quantity/", response_model=List[DailyQuantity], tags=["Transactions"])
async def get_daily_quantity_by_ticker(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get the daily quantity of each ticker for the authenticated user.
    """
    return get_user_daily_quantity_by_ticker(session, current_user)


@router.get("/ticker/daily-quantity/{transaction_ticker}", response_model=List[DailyQuantityByTicker], tags=["Transactions"])
async def get_daily_quantity_by_ticker(
    transaction_ticker: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    daily_changes_subquery = (
        select(
            Transaction.date_of.label("date"),
            func.sum(
                case(
                    (Transaction.type == "achat", Transaction.quantity),
                    else_=-Transaction.quantity,
                )
            ).label("daily_change"),
        )
        .where(
            Transaction.ticker == transaction_ticker,
            Transaction.user_id == current_user.id
        )
        .group_by("date")
        .subquery()
    )

    daily_quantity_query = (
        select(
            daily_changes_subquery.c.date,
            func.sum(daily_changes_subquery.c.daily_change)
            .over(order_by=daily_changes_subquery.c.date)
            .label("cumulative_quantity"),
        )
        .order_by(daily_changes_subquery.c.date)
    )

    results = session.exec(daily_quantity_query).all()

    formatted_results = [
        {"date": date, "quantity": quantity} for date, quantity in results
    ]

    return formatted_results


@router.get("/price/total_invest", response_model=float, tags=["Transactions"])
def get_total_invest_price(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return get_user_total_invest_price(session, current_user)


@router.get("/price/total", response_model=float, tags=["Transactions"])
def get_total_price_by_date(
    date_param: Optional[date] = Query(default=None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return get_user_total_price_by_date(date_param, session, current_user)

@router.get("/price/total_history", response_model=List[PEAHistoryPoint], tags=["Transactions"])
def get_pea_history(
    period: str = Query(default="5a"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return get_user_pea_history(period, session, current_user)

# -------------------------- POST --------------------------

@router.post("/", response_model=Transaction, tags=["Transactions"])
def create_transaction(
    transaction_in: TransactionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        transaction = Transaction(**transaction_in.model_dump(), user_id=current_user.id)
        session.add(transaction)
        session.commit()
        session.refresh(transaction)
        return transaction
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
