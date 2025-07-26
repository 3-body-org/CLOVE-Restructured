from pydantic_settings import BaseSettings
from typing import List
import os
import json
from functools import lru_cache

class Settings(BaseSettings):
    # Environment
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = ENV == "development"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "20"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "1800"))
    
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
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL must be set")
        if not self.JWT_SECRET_KEY:
            raise ValueError("JWT_SECRET_KEY must be set")
        if not self.CORS_ORIGINS:
            raise ValueError("CORS_ORIGINS must be set")
        if not self.ALLOWED_HOSTS:
            raise ValueError("ALLOWED_HOSTS must be set")

@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_settings()
    return settings

settings = get_settings()
