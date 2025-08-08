from setuptools import setup, find_packages

setup(
    name="clove-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        # Web Framework
        "fastapi",
        "uvicorn[standard]",
        "starlette",
        "python-multipart",
        
        # Database
        "SQLAlchemy",
        "asyncpg",
        "alembic",
        "psycopg2-binary",
        
        # Authentication & Security
        "passlib[bcrypt]",
        "python-jose[cryptography]",
        "python-dotenv",
        "backoff",
        
        # Data Validation
        "pydantic",
        "pydantic[email]",
        "pydantic-settings",
        
        # Scientific Computing
        "numpy",
    ],
    python_requires=">=3.8",
) 