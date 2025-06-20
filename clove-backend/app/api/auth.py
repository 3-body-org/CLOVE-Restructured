# app/api/auth.py

from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone

from app.schemas.user import UserCreate, UserRead, Token, UserLogin
from app.crud.user import (
    get_by_email,
    get_by_username,
    create_user,
    init_user_data,
    get_by_id
)
from app.db.session import get_db
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token
)
from app.crud.statistic import update_login_streak

router = APIRouter(prefix="/auth", tags=["auth"])

# Custom OAuth2 form handler that maps username to email
async def oauth2_form_login(
    username: str = Form(...),  # This will be treated as email
    password: str = Form(...)
):
    return {"email": username, "password": password}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Constants for login attempt tracking
MAX_LOGIN_ATTEMPTS = 5
COOLDOWN_MINUTES = 15

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    payload = verify_token(token)
    user = await get_by_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user. Checks for existing email/username first.
    """
    print('DEBUG: type(db) in signup =', type(db))
    # 1) Check for duplicate email
    existing = await get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2) Check for duplicate username
    existing = await get_by_username(db, username=user_in.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # 3) Hash the password, then create
    hashed_pw = get_password_hash(user_in.password)
    user = await create_user(
        db,
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_pw
    )

    await init_user_data(db, user.id)
    
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: dict = Depends(oauth2_form_login),
    db: AsyncSession = Depends(get_db)
):
    """Login user and return access and refresh tokens using email and password."""
    user = await get_by_email(db, email=form_data["email"])
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is in cooldown
    if user.login_cooldown_until and user.login_cooldown_until > datetime.now(timezone.utc):
        remaining_time = (user.login_cooldown_until - datetime.now(timezone.utc)).total_seconds() / 60
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Please try again in {int(remaining_time)} minutes",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(form_data["password"], user.password_hash):
        # Increment failed login attempts
        user.login_attempts += 1
        user.last_failed_login = datetime.now(timezone.utc)
        
        # If max attempts reached, set cooldown
        if user.login_attempts >= MAX_LOGIN_ATTEMPTS:
            user.login_cooldown_until = datetime.now(timezone.utc) + timedelta(minutes=COOLDOWN_MINUTES)
        
        await db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Reset login attempts on successful login
    user.login_attempts = 0
    user.last_failed_login = None
    user.login_cooldown_until = None
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    # Update login streak
    await update_login_streak(db, user.id, datetime.now(timezone.utc).date())

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Get new access token using refresh token."""
    payload = verify_token(refresh_token, "refresh")
    user = await get_by_id(db, int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user = Depends(get_current_user)):
    """Get current user information."""
    return current_user