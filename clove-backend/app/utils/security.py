from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt, ExpiredSignatureError
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.core.config import settings
import logging
import secrets
import string
import bcrypt

logger = logging.getLogger(__name__)

# Use bcrypt directly to avoid passlib's internal bug detection issues
def _hash_password(password: str) -> str:
    """Hash password using bcrypt directly"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        logger.warning(f"Password truncated from {len(password.encode('utf-8'))} to 72 bytes during hashing")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def _verify_password(password: str, hashed: str) -> bool:
    """Verify password using bcrypt directly"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        logger.warning(f"Password truncated from {len(password.encode('utf-8'))} to 72 bytes during verification")
    return bcrypt.checkpw(password_bytes, hashed.encode('utf-8'))

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt directly to avoid passlib issues"""
    return _hash_password(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using bcrypt directly to avoid passlib issues"""
    return _verify_password(plain_password, hashed_password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "type": "access",
        "iat": datetime.now(timezone.utc)  # Issued at time
    })
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "iat": datetime.now(timezone.utc)  # Issued at time
    })
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={
                "verify_iat": True,
                "verify_exp": True,
                "require": ["exp", "iat", "type"]
            }
        )
        return payload
    except ExpiredSignatureError:
        logger.warning("Token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    try:
        payload = decode_token(token)
        if payload.get("type") != token_type:
            logger.warning(f"Invalid token type. Expected {token_type}, got {payload.get('type')}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {token_type}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not verify token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def generate_verification_token() -> str:
    """Generate a secure random token for email verification"""
    return secrets.token_urlsafe(32)

def generate_reset_token() -> str:
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)

def create_verification_token_expires() -> datetime:
    """Create expiry time for verification token (6 hours from now)"""
    return datetime.now(timezone.utc) + timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)

def create_reset_token_expires() -> datetime:
    """Create expiry time for reset token (6 hours from now)"""
    return datetime.now(timezone.utc) + timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)