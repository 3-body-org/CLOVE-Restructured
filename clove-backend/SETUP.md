# CLOVE Backend Setup Guide

This guide will help you set up the CLOVE backend with PostgreSQL database.

## Quick Fix for Database Connection Error

If you're getting `ConnectionRefusedError: [Errno 111] Connection refused`, follow these steps:

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
```

**Windows:**
Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Start PostgreSQL Service

**Ubuntu/Debian:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew services start postgresql
```

**Windows:**
Start PostgreSQL service from Services

### 3. Create Database and User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database user
CREATE USER clove_user WITH PASSWORD 'your_password_here';

# Create database
CREATE DATABASE clove_db OWNER clove_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE clove_db TO clove_user;

# Exit PostgreSQL
\q
```

### 4. Create Environment File

Create a `.env` file in the `clove-backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://clove_user:your_password_here@localhost:5432/clove_db

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS Configuration (for frontend)
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]

# Allowed Hosts
ALLOWED_HOSTS=["localhost", "127.0.0.1"]

# Environment
ENV=development
DEBUG=true

# Database Pool Settings
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=1800

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Logging
LOG_LEVEL=INFO
```

### 5. Run Database Migrations

```bash
cd clove-backend
alembic upgrade head
```

### 6. Start the Backend

```bash
python -m uvicorn app.main:app --reload
```

## Automated Setup

You can also use the automated setup script:

```bash
cd clove-backend
node setup-db.js
```

This script will:
- Check PostgreSQL installation
- Create database and user
- Generate `.env` file
- Run migrations

## Troubleshooting

### PostgreSQL Connection Issues

1. **Check if PostgreSQL is running:**
   ```bash
   pg_isready
   ```

2. **Check PostgreSQL status:**
   ```bash
   sudo systemctl status postgresql
   ```

3. **Check PostgreSQL logs:**
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

### Database Migration Issues

1. **Reset migrations:**
   ```bash
   alembic downgrade base
   alembic upgrade head
   ```

2. **Check migration status:**
   ```bash
   alembic current
   alembic history
   ```

### Environment Variables

Make sure all required environment variables are set in your `.env` file:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `CORS_ORIGINS` - Allowed frontend origins
- `ALLOWED_HOSTS` - Allowed host names

## Development Commands

```bash
# Start development server
python -m uvicorn app.main:app --reload

# Run migrations
alembic upgrade head

# Create superuser
python scripts/create_superuser.py

# Run tests (if available)
pytest

# Format code
black .

# Sort imports
isort .
```

## API Documentation

Once the backend is running, you can access:

- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Next Steps

After setting up the backend:

1. **Create a superuser account:**
   ```bash
   python scripts/create_superuser.py
   ```

2. **Start the frontend:**
   ```bash
   cd ../clove-frontend
   npm run dev:full
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc 