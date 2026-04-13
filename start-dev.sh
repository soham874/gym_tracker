#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Activating virtual environment..."
source .venv/bin/activate

echo "==> Installing Python dependencies..."
pip install -q -r backend/requirements.txt

echo "==> Ensuring database exists..."
python -c "
from backend.app.config.settings import get_settings
from sqlalchemy import create_engine, text
s = get_settings()
url = s.DATABASE_URL
db_name = url.rsplit('/', 1)[-1]
base_url = url.rsplit('/', 1)[0]
engine = create_engine(base_url)
with engine.connect() as conn:
    conn.execute(text(f'CREATE DATABASE IF NOT EXISTS \`{db_name}\`'))
print(f'Database \"{db_name}\" ready.')
"

echo "==> Running database migrations..."
python backend/migrate.py

echo "==> Starting backend (port 8000)..."
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "==> Installing frontend dependencies..."
npm install --silent --prefix frontend

echo "==> Starting frontend dev server (port 5173)..."
npm run dev --prefix frontend &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
echo "==> Backend: http://localhost:8000  |  Frontend: http://localhost:5173"
wait
