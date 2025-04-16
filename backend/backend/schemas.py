from pydantic import BaseModel, Field, validator


class Token(BaseModel):
    """Schema for authentication token."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema for token data containing the username."""

    username: str | None = None


class UserCreate(BaseModel):
    """Schema for user creation with validation."""

    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    password: str = Field(..., min_length=8)

    @validator("password")
    def password_strength(self, v):
        """Validate password strength.

        Args:
            cls: The class
            v: The password value

        Returns:
            str: The validated password

        Raises:
            ValueError: If password doesn't meet strength requirements
        """
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one number")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v


class UserResponse(BaseModel):
    """Schema for user response data."""

    username: str
    email: str | None = None


class UserInDB(UserResponse):
    """Schema for user data stored in the database."""

    hashed_password: str
