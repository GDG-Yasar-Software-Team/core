# User Service

Internal user microservice for GDG on Campus Yasar. Manages user data and provides APIs for other services to interact with user information.

## Features

- User creation with flexible model (only email required)
- Auto-detection of Yasar students by email domain (`@stu.yasar.edu.tr`)
- Per-service API token authentication
- Track form submissions and mail received per user
- Subscription management for email campaigns

## API Endpoints

All endpoints except `/health` require authentication via `X-API-Token` header.

| Method | Endpoint                                  | Description               |
| ------ | ----------------------------------------- | ------------------------- |
| GET    | `/health`                                 | Health check (public)     |
| POST   | `/users/`                                 | Create a new user         |
| GET    | `/users/by-email/{email}`                 | Get user by email         |
| PUT    | `/users/by-email/{email}`                 | Update user by email      |
| GET    | `/users/subscribed-emails`                | Get all subscribed emails |
| POST   | `/users/by-email/{email}/forms/{form_id}` | Record form submission    |
| POST   | `/users/by-email/{email}/mails/{mail_id}` | Record mail received      |

## Authentication

The service uses per-service API tokens for authentication. Configure the following environment variables:

- `FORM_SERVICE_TOKEN` - Token for form service
- `MAIL_SERVICE_TOKEN` - Token for mail service
- `FORM_FRONTEND_TOKEN` - Token for form frontend

Include the token in requests:

```bash
curl -H "X-API-Token: your-token" http://localhost:8001/users/subscribed-emails
```

## User Model

The `User` model is flexible with only `email` required:

```json
{
  "email": "user@example.com",
  "name": "Optional Name",
  "is_yasar_student": null,
  "section": "Optional Section",
  "is_subscribed": true
}
```

Fields tracked automatically:

- `submitted_form_ids` / `submitted_form_count`
- `received_mail_ids` / `received_mail_count`
- `created_at` / `updated_at`
- `unsubscribed_at` (set when unsubscribing)

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
cd services/user && uv sync --all-extras
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
USERS_COLLECTION=users
FORM_SERVICE_TOKEN=your-form-service-token
MAIL_SERVICE_TOKEN=your-mail-service-token
FORM_FRONTEND_TOKEN=your-frontend-token
HOST=0.0.0.0
PORT=8001
ENV=development
```

### Running

```bash
# From repository root
make run-user-service

# Or directly
cd services/user && uv run python -m app.main
```

Service runs at `http://localhost:8001` by default.

## Testing

```bash
# From repository root
make test-user-service

# Or directly
cd services/user && uv run pytest -v --cov=app
```

## API Examples

### Create User

```bash
curl -X POST http://localhost:8001/users/ \
  -H "X-API-Token: $FORM_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

Response:

```json
{ "id": "...", "email": "user@example.com" }
```

### Get User

```bash
curl http://localhost:8001/users/by-email/user@example.com \
  -H "X-API-Token: $FORM_SERVICE_TOKEN"
```

### Update User

```bash
curl -X PUT http://localhost:8001/users/by-email/user@example.com \
  -H "X-API-Token: $FORM_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "Jane Doe", "is_subscribed": false}'
```

### Get Subscribed Emails

```bash
curl http://localhost:8001/users/subscribed-emails \
  -H "X-API-Token: $MAIL_SERVICE_TOKEN"
```

Response:

```json
{ "emails": ["user1@example.com", "user2@example.com"], "count": 2 }
```

### Record Form Submission

```bash
curl -X POST http://localhost:8001/users/by-email/user@example.com/forms/507f1f77bcf86cd799439030 \
  -H "X-API-Token: $FORM_SERVICE_TOKEN"
```

### Record Mail Received

```bash
curl -X POST http://localhost:8001/users/by-email/user@example.com/mails/507f1f77bcf86cd799439040 \
  -H "X-API-Token: $MAIL_SERVICE_TOKEN"
```
