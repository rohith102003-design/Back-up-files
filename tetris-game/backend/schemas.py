from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# ---------- USER SCHEMAS ----------
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    class Config:
        orm_mode = True

# ---------- SCORE SCHEMAS ----------
class ScoreCreate(BaseModel):
    value: int

class ScoreResponse(BaseModel):
    id: int
    value: int
    created_at: datetime
    user: UserResponse
    class Config:
        orm_mode = True

# ---------- AUTH / TOKEN SCHEMAS ----------
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
