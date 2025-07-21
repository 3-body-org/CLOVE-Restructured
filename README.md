# CLOVE Learning Platform

A modern adaptive learning platform with a React frontend and FastAPI backend.

## Getting Started

Follow these steps to set up and launch the project:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clove-project
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the setup script**
   ```bash
   npm run dev
   ```
   - When prompted to install dependencies, select **Both**.
   - When asked for a database name and user, simply press **Enter** to accept the defaults.
   - For the database password, enter your **pgAdmin password**.
   - If prompted, ensure your **pgAdmin server** is running, then press **Enter** to continue.
   - When asked again for your pgAdmin password, use the same password as before.
4. **Launch the application**
   ```bash
   npm run dev
   ```
   The project should now be running and accessible at the provided URLs.

## Project Structure

```
clove-project/
├── clove-frontend/   # React app
├── clove-backend/    # FastAPI app
├── docs/             # Documentation
```

## Scripts

- `npm install`         — Install all dependencies
- `npm run setup`       — Setup wizard
- `npm run dev`         — Start frontend & backend
- `npm run build`       — Build frontend
- `npm run lint`        — Lint frontend
- `npm run test:setup`  — Test setup

## Access

- Frontend: http://localhost:5173
- Backend:  http://localhost:8000
- API Docs: http://localhost:8000/docs

## Features

- Adaptive learning (Q-learning, BKT)
- Themed UI (React, Vite, Sass)
- FastAPI backend, PostgreSQL, Alembic
- JWT authentication
- Progress tracking, assessments

## Troubleshooting

- **Python or Database Not Found:**
  - Ensure Python 3.8+ is installed and added to your PATH.
  - Verify PostgreSQL is installed and running.
  - Check that your .env files are correctly configured.
- **Port Conflicts:**
  - Change the default ports in configuration files if needed.
  - Free up ports by killing processes (e.g., `lsof -ti:8000 | xargs kill -9`).
- **Dependency Installation Issues:**
  - Run `npm run test:setup` to diagnose missing prerequisites.
  - Ensure you have a stable internet connection.
- **Database Connection Errors:**
  - Double-check your database credentials in `.env`.
  - Make sure the database and user exist and have the correct permissions.
- **Other Issues:**
  - Review error messages in the terminal for guidance.
  - Consult the SETUP_GUIDE.md for more detailed troubleshooting steps.

## Contributing

- Follow code style, run linters, update docs

## License

[Add your license here]

