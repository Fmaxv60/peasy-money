from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from routes.auth import get_current_user
from models import User

router = APIRouter()

class UserRead(BaseModel):
    username: str
    email: str


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
