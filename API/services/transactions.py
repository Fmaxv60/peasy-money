from collections import defaultdict
from datetime import date, timedelta
from typing import List, Optional
from fastapi import Depends, HTTPException, Query
from sqlalchemy import func
from sqlmodel import Session, select
from db import get_session
from models import DailyQuantity, Transaction, User
from routes.auth import get_current_user
from dateutil.relativedelta import relativedelta
import yfinance as yf
from services.utils import *


def get_user_transactions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    limit: int = Query(None, le=100, alias="page_size"),
    offset: int = Query(0, ge=0, alias="page")
) -> List[Transaction]:
    query = select(Transaction).where(Transaction.user_id == current_user.id)

    if limit is None:
        transactions = session.exec(query).all()
    else:
        transactions = session.exec(query.offset(offset).limit(limit)).all()

    return transactions


def get_user_total_transactions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> int:
    total = session.exec(
        select(func.count(Transaction.id)).where(Transaction.user_id == current_user.id)
    ).first()
    return total


def get_user_transaction_by_id(
    transaction_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> Transaction:
    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this transaction")

    return transaction


def get_user_all_tickers(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> List[DailyQuantity]:
    tickers = session.exec(
        select(Transaction.ticker)
        .where(Transaction.user_id == current_user.id)
        .distinct()
    ).all()
    return tickers


def get_user_daily_quantity_by_ticker(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    transactions = session.exec(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.date_of)
    ).all()

    if not transactions:
        return []

    start_date = transactions[0].date_of
    end_date = date.today()

    current_holdings = defaultdict(float)
    last_recorded = {}

    history = []

    tx_by_day = defaultdict(list)
    for tx in transactions:
        tx_by_day[tx.date_of].append(tx)

    current_day = start_date
    while current_day <= end_date:
        for tx in tx_by_day.get(current_day, []):
            if tx.type == "achat":
                current_holdings[tx.ticker] += tx.quantity
            elif tx.type == "vente":
                current_holdings[tx.ticker] -= tx.quantity

        visible_holdings = {
            ticker: round(qty, 6)
            for ticker, qty in current_holdings.items()
            if qty > 0
        }

        if visible_holdings != last_recorded:
            history.append(DailyQuantity(
                date=current_day,
                tickers=dict(sorted(visible_holdings.items()))
            ))
            last_recorded = visible_holdings.copy()

        current_day += timedelta(days=1)

    return history


def get_user_total_invest_price(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    transactions = session.exec(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
    ).all()

    total = 0.0

    for tx in transactions:
        montant = tx.price * tx.quantity
        if tx.type == "achat":
            total += montant
        elif tx.type == "vente":
            total -= montant
        else:
            print(f"Type de transaction inconnu : {tx.type}")

    return total


def get_user_total_price_by_date(
    date_param: Optional[date] = Query(default=None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    target_date = date_param or date.today()
    
    transactions = session.exec(
        select(Transaction.ticker, Transaction.quantity, Transaction.type)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.date_of <= target_date
        )
    ).all()

    quantities_by_ticker = defaultdict(float)
    for tx in transactions:
        if tx.type == "achat":
            quantities_by_ticker[tx.ticker] += tx.quantity
        elif tx.type == "vente":
            quantities_by_ticker[tx.ticker] -= tx.quantity

    total = 0.0

    for ticker, total_quantity in quantities_by_ticker.items():
        try:
            yf_ticker = yf.Ticker(ticker)

            history = yf_ticker.history(period="30d", interval="1d")
            valid_dates = history[history.index.date <= target_date]

            if not valid_dates.empty:
                price = valid_dates["Close"].iloc[-1]
            else:
                continue

            if price is None:
                continue

            total += price * total_quantity

        except Exception as e:
            continue

    return total


def get_user_pea_history(
    period: str = Query(default="5a"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        delta = parse_period(period)
        if delta is None:
            raise ValueError("Invalid period")
    except ValueError as e:
        return {"error": str(e)}

    end_date = date.today()
    start_date = end_date - delta

    # Obtenir les dates de changement de quantités
    transactions = session.exec(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.date_of)
    ).all()

    quantity_change_dates = set()
    current_holdings = defaultdict(float)
    last_snapshot = {}

    for tx in transactions:
        if tx.type == "achat":
            current_holdings[tx.ticker] += tx.quantity
        elif tx.type == "vente":
            current_holdings[tx.ticker] -= tx.quantity

        snapshot = {
            ticker: round(qty, 6)
            for ticker, qty in current_holdings.items()
            if qty > 0
        }

        if snapshot != last_snapshot:
            quantity_change_dates.add(tx.date_of)
            last_snapshot = snapshot.copy()

    # Générer des dates régulières (tous les 7 jours ou tous les mois)
    interval_dates = set()
    # Comparaison entre dates pour éviter TypeError
    one_month_ago = end_date - relativedelta(months=1)
    if start_date < one_month_ago:
        # période > 1 mois => points tous les 7 jours
        current = start_date
        while current <= end_date:
            interval_dates.add(current)
            current += timedelta(days=7)
    else:
        # période <= 1 mois => points tous les mois
        current = start_date
        while current <= end_date:
            interval_dates.add(current)
            current += relativedelta(months=1)

    # Fusion des deux types de dates
    all_dates = sorted(quantity_change_dates.union(interval_dates))

    history_data = []

    for target_date in all_dates:
        transactions_until_date = session.exec(
            select(Transaction.ticker, Transaction.quantity, Transaction.type)
            .where(
                Transaction.user_id == current_user.id,
                Transaction.date_of <= target_date
            )
        ).all()

        quantities_by_ticker = defaultdict(float)
        for tx in transactions_until_date:
            if tx.type == "achat":
                quantities_by_ticker[tx.ticker] += tx.quantity
            elif tx.type == "vente":
                quantities_by_ticker[tx.ticker] -= tx.quantity

        total = 0.0
        for ticker, total_quantity in quantities_by_ticker.items():
            try:
                yf_ticker = yf.Ticker(ticker)
                history = yf_ticker.history(period="30d", interval="1d")
                valid_prices = history[history.index.date <= target_date]
                if not valid_prices.empty:
                    price = valid_prices["Close"].iloc[-1]
                    total += price * total_quantity
            except:
                continue

        history_data.append({
            "date": target_date.isoformat(),
            "value": total
        })

    return history_data
