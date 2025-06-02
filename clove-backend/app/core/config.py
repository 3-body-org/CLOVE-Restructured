from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # The DATABASE_URL should be overridden by an environment variable in production.
    DATABASE_URL: str = "postgresql+asyncpg://clove_user:123123@localhost:5432/clove_db"
    # (Add more settings as needed, e.g. JWT_SECRET, if you implement authentication.)
    JWT_SECRET: str = "supersecret_jwt_key"

    class Config:
        env_file = ".env"  # so you can override locally via a .env file

settings = Settings()
