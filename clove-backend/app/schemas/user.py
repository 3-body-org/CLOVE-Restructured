# app/schemas/user.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    is_adaptive: bool = True

class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    is_adaptive: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)

class UserRead(UserBase):
    id: int
    created_at: datetime
    login_attempts: int
    last_failed_login: Optional[datetime] = None
    login_cooldown_until: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: int
    username: str
    email: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str
