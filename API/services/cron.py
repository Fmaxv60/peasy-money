from collections import defaultdict
from datetime import date, timedelta
from sqlmodel import Session, select
import yfinance as yf
from models import Transaction, User, PEAHistory, Ticker
from db import get_session

def update_pea_history_yesterday(session: Session):
    target_date = date.today() - timedelta(days=1)

    # Étape 1 : Récupérer tous les tickers nécessaires
    transactions = session.exec(
        select(Transaction)
        .where(Transaction.date_of <= target_date)
    ).all()

    # Mapping : user_id -> list of transactions
    user_transactions = defaultdict(list)
    all_tickers = set()

    for tx in transactions:
        user_transactions[tx.user_id].append(tx)
        all_tickers.add(tx.ticker)

    # Étape 2 : Télécharger les prix de tous les tickers
    try:
        price_data = yf.download(
            tickers=list(all_tickers),
            start=target_date - timedelta(days=30),
            end=target_date + timedelta(days=1),
            interval="1d",
            group_by="ticker",
            progress=False,
            auto_adjust=True,
            threads=True,
        )
    except Exception as e:
        print("Erreur yfinance bulk:", e)
        return

    # Étape 3 : Calcul du total par utilisateur
    for user_id, txs in user_transactions.items():
        quantities_by_ticker = defaultdict(float)
        for tx in txs:
            if tx.type == "achat":
                quantities_by_ticker[tx.ticker] += tx.quantity
            elif tx.type == "vente":
                quantities_by_ticker[tx.ticker] -= tx.quantity

        total = 0.0
        for ticker, total_quantity in quantities_by_ticker.items():
            try:
                df = price_data[ticker] if len(all_tickers) > 1 else price_data
                valid_dates = df[df.index.date <= target_date]
                if not valid_dates.empty:
                    price = valid_dates["Close"].iloc[-1]
                    total += price * total_quantity
            except Exception:
                continue

        # Insertion ou mise à jour dans PEAHistory
        existing = session.exec(
            select(PEAHistory)
            .where(PEAHistory.User == user_id, PEAHistory.date == target_date)
        ).first()

        if existing:
            existing.total_invested = total
        else:
            pea_entry = PEAHistory(
                date=target_date,
                User=user_id,
                total_invested=total
            )
            session.add(pea_entry)

    session.commit()


def update_ticker(session: Session):
    # Récupérer tous les tickers uniques
    tickers = session.exec(select(Transaction.ticker)).unique().all()
    ticker_symbols = set(tickers)

    for symbol in ticker_symbols:
        try:
            yf_ticker = yf.Ticker(symbol)
            info = yf_ticker.info

            if "symbol" in info and "longName" in info:
                existing_ticker = session.exec(
                    select(Ticker).where(Ticker.symbol == symbol)
                ).first()

                if existing_ticker:
                    existing_ticker.name = info["longName"]
                else:
                    new_ticker = Ticker(
                        name=info["longName"],
                        symbol=symbol
                    )
                    session.add(new_ticker)

        except Exception as e:
            print(f"Erreur lors de la mise à jour du ticker {symbol}: {e}")

    session.commit()