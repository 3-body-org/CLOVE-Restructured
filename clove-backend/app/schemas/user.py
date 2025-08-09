# app/schemas/user.py
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    birthday: date
    is_adaptive: bool = True
    bio: Optional[str] = None
    profile_photo_url: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(min_length=8)

class UserUpdate(BaseModel):
    current_password: Optional[str] = None  # For verification
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    birthday: Optional[date] = None
    is_adaptive: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)
    bio: Optional[str] = None
    profile_photo_url: Optional[str] = None

class UserRead(UserBase):
    id: int
    username: str
    created_at: datetime
    login_attempts: int
    last_failed_login: Optional[datetime] = None
    login_cooldown_until: Optional[datetime] = None
    is_active: bool
    email_verified: bool

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

class EmailVerificationRequest(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

class MessageResponse(BaseModel):
    message: str
