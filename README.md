# Gym Tracker

A personal gym progress tracker built with FastAPI, React, and MySQL.

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+

## Setup

1. **Create a MySQL database:**

```sql
CREATE DATABASE gym_tracker;
```

2. **Configure environment variables:**

```bash
cp .env.example .env
# Edit .env with your MySQL credentials:
# DATABASE_URL=mysql+pymysql://user:password@localhost:3306/gym_tracker
```

3. **Create a Python virtual environment** (if not already present):

```bash
python3 -m venv .venv
```

## Running

### Production mode

Builds the frontend and serves everything from FastAPI on port 8081:

```bash
./start.sh
```

### Development mode

Runs backend (port 8081, hot-reload) and Vite dev server (port 5174, HMR) in parallel:

```bash
./start-dev.sh
```

Open http://localhost:5174 for development (proxies API calls to backend).

## Project Structure

```
backend/           FastAPI application (layered architecture)
  app/
    config/        Pydantic settings
    controllers/   Route handlers
    core/          Database engine, constants
    models/        SQLAlchemy ORM models
    repositories/  Data access layer
    schemas/       Pydantic request/response schemas
    services/      Business logic & unit conversion
    utils/         Helper functions
  migrations/      Versioned SQL migration scripts
  migrate.py       Migration runner
frontend/          React + Vite + TailwindCSS
  src/
    components/    Navbar, chart components
    pages/         Home, AddData, ViewData
    utils/         Client-side unit conversion
```

## Database Migrations

Migrations are plain SQL files in `backend/migrations/`, applied in sorted order.
A `schema_migrations` table tracks which have been applied.

```bash
source .venv/bin/activate

# Apply all pending migrations
python backend/migrate.py

# Add a new migration: create a new .sql file
# e.g. backend/migrations/002_add_bodyweight.sql
```