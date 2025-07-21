# CLOVE Project Setup Guide

For full details, see [README.md](./README.md).

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clove-project
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run the setup script**
   ```bash
   npm run dev
   ```
   - When prompted, select **Both** for dependencies.
   - For database name and user, press **Enter** to accept defaults.
   - For database password, enter your **pgAdmin password**.
   - Ensure your **pgAdmin server** is running when prompted.
   - Enter your pgAdmin password again if asked.
4. **Start the application**
   ```bash
   npm run dev
   ```
   The app will be available at:
   - Frontend: http://localhost:5173
   - Backend:  http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Environment Variables

- Copy `.env.example` to `.env` in both `clove-frontend/` and `clove-backend/`.
- Edit as needed for your local setup.

**Frontend example:**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CLOVE Learning Platform
```

**Backend example:**
```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/clove_db
JWT_SECRET_KEY=your-secret-key-here
ENV=development
DEBUG=true
```

## Database Setup (Manual Option)

If you need to set up the database manually:

1. **Install PostgreSQL**
2. **Create database and user:**
   ```sql
   CREATE DATABASE clove_db;
   CREATE USER clove_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE clove_db TO clove_user;
   ```
3. **Run migrations:**
   ```bash
   cd clove-backend
   alembic upgrade head
   ```

## Troubleshooting

- **Python not found:** Ensure Python 3.8+ is installed and in PATH.
- **Database issues:** Check PostgreSQL is running and .env settings are correct.
- **Port conflicts:** Change ports or kill processes using them.
- **Install issues:** Run `npm run test:setup` for diagnostics.

## Development

- Frontend: `clove-frontend/src/`
- Backend:  `clove-backend/app/`
- Migrations: Alembic in `clove-backend/alembic/`

## Contributing

- Follow code style, run linters, update docs. 