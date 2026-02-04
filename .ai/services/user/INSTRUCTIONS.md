# User Service - AI Agent Instructions

Detailed instructions for AI agents working on the user service (`services/user/`).

## Service Overview

Internal user microservice handling:
- User creation with flexible model (only email required)
- Auto-detection of Yasar students by email domain
- Per-service API token authentication
- Form submission tracking per user
- Mail received tracking per user
- Subscription management for email campaigns

## Architecture

### Layer Pattern

```
routers/ (HTTP) → services/ (Business Logic) → repositories/ (Data Access) → MongoDB
```

### Key Files

| File | Purpose |
|------|---------|
| `app/config.py` | All settings via Pydantic BaseSettings |
| `app/main.py` | FastAPI app with lifespan (MongoDB) |
| `app/routers/users.py` | User CRUD + tracking endpoints |
| `app/services/user_service.py` | User business logic |
| `app/repositories/user_repository.py` | User data access |
| `app/auth/api_key.py` | X-API-Token authentication |

## Configuration

All customizable values are in `app/config.py`:

```python
class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str
    DATABASE_NAME: str
    USERS_COLLECTION: str

    # Service API Tokens
    FORM_SERVICE_TOKEN: str
    MAIL_SERVICE_TOKEN: str
    FORM_FRONTEND_TOKEN: str

    # Environment
    ENV: str
```

**Rule**: Never hardcode configurable values. Always use `settings.<SETTING_NAME>`.

## Models

### User Models (`app/models/user.py`)

```python
User                    # Input for create/update (only email required)
UserInDB                # Database representation (all fields)
UserResponse            # API response
SubscribedEmailsResponse # List of subscribed emails with count
```

### Common Types (`app/models/common.py`)

```python
PyObjectId              # MongoDB ObjectId with Pydantic validation
```

## Database Schema

### Users Collection

```json
{
  "_id": "ObjectId",
  "email": "string",
  "name": "string|null",
  "is_yasar_student": "boolean",
  "section": "string|null",
  "submitted_form_ids": ["ObjectId"],
  "submitted_form_count": "integer",
  "received_mail_ids": ["ObjectId"],
  "received_mail_count": "integer",
  "is_subscribed": "boolean",
  "unsubscribed_at": "datetime|null",
  "created_at": "datetime",
  "updated_at": "datetime|null"
}
```

**Note**: All fields use `snake_case` (no camelCase aliases).

## Authentication

### Per-Service Tokens

The service uses `X-API-Token` header for authentication:

```python
# In app/auth/api_key.py
api_key_header = APIKeyHeader(name="X-API-Token", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)) -> str:
    if api_key not in settings.get_valid_tokens():
        raise HTTPException(status_code=401, detail="Invalid API token")
```

Valid tokens come from:
- `FORM_SERVICE_TOKEN` - Form service calls
- `MAIL_SERVICE_TOKEN` - Mail service calls
- `FORM_FRONTEND_TOKEN` - Frontend calls

### Public Endpoints

Only `/health` is public. All `/users/*` endpoints require authentication.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (public) |
| POST | `/users/` | Create user |
| GET | `/users/by-email/{email}` | Get user by email |
| PUT | `/users/by-email/{email}` | Update user (partial) |
| GET | `/users/subscribed-emails` | Get all subscribed emails |
| POST | `/users/by-email/{email}/forms/{form_id}` | Record form submission |
| POST | `/users/by-email/{email}/mails/{mail_id}` | Record mail received |

## Business Logic

### User Creation

1. Check for duplicate email
2. Auto-detect Yasar student from `@stu.yasar.edu.tr` domain (if not explicitly set)
3. Apply defaults: `is_subscribed=True`, empty arrays for IDs, counts=0
4. Set `created_at` timestamp

### User Update

1. Only update non-None fields from request
2. Set `updated_at` timestamp
3. If `is_subscribed` changes to `False`, set `unsubscribed_at`

### Form/Mail Tracking

Uses MongoDB `$push` and `$inc` operators:

```python
await collection.update_one(
    {"email": email},
    {
        "$push": {"submitted_form_ids": ObjectId(form_id)},
        "$inc": {"submitted_form_count": 1},
    },
)
```

