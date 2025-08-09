# app/api/auth.py

from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone

from app.db.models.users import User
from app.schemas.user import UserCreate, UserRead, Token, UserLogin, EmailVerificationRequest, PasswordResetRequest, PasswordResetConfirm, MessageResponse
from app.crud.user import (
    get_by_email,
    get_by_username,
    create_user,
    get_by_id,
    update_user
)
from app.db.session import get_db
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_verification_token,
    generate_reset_token,
    create_verification_token_expires,
    create_reset_token_expires
)
from app.crud.statistic import update_login_streak
from app.services.email import email_service
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Constants for login attempt tracking
MAX_LOGIN_ATTEMPTS = 10

# Progressive cooldown system
COOLDOWN_THRESHOLDS = {
    3: 10,   # 3 attempts = 10 minutes
    5: 30,   # 5 attempts = 30 minutes  
    10: 60   # 10 attempts = 1 hour
}

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
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return user

async def get_current_superuser(current_user: User = Depends(get_current_user)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user. Checks for existing email first, then auto-generates username.
    """
    print('DEBUG: type(db) in signup =', type(db))
    # 1) Check for duplicate email
    existing = await get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2) Hash the password, then create (username will be auto-generated)
    hashed_pw = get_password_hash(user_in.password)
    user = await create_user(
        db,
        email=user_in.email,
        password_hash=hashed_pw,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        birthday=user_in.birthday
    )

    # 3) Send verification email immediately after signup
    verification_token = generate_verification_token()
    user.email_verification_token = verification_token
    user.email_verification_expires = create_verification_token_expires()
    await db.commit()
    
    # Create verification link
    frontend_url = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "http://localhost:3000"
    verification_link = f"{frontend_url}/verify-email?token={verification_token}"
    
    # Send verification email (don't fail signup if email fails)
    try:
        await email_service.send_verification_email(
            to_email=user.email,
            verification_link=verification_link,
            user_name=user.first_name or "User"
        )
        print(f"Verification email sent to {user.email}")
    except Exception as e:
        print(f"Failed to send verification email: {e}")

    return user

@router.post("/login", response_model=Token)
async def login(
    user_in: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login user and return access and refresh tokens using email and password."""
    user = await get_by_email(db, email=user_in.email)
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if email is verified (skip for superusers)
    if not user.is_superuser and not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in. Check your inbox for a verification link.",
        )

    # Check if user is in cooldown
    if user.login_cooldown_until and user.login_cooldown_until > datetime.now(timezone.utc):
        remaining_seconds = (user.login_cooldown_until - datetime.now(timezone.utc)).total_seconds()
        remaining_hours = int(remaining_seconds // 3600)
        remaining_minutes = int((remaining_seconds % 3600) // 60)
        remaining_secs = int(remaining_seconds % 60)
        
        # Build time message with appropriate units
        time_parts = []
        if remaining_hours > 0:
            time_parts.append(f"{remaining_hours} hour{'s' if remaining_hours != 1 else ''}")
        if remaining_minutes > 0:
            time_parts.append(f"{remaining_minutes} minute{'s' if remaining_minutes != 1 else ''}")
        if remaining_secs > 0:
            time_parts.append(f"{remaining_secs} second{'s' if remaining_secs != 1 else ''}")
        
        # If no time parts (edge case), show "less than a minute"
        if not time_parts:
            time_message = "less than a minute"
        else:
            time_message = ", ".join(time_parts)
            
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Please try again in {time_message}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password
    if not verify_password(user_in.password, user.password_hash):
        # Increment failed login attempts
        user.login_attempts += 1
        user.last_failed_login = datetime.now(timezone.utc)
        
        # Check if we need to set cooldown based on progressive thresholds
        cooldown_minutes = None
        for threshold, minutes in COOLDOWN_THRESHOLDS.items():
            if user.login_attempts == threshold:
                cooldown_minutes = minutes
                print(f"Login cooldown triggered: {user.login_attempts} attempts = {minutes} minutes")
                break
        
        # If cooldown is needed, set it
        if cooldown_minutes:
            user.login_cooldown_until = datetime.now(timezone.utc) + timedelta(minutes=cooldown_minutes)
        
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
    user.is_active = True
    await db.commit()

    # Update login streak (NEW: always update on login)
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

@router.put("/users/{user_id}/set-adaptive", response_model=UserRead)
async def set_user_adaptive_mode(
    user_id: int,
    is_adaptive: bool,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser)
):
    """
    (Admin Only) Manually set a user's is_adaptive flag.
    """
    user_to_update = await get_by_id(db, user_id)
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await update_user(db, user_to_update, {"is_adaptive": is_adaptive})
    return updated_user

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

@router.post("/send-verification", response_model=MessageResponse)
async def send_verification_email(
    request: EmailVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Send email verification link to user"""
    user = await get_by_email(db, email=request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate verification token
    verification_token = generate_verification_token()
    user.email_verification_token = verification_token
    user.email_verification_expires = create_verification_token_expires()
    await db.commit()
    
    # Create verification link
    frontend_url = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "http://localhost:3000"
    verification_link = f"{frontend_url}/verify-email?token={verification_token}"
    
    # Send email
    success = await email_service.send_verification_email(
        to_email=user.email,
        verification_link=verification_link,
        user_name=user.first_name or "User"
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )
    
    return MessageResponse(message="Verification email sent successfully")

@router.get("/verify-email/{token}", response_model=MessageResponse)
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """Verify email address with token"""
    user = await db.execute(
        select(User).where(User.email_verification_token == token)
    )
    user = user.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    if user.email_verification_expires < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired"
        )
    
    # Mark email as verified
    user.email_verified = True
    user.email_verification_token = None
    user.email_verification_expires = None
    user.is_active = True
    await db.commit()
    
    return MessageResponse(message="Email verified successfully")

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    """Send password reset email"""
    user = await get_by_email(db, email=request.email)
    if not user:
        # Don't reveal that user doesn't exist for security
        return MessageResponse(message="If the email exists, a reset link has been sent")
    
    # Generate reset token
    reset_token = generate_reset_token()
    user.password_reset_token = reset_token
    user.password_reset_expires = create_reset_token_expires()
    await db.commit()
    
    # Create reset link
    frontend_url = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "http://localhost:3000"
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Send email
    success = await email_service.send_password_reset_email(
        to_email=user.email,
        reset_link=reset_link,
        user_name=user.first_name or "User"
    )
    
    if not success:
        print(f"Failed to send reset email to {user.email}")
    
    return MessageResponse(message="If the email exists, a reset link has been sent")

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Reset password with token"""
    user = await db.execute(
        select(User).where(User.password_reset_token == request.token)
    )
    user = user.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    if user.password_reset_expires < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password
    user.password_hash = get_password_hash(request.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    # Reset login attempts on password reset
    user.login_attempts = 0
    user.login_cooldown_until = None
    await db.commit()
    
    return MessageResponse(message="Password reset successfully")