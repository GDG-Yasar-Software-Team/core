# Mail Service

Email campaign microservice for the GDG Core platform. Handles bulk email sending, campaign scheduling, and user subscription management.

## Features

- Scheduled email campaigns with multiple send times
- Custom subjects per scheduled send
- Automatic unsubscribe link injection
- Rate-limited bulk email sending
- Campaign execution history tracking
- Recipient batch plans for splitting large manual sends
- Token-based unsubscribe flow

## Setup

### Prerequisites

- Python 3.14+
- MongoDB instance
- SMTP server credentials (Gmail recommended)

### Installation

```bash
# Install dependencies
uv sync

# Copy environment template
cp .env.example .env

# Edit .env with your settings
```

### Environment Variables

| Variable                           | Description                    | Default                     |
| ---------------------------------- | ------------------------------ | --------------------------- |
| `MONGODB_URI`                      | MongoDB connection string      | `mongodb://localhost:27017` |
| `DATABASE_NAME`                    | Database name                  | `gdg_db`                    |
| `USERS_COLLECTION`                 | Users collection name          | `users`                     |
| `CAMPAIGNS_COLLECTION`             | Campaigns collection name      | `mails`                     |
| `BATCH_PLANS_COLLECTION`           | Batch plans collection name    | `batch_plans`               |
| `MAX_BATCH_SIZE`                   | Max recipients per batch       | `500`                       |
| `HOST`                             | Bind host                      | `0.0.0.0`                   |
| `PORT`                             | Service port                   | `8000`                      |
| `SMTP_SERVER`                      | SMTP server hostname           | `smtp.gmail.com`            |
| `SMTP_PORT`                        | SMTP server port               | `587`                       |
| `SENDER_ADDRESS`                   | Sender email address           | (required)                  |
| `SMTP_PASSWORD`                    | SMTP password/app password     | (required)                  |
| `BASE_URL`                         | Base URL for unsubscribe links | `http://localhost:8000`     |
| `UNSUBSCRIBE_SECRET_KEY`           | Secret for signing tokens      | `dev-secret-key`            |
| `RATE_LIMIT_MIN_DELAY`             | Min delay between emails (sec) | `2.0`                       |
| `RATE_LIMIT_MAX_DELAY`             | Max delay between emails (sec) | `6.0`                       |
| `SCHEDULER_CHECK_INTERVAL_MINUTES` | Scheduler check frequency      | `1`                         |

> [!WARNING]
> **Production Deployment:** You MUST set `BASE_URL` to your production domain (e.g., `https://mail.gdg.com`) and `UNSUBSCRIBE_SECRET_KEY` to a cryptographically secure random value. The service will refuse to start in production mode with default values.

### Running

```bash
# Development server
uv run fastapi dev

# Or via Makefile from repo root
make run-mail-service
```

Service runs at `http://localhost:8000` by default.

## Project Structure

```
app/
├── main.py              # FastAPI app entry point
├── config.py            # Settings and configuration
├── routers/
│   ├── campaigns.py     # Campaign CRUD endpoints
│   └── unsubscribe.py   # Unsubscribe flow
├── models/
│   ├── common.py        # Shared types (PyObjectId)
│   ├── user.py          # User models
│   └── campaign.py      # Campaign models
├── repositories/
│   ├── user_repository.py      # User data access
│   └── campaign_repository.py  # Campaign data access
├── services/
│   ├── email_service.py        # SMTP email sending
│   ├── campaign_service.py     # Campaign business logic
│   ├── scheduler_service.py    # APScheduler integration
│   └── unsubscribe_service.py  # Token generation/validation
├── templates/
│   ├── unsubscribe_page.html    # Unsubscribe confirmation
│   ├── unsubscribe_success.html # Unsubscribe success
│   └── unsubscribe_footer.html  # Email footer template
├── db/
│   └── mongodb.py       # MongoDB connection
└── utils/
    └── logger.py        # Tamga logger setup
```

## API Endpoints

### Campaigns

| Method | Endpoint                                    | Description                            |
| ------ | ------------------------------------------- | -------------------------------------- |
| `POST` | `/campaigns/`                               | Create a new campaign                  |
| `PUT`  | `/campaigns/{id}`                           | Update campaign                        |
| `GET`  | `/campaigns/{id}`                           | Get campaign details                   |
| `GET`  | `/campaigns/`                               | List recent campaigns                  |
| `POST` | `/campaigns/{id}/trigger`                   | Trigger campaign immediately (send all)|
| `POST` | `/campaigns/{id}/batch-plans`               | Create a batch plan (audience snapshot)|
| `GET`  | `/campaigns/{id}/batch-plans/{planId}`      | Get batch plan states and results      |
| `POST` | `/campaigns/{id}/batch-plans/{planId}/batches/{batchNumber}/trigger` | Trigger one batch |

