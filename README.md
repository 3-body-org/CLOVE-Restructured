# CLOVE Learning Platform

> **See Also:**
> - [SETUP_GUIDE.md](./SETUP_GUIDE.md) — Detailed setup instructions
> - [QUICK_START.md](./QUICK_START.md) — Quick start guide
> - [POSTINSTALL_SUMMARY.md](./POSTINSTALL_SUMMARY.md) — Automated setup summary

A modern learning platform with adaptive learning capabilities, featuring a React frontend and FastAPI backend.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **npm**
- **Python 3.8+** and **pip**
- **PostgreSQL** database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clove-project
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```
   
   This will automatically:
   - Install frontend dependencies (via workspace)
   - Show a quick overview and next steps
   - Provide access to setup commands

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in both `clove-frontend/` and `clove-backend/`
   - Configure your database connection and other settings

4. **Set up the database**
   ```bash
   cd clove-backend
   alembic upgrade head
   ```

5. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start them separately
   npm run dev:frontend  # Frontend only
   npm run dev:backend   # Backend only
   ```

## 📁 Project Structure

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
└── docs/                    # Documentation
```

## 🛠️ Available Scripts

### Root Level Commands
```bash
npm install          # Install dependencies and show overview
npm run setup        # Run full setup wizard
npm run dev          # Start both frontend and backend
npm run dev:frontend # Start frontend only
npm run dev:backend  # Start backend only
npm run build        # Build frontend for production
npm run lint         # Lint frontend code
npm run test:setup   # Test setup functionality
```

### Frontend Commands
```bash
cd clove-frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
```

### Backend Commands
```bash
cd clove-backend
uvicorn app.main:app --reload  # Start development server
alembic upgrade head            # Run database migrations
alembic revision --autogenerate # Create new migration
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API Docs**: http://localhost:8000/redoc

## 🔧 Configuration

### Frontend Environment Variables
Create `.env` in `clove-frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CLOVE Learning Platform
```

### Backend Environment Variables
Create `.env` in `clove-backend/`:
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

## 📚 Features

### Frontend
- **React 19** with modern hooks and features
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Bootstrap** for responsive UI components
- **Monaco Editor** for code editing
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **Sass** for advanced styling

### Backend
- **FastAPI** for high-performance API
- **SQLAlchemy** for database ORM
- **PostgreSQL** for data persistence
- **Alembic** for database migrations
- **JWT** for authentication
- **Pydantic** for data validation
- **NumPy** for scientific computations

### Learning Features
- **Adaptive Learning** with Q-learning algorithms
- **BKT (Bayesian Knowledge Tracing)** for knowledge assessment
- **Multiple Challenge Types**: Code completion, code fixing, output tracing
- **Progress Tracking** with detailed analytics
- **Assessment System** with pre and post assessments
- **Themed Learning** with different visual themes

## 🐛 Troubleshooting

### Common Issues

1. **Python not found**
   - Ensure Python 3.8+ is installed and in PATH
   - Try `python3` instead of `python`

2. **Database connection issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in backend .env file
   - Ensure database and user exist

3. **Port conflicts**
   - Change ports in configuration files
   - Kill processes: `lsof -ti:8000 | xargs kill -9`

4. **Dependencies not installing**
   - Run `npm run test:setup` to check prerequisites
   - Try manual installation: `npm run install:frontend` or `npm run install:backend`

### Getting Help

- Check the logs for error messages
- Verify all environment variables are set
- Ensure all dependencies are installed
- Check database connectivity
- Run `npm run test:setup` to verify setup

## 🤝 Contributing

1. Follow the existing code style
2. Run linting: `npm run lint` (frontend) / `black .` (backend)
3. Test your changes thoroughly
4. Update documentation as needed

## 📄 License

[Add your license information here]

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- React team for the amazing frontend library
- All contributors and maintainers

