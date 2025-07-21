# CLOVE Project Setup Guide

> **See Also:**
> - [README.md](./README.md) — Main project documentation
> - [QUICK_START.md](./QUICK_START.md) — Quick start guide
> - [POSTINSTALL_SUMMARY.md](./POSTINSTALL_SUMMARY.md) — Automated setup summary

## Overview

CLOVE is a learning platform with a React frontend and FastAPI backend. This guide will help you set up the project after cloning.

## Prerequisites

### Frontend Requirements
- Node.js 18+ 
- npm or yarn

### Backend Requirements
- Python 3.8+
- pip
- PostgreSQL database

## Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clove-project
   ```

2. **Install all dependencies (recommended)**
   ```bash
   npm install
   ```
   
   This will automatically trigger the setup script that will:
   - Check prerequisites (Node.js, npm, Python)
   - Display all project dependencies
   - Offer to install frontend and/or backend dependencies
   - Guide you through the setup process

3. **Alternative: Manual setup**
   ```bash
   # Frontend only
   cd clove-frontend && npm install
   
   # Backend only
   cd clove-backend && pip install -r requirements.txt
   
   # Or run setup manually
   npm run setup
   ```

## Project Structure

```
clove-project/
├── package.json             # Root package.json with setup scripts
├── setup.js                 # Main setup script
├── test-setup.js            # Test script for setup
├── clove-frontend/          # React application
│   ├── package.json         # Frontend dependencies
│   └── src/                 # React source code
├── clove-backend/           # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── app/                 # FastAPI source code
│   └── alembic/             # Database migrations
└── SETUP_GUIDE.md          # This file
```

## Dependencies

### Frontend Dependencies

#### Production Dependencies
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Bootstrap & React Bootstrap** - UI components
- **Monaco Editor** - Code editor
- **CodeMirror** - Alternative code editor
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Sass** - CSS preprocessor

#### Development Dependencies
- **ESLint** - Code linting
- **TypeScript types** - Type definitions
- **Vite plugins** - Build optimizations

### Backend Dependencies

#### Web Framework
- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **Starlette** - ASGI toolkit
- **Python-multipart** - Form data handling

#### Database
- **SQLAlchemy** - ORM
- **AsyncPG** - Async PostgreSQL driver
- **Alembic** - Database migrations
- **Psycopg2** - PostgreSQL adapter

#### Authentication & Security
- **Passlib** - Password hashing
- **Bcrypt** - Password encryption
- **Python-Jose** - JWT handling
- **Python-dotenv** - Environment variables
- **Backoff** - Retry logic

#### Data Validation
- **Pydantic** - Data validation
- **Pydantic-settings** - Settings management

#### Development Tools
- **Black** - Code formatting
- **Isort** - Import sorting

#### Scientific Computing
- **NumPy** - Numerical computations

## Environment Setup

### Frontend Environment
Create a `.env` file in `clove-frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CLOVE Learning Platform
```

### Backend Environment
Create a `.env` file in `clove-backend/`:
```env
# Database
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/clove_db

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Security
ALLOWED_HOSTS=["localhost","127.0.0.1"]

# Environment
ENV=development
DEBUG=true
```

## Database Setup

1. **Install PostgreSQL**
2. **Create database**
   ```sql
   CREATE DATABASE clove_db;
   CREATE USER clove_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE clove_db TO clove_user;
   ```

3. **Run migrations**
   ```bash
   cd clove-backend
   alembic upgrade head
   ```

## Running the Application

### Development Mode

1. **Start both frontend and backend (recommended)**
   ```bash
   npm run dev
   ```

2. **Or start them separately**
   ```bash
   # Backend only
   npm run dev:backend
   
   # Frontend only
   npm run dev:frontend
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Production Build

1. **Build frontend**
   ```bash
   cd clove-frontend
   npm run build
   ```

2. **Serve with production server**
   ```bash
   cd clove-backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

## Troubleshooting

### Common Issues

1. **Python not found**
   - Ensure Python 3.8+ is installed
   - Add Python to your PATH

2. **pip not found**
   - Install pip: `python -m ensurepip --upgrade`
   - Or use: `python -m pip install -r requirements.txt`

3. **Database connection issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database and user exist

4. **Port conflicts**
   - Change ports in the respective configuration files
   - Kill processes using the ports: `lsof -ti:8000 | xargs kill -9`

### Getting Help

- Check the logs for error messages
- Verify all environment variables are set
- Ensure all dependencies are installed
- Check database connectivity

## Development Workflow

1. **Frontend changes** - Edit files in `clove-frontend/src/`
2. **Backend changes** - Edit files in `clove-backend/app/`
3. **Database changes** - Create new Alembic migrations
4. **Testing** - Use the provided test scripts

## Contributing

1. Follow the existing code style
2. Run linting: `npm run lint` (frontend) / `black .` (backend)
3. Test your changes thoroughly
4. Update documentation as needed 