### Unsubscribe

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| `GET`  | `/unsubscribe/{token}` | Show unsubscribe page |
| `POST` | `/unsubscribe/{token}` | Process unsubscribe   |

### Health

| Method | Endpoint  | Description          |
| ------ | --------- | -------------------- |
| `GET`  | `/health` | Service health check |

## Usage Examples

### Create a Scheduled Campaign (JSON)

```bash
curl -X POST http://localhost:8000/campaigns/ \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "GDG Event Announcement",
    "body_html": "<h1>Hello!</h1><p>Join us for...</p>",
    "scheduled_sends": [
      {"time": "2025-01-20T10:00:00Z"},
      {"time": "2025-01-21T14:00:00Z", "subject": "Reminder: GDG Event"}
    ],
    "use_custom_subjects": true
  }'
```

### Create a Campaign (File Upload)

```bash
curl -X POST http://localhost:8000/campaigns/ \
  -F "subject=Newsletter" \
  -F "body_file=@template.html" \
  -F 'scheduled_sends=[{"time": "2025-01-20T10:00:00Z"}]'
```

### Trigger Campaign Immediately

```bash
curl -X POST http://localhost:8000/campaigns/{campaign_id}/trigger
```

### Batch Plans (Manual Sends in Groups)

Create a plan to snapshot the current audience and split it into the fewest
balanced batches that fit `MAX_BATCH_SIZE`. Nothing is sent automatically —
trigger each batch when ready.

```bash
# Create a plan
curl -X POST http://localhost:8000/campaigns/{campaign_id}/batch-plans

# Inspect batch states, progress and results
curl http://localhost:8000/campaigns/{campaign_id}/batch-plans/{plan_id}

# Trigger batch 1 (run in background; other batches stay pending)
curl -X POST http://localhost:8000/campaigns/{campaign_id}/batch-plans/{plan_id}/batches/1/trigger
```

Behavior notes:

- The plan's audience is frozen at creation; later signups are never added.
- Before each run, subscription status is re-checked: unsubscribed recipients
  in the batch are skipped.
- Retrying a batch targets only recipients that previously failed and are
  still subscribed; successes are never resent.
- Completed batches cannot be triggered again; concurrent triggers of the
  same campaign are rejected with `409`.
- Scheduled sends are unaffected by batch plans.

### CLI Usage

```bash
# Immediate send
make run-mail-campaign ARGS='--subject "Test" --body-file template.html --now'

# Scheduled send
make run-mail-campaign ARGS='--subject "Test" --body-file template.html --at "2025-01-20T10:00:00"'
```

## Testing

```bash
# Run all tests
uv run pytest -v

# Run with coverage
uv run pytest -v --cov=app

# Or via Makefile from repo root
make test-mail-service
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

## Database Schema

### Users Collection (`users`)

```json
{
  "_id": "ObjectId",
  "email": "string",
  "isSubscribed": "boolean"
}
```

### Campaigns Collection (`mails`)

```json
{
  "_id": "ObjectId",
  "subject": "string",
  "body_html": "string",
  "scheduled_sends": [{ "time": "datetime", "subject": "string|null" }],
  "use_custom_subjects": "boolean",
  "status": "scheduled|in_progress|completed|failed",
  "executions": [
    {
      "scheduled_time": "datetime|null",
      "subject_used": "string",
      "started_at": "datetime",
      "completed_at": "datetime|null",
      "sent_count": "int",
      "failed_count": "int"
    }
  ],
  "executed_times": ["datetime"],
  "created_at": "datetime",
  "updated_at": "datetime|null"
}
```

### Batch Plans Collection (`batch_plans`)

```json
{
  "_id": "ObjectId",
  "campaign_id": "ObjectId",
  "batch_size": "int",
  "audience": ["string"],
  "batches": [
    {
      "number": "int",
      "start": "int",
      "end": "int",
      "recipient_count": "int",
      "status": "pending|in_progress|completed|partially_failed|failed",
      "sent_emails": ["string"],
      "failed_emails": ["string"],
      "attempts": "int",
      "current_progress": "object|null",
      "last_error": "string|null"
    }
  ],
  "created_at": "datetime",
  "updated_at": "datetime|null"
}
```

## Unsubscribe Flow

1. Email contains `{{unsubscribe_url}}` placeholder (or footer is auto-appended)
2. Placeholder replaced with signed token URL per recipient
3. User clicks link → sees confirmation page
4. User confirms → `isSubscribed` set to `false`
5. Future campaigns skip unsubscribed users
