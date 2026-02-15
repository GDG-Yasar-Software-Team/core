# Form Service

Form microservice for the GDG Core platform.

## Setup

```bash
# Install dependencies
uv sync

# Run development server
uv run fastapi dev
```

Service runs at `http://localhost:8002` by default.

## Project Structure

```
app/
├── main.py       # FastAPI app entry point
├── routers/      # API route handlers
├── models/       # Pydantic models
├── services/     # Business logic
└── utils/        # Helper functions
```

## Code Quality

```bash
# Format code
uv run ruff format .

# Check linting
uv run ruff check .

# Fix auto-fixable issues
uv run ruff check --fix .
```

## Testing

```bash
# Run tests with coverage (from repo root)
make test-form-service

# Run tests directly
cd services/form
uv run pytest -v --cov=app
```