## Testing

### Running Tests

```bash
cd services/user
uv run pytest -v              # All tests
uv run pytest -v --cov=app    # With coverage

# From repo root
make test-user-service
```

### Test Structure

| File | Coverage |
|------|----------|
| `test_api_users.py` | User API endpoints (16 tests) |
| `test_api_health.py` | Health endpoint (1 test) |
| `test_user_service.py` | User business logic (12 tests) |
| `test_user_repository.py` | User data access (17 tests) |
| `test_models.py` | Pydantic validation (11 tests) |

### Key Fixtures (`tests/conftest.py`)

```python
mock_settings           # Mocked settings for all tests (autouse)
mock_mongodb            # Mocked MongoDB collections
sync_client             # TestClient for API tests
async_client            # AsyncClient for async API tests
valid_api_token         # Test API token
sample_user_data        # User instances fixture
sample_user_doc         # Database document fixture
sample_users_docs       # Multiple documents fixture
create_async_cursor     # Helper for async cursor mocking
```

## Code Conventions

### Imports

**Always at top of file**. Never inline imports.

```python
# Good
from app.repositories.user_repository import UserRepository

# Bad
def some_function():
    from app.repositories.user_repository import UserRepository  # Never
```

### Async Patterns

All I/O operations use async/await:

```python
# Repository methods
async def create(cls, user: User) -> str:
    ...

# Service methods
async def create_user(cls, data: User) -> str:
    ...
```

### Type Hints

Required for all function arguments and return values:

```python
async def update(cls, email: str, update: User) -> UserInDB:
    ...
```

### Error Handling

Custom exceptions for domain errors:

```python
class UserNotFoundError(Exception):
    """Raised when a user is not found."""
    pass

class DuplicateEmailError(Exception):
    """Raised when attempting to create a user with an existing email."""
    pass
```

## Common Tasks

### Adding a New Setting

1. Add to `app/config.py` Settings class with default
2. If it's a token, add to `get_valid_tokens()` method
3. Use as `settings.NEW_SETTING` in code
4. Document in `services/user/README.md`
5. Add to `.env.example`

### Adding a New Endpoint

1. Create route in `app/routers/users.py`
2. Add business logic in `app/services/user_service.py`
3. Add data access in `app/repositories/user_repository.py` if needed
4. Write tests for all layers
5. Update README.md with new endpoint

### Adding a New User Field

1. Add to `User` model (optional field with `| None = None`)
2. Add to `UserInDB` model with default
3. Add to `UserResponse` model
4. Update `UserResponse.from_db()` method
5. Update repository `create()` to include in document
6. Update repository `update()` to handle field
7. Write tests for new field
8. Update documentation

### Adding a New Service Token

1. Add `NEW_SERVICE_TOKEN: str = ""` to Settings
2. Add to `get_valid_tokens()` method:
   ```python
   if self.NEW_SERVICE_TOKEN:
       tokens.add(self.NEW_SERVICE_TOKEN)
   ```
3. Add to `.env.example`
4. Document in README.md

## Debugging

### Check Authentication

If getting 401 errors, verify:
1. Token is set in environment
2. Token matches one of the configured tokens
3. Header is `X-API-Token` (not `Authorization`)

### Check MongoDB Connection

Logs show connection status:

```
Connecting to MongoDB...
Successfully connected to MongoDB
```

Or on failure:

```
Failed to connect to MongoDB: <error>
```

### MongoDB Queries

Use Motor's async driver. Always handle ObjectId conversion:

```python
from bson import ObjectId

# String to ObjectId
oid = ObjectId(user_id)

# Query
doc = await collection.find_one({"_id": oid})
```

## Integration with Other Services

### Form Service → User Service

Form service calls user service to:
- Create users on form submission
- Record form submissions

```bash
curl -X POST http://user-service:8000/users/ \
  -H "X-API-Token: $FORM_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Mail Service → User Service

Mail service calls user service to:
- Get subscribed emails for campaigns
- Record mail received

```bash
curl http://user-service:8000/users/subscribed-emails \
  -H "X-API-Token: $MAIL_SERVICE_TOKEN"
```
