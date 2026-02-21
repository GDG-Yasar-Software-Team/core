# Event Service

Event microservice for GDG on Campus Yasar. Manages event-based operations and logic.

## Features

- Event management (coming soon)

## API Endpoints

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| GET    | `/health` | Health check (public) |

## Setup

### Prerequisites

- Python 3.14+
- uv package manager
- MongoDB

### Installation

```bash
# From repository root
make install

# Or directly
cd services/event && uv sync --all-extras
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=gdg_db
EVENTS_COLLECTION=events
EVENT_SERVICE_TOKEN=your-event-service-token
HOST=0.0.0.0
PORT=8003
ENV=development
```

### Running

```bash
# From repository root
make run-event-service

# Or directly
cd services/event && uv run fastapi dev
```

Service runs at `http://localhost:8003` by default.

## Testing

```bash
# From repository root
make test-event-service

# Or directly
cd services/event && uv run pytest -v --cov=app
```
