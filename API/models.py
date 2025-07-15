from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
from typing import Dict, Optional
from datetime import date, datetime

class TransactionType(str, Enum):
    achat = "achat"
    vente = "vente"

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: TransactionType
    ticker: str = Field(foreign_key="ticker.symbol")
    quantity: int
    price: float
    date_of: date
    user_id: int = Field(foreign_key="user.id")

    user: "User" = Relationship(back_populates="transactions")

class TransactionCreate(SQLModel):
    type: TransactionType
    ticker: str
    quantity: int
    price: float
    date_of: date

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.now)
    # subscription: str = Field(default="free")

    transactions: list[Transaction] = Relationship(back_populates="user")

class DailyQuantity(SQLModel):
    date: date
    tickers: Dict[str, int]

class DailyQuantityByTicker(SQLModel):
    date: date
    quantity: int

class PEAHistoryPoint(SQLModel):
    date: date
    value: float

class PEAHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: date
    User: int = Field(foreign_key="user.id")
    total_invested: float

class Ticker(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    symbol: str