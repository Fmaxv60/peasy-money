from sqlmodel import SQLModel, create_engine
from sqlmodel import Session
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)

async def get_session():
    with Session(engine) as session:
        yield session