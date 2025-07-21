#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

# Helper for error messages
die() { echo "[ERROR] $1" >&2; exit 1; }

# 1. Check for Python 3
if ! command -v python3 &>/dev/null; then
  die "Python 3 is not installed. Please install Python 3."
fi

# 2. Create venv if missing
if [ ! -d "venv" ]; then
  echo "[INFO] Creating Python virtual environment..."
  python3 -m venv venv || die "Failed to create venv."
fi

# 3. Activate venv
source venv/bin/activate || die "Failed to activate venv."

# 4. Install dependencies
if [ ! -f "requirements.txt" ]; then
  die "requirements.txt not found."
fi
pip install --upgrade pip || die "Failed to upgrade pip."
pip install -r requirements.txt || die "Failed to install Python dependencies."

# 5. Check if PostgreSQL is installed
if ! command -v psql &>/dev/null; then
  die "PostgreSQL is not installed. Please install it (e.g., sudo pacman -S postgresql)."
fi

# 6. Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
  echo "[INFO] PostgreSQL is not running. Attempting to start..."
  (sudo systemctl start postgresql || sudo service postgresql start) || die "Could not start PostgreSQL. Please start it manually."
  sleep 2
  pg_isready > /dev/null 2>&1 || die "PostgreSQL is still not running."
fi

# 6.5. Check if .env file exists
if [ ! -f ".env" ]; then
  echo "[WARN] .env file not found. Please run database setup first:"
  echo "  npm run setup-db"
  die "Missing .env file. Run database setup from frontend directory."
fi

# 7. Run Alembic migrations
if ! command -v alembic &>/dev/null; then
  pip install alembic || die "Failed to install Alembic."
fi
alembic upgrade head || die "Alembic migrations failed."

# 8. Seed the database
echo "[INFO] Seeding database with initial data..."
PYTHONPATH=. python -m app.db.seeder || die "Database seeding failed."

# 9. Start pgAdmin4 if not running
if command -v pgadmin4 &>/dev/null; then
  if ! pgrep -f pgadmin4 > /dev/null; then
    echo "[INFO] Starting pgAdmin4..."
    nohup pgadmin4 > /dev/null 2>&1 &
    sleep 3
  fi
else
  echo "[WARN] pgAdmin4 is not installed. Skipping launch."
fi

# 10. Check for port 8000 conflicts
if lsof -i:8000 -sTCP:LISTEN -t >/dev/null ; then
  die "Port 8000 is already in use. Please free it before starting the backend."
fi

# 11. Start FastAPI backend
exec python -m uvicorn app.main:app --reload --port 8000 