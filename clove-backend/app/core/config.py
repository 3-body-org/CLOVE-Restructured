import os
import json
from typing import List
from functools import lru_cache
from pydantic_settings import BaseSettings
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load .env if present (for local dev)
load_dotenv()

class Settings(BaseSettings):
    # Environment
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = ENV == "development"
    
    # Database settings (plain credentials)
    DB_USER: str = os.getenv("DB_USER", "clove_user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "clove_db")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "20"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "1800"))
    
    # Build the database URL with encoded credentials
    DATABASE_URL: str = None  # Add this line to accept DATABASE_URL from env
    
    @property
    def database_url(self) -> str:
        # Use env DATABASE_URL if set, else build from parts
        if self.DATABASE_URL:
            return self.DATABASE_URL
        user_enc = quote_plus(self.DB_USER)
        password_enc = quote_plus(self.DB_PASSWORD)
        return f"postgresql+asyncpg://{user_enc}:{password_enc}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # JWT settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    
    # CORS settings
    CORS_ORIGINS: List[str] = json.loads(os.getenv("CORS_ORIGINS", "[]"))
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # API settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "CLOVE Learning Backend"
    
    # Security
    ALLOWED_HOSTS: List[str] = json.loads(os.getenv("ALLOWED_HOSTS", "[]"))
    SECURE_SSL_REDIRECT: bool = ENV == "production"
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    class Config:
        env_file = ".env"
        case_sensitive = True

    def validate_settings(self):
        # Add any custom validation logic here
        pass

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
