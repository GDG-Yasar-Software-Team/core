<!-- AUTO-GENERATED from .ai/services/mail/INSTRUCTIONS.md; run `make sync-prompts` to update. -->

# Mail Service - AI Agent Instructions

Detailed instructions for AI agents working on the mail service (`services/mail/`).

## Service Overview

Email campaign microservice handling:
- Bulk email sending with rate limiting
- Campaign scheduling (multiple send times per campaign)
- Custom subjects per scheduled send
- Automatic unsubscribe link injection
- Token-based unsubscribe flow (email-based tokens)
- Execution history tracking
- Integration with user service via HTTP

## Architecture

### Layer Pattern

```
routers/ (HTTP) → services/ (Business Logic) → clients/ (User Service HTTP) → User Service
                                             → repositories/ (Data Access) → MongoDB
```

### Service Dependencies

The mail service depends on:
- **MongoDB**: For campaign data storage
- **User Service**: For user subscriptions and email tracking (HTTP API)

### Key Files

| File | Purpose |
|------|---------|
| `app/config.py` | All settings via Pydantic BaseSettings |
| `app/main.py` | FastAPI app with lifespan (MongoDB, scheduler, HTTP client) |
| `app/routers/campaigns.py` | Campaign CRUD + trigger endpoints |
| `app/routers/unsubscribe.py` | Unsubscribe page + processing |
| `app/services/campaign_service.py` | Campaign business logic |
| `app/services/email_service.py` | SMTP bulk sending |
| `app/services/scheduler_service.py` | APScheduler for scheduled sends |
| `app/services/unsubscribe_service.py` | Token generation/validation (email-based) |
| `app/clients/user_client.py` | HTTP client for user service |
| `app/repositories/campaign_repository.py` | Campaign data access |
| `app/templates/*.html` | HTML templates (unsubscribe pages, email footer) |

## Configuration

All customizable values are in `app/config.py`:

```python
class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str
    DATABASE_NAME: str
    CAMPAIGNS_COLLECTION: str

    # User Service
    USER_SERVICE_URL: str       # e.g., "http://localhost:8001"
    USER_SERVICE_TOKEN: str     # Must match MAIL_SERVICE_TOKEN in user service
    USER_SERVICE_TIMEOUT: float # HTTP timeout in seconds

    # SMTP
    SMTP_SERVER: str
    SMTP_PORT: int
    SENDER_ADDRESS: str
    SMTP_PASSWORD: str

    # Security
    UNSUBSCRIBE_SECRET_KEY: str

    # Rate Limiting
    RATE_LIMIT_MIN_DELAY: float
    RATE_LIMIT_MAX_DELAY: float

    # Scheduler
    SCHEDULER_CHECK_INTERVAL_MINUTES: int
```

**Rule**: Never hardcode configurable values. Always use `settings.<SETTING_NAME>`.

## User Service Integration

### HTTP Client (`app/clients/user_client.py`)

The mail service communicates with the user service via HTTP:

```python
class UserServiceClient:
    # Get list of subscribed email addresses
    async def get_subscribed_emails() -> list[str]

    # Unsubscribe a user by email
    async def unsubscribe_by_email(email: str) -> None

    # Record that a user received a mail
    async def record_mail_received(email: str, mail_id: str) -> None
```

### Exception Classes

```python
UserServiceError        # Base exception
UserServiceAuthError    # 401/403 errors
UserServiceTimeoutError # Timeout errors
UserNotFoundError       # 404 errors
```

### Authentication

User service calls require `X-API-Token` header with `USER_SERVICE_TOKEN`.

## Models

### Campaign Models (`app/models/campaign.py`)

```python
CampaignCreate      # Input for creating campaigns
CampaignUpdate      # Input for updating campaigns
CampaignResponse    # API response
CampaignInDB        # Database representation
ScheduledSend       # Time + optional custom subject
ExecutionRecord     # Per-execution tracking (uses recipient_emails)
CampaignStatus      # Enum: scheduled, in_progress, completed, failed
```

## Database Schema

### Campaigns Collection (`mails`)

```json
{
  "_id": "ObjectId",
  "subject": "string",
  "body_html": "string",
  "scheduled_sends": [{"time": "datetime", "subject": "string|null"}],
  "use_custom_subjects": "boolean",
  "status": "string",
  "executions": [{...}],
  "executed_times": ["datetime"],
  "created_at": "datetime",
  "updated_at": "datetime|null"
}
```

## Email Flow

### Sending Process

1. `CampaignService.execute_campaign()` called (by scheduler or trigger)
2. Fetch subscribed emails via `UserServiceClient.get_subscribed_emails()`
3. `EmailService.send_bulk()`:
   - Load unsubscribe footer template if `{{unsubscribe_url}}` not in body
   - For each recipient email:
     - Generate signed token via `UnsubscribeService.generate_token(email)`
     - Replace `{{unsubscribe_url}}` with personalized link
     - Send via SMTP (run_in_executor for blocking calls)
     - Rate limit between sends
4. For each successful send, call `UserServiceClient.record_mail_received()`
5. Record execution via `CampaignRepository.add_execution()`

### Unsubscribe Flow

1. Email contains link: `/unsubscribe/{signed_token}` (token contains email)
2. GET shows confirmation page:
   - Extract email directly from token (no HTTP call needed)
   - Load `unsubscribe_page.html`
3. POST processes unsubscribe:
   - Verify token via `UnsubscribeService.verify_token()` → returns email
   - Call `UserServiceClient.unsubscribe_by_email(email)`
   - Show success page (`unsubscribe_success.html`)

## Templates

Located in `app/templates/`:

| Template | Purpose | Placeholder |
|----------|---------|-------------|
| `unsubscribe_page.html` | Confirmation page | `{email}` |
| `unsubscribe_success.html` | Success page | `{email}` |
| `unsubscribe_footer.html` | Email footer | `{{unsubscribe_url}}` |

**Rule**: Use `.replace("{email}", email)` for templates (not `.format()`) to avoid CSS brace conflicts.

## Testing

### Running Tests

```bash
cd services/mail
uv run pytest -v              # All tests
uv run pytest -v --cov=app    # With coverage
```

### Test Structure

| File | Coverage |
|------|----------|
| `test_api_campaigns.py` | Campaign API endpoints |
| `test_api_unsubscribe.py` | Unsubscribe endpoints |
| `test_api_health.py` | Health endpoint |
| `test_campaign_service.py` | Campaign business logic |
| `test_campaign_repository.py` | Campaign data access |
| `test_email_service.py` | Email sending |
| `test_scheduler_service.py` | Scheduler logic |
| `test_unsubscribe_service.py` | Token handling (email-based) |
| `test_user_client.py` | User service HTTP client |
| `test_models.py` | Pydantic validation |
| `test_integration.py` | End-to-end flows |

### Key Fixtures (`tests/conftest.py`)

```python
mock_mongodb        # Mocked MongoDB collections (campaigns only)
mock_smtp           # Mocked SMTP server
mock_user_client    # Mocked UserServiceClient methods
sync_client         # TestClient for API tests
sample_campaign_data    # CampaignCreate fixture
sample_campaign_doc     # Database document fixture
sample_emails           # List of test email addresses
create_async_cursor     # Helper for async cursor mocking
```

## Code Conventions

### Imports

**Always at top of file**. Never inline imports.

```python
# Good
from pydantic import ValidationError

# Bad
def some_function():
    from pydantic import ValidationError  # Never do this
```

### Async Patterns

All I/O operations use async/await:

```python
# Repository methods
async def get_subscribed_users() -> list[UserEmailInfo]:
    ...

# Service methods
async def execute_campaign(campaign_id: str, ...) -> TriggerResult:
    ...
```

SMTP calls use `run_in_executor` for blocking smtplib:

```python
loop = asyncio.get_event_loop()
client = await loop.run_in_executor(None, cls._create_smtp_connection)
```

### Type Hints

Required for all function arguments and return values:

```python
async def send_bulk(
    cls,
    recipients: list[tuple[str, str]],
    subject: str,
    body_html: str,
    unsubscribe_url_base: str,
    generate_token_func: callable,
    rate_limit_delay: tuple[float, float] | None = None,
) -> list[SendResult]:
```

## Common Tasks

### Adding a New Setting

1. Add to `app/config.py` Settings class with default
2. Use as `settings.NEW_SETTING` in code
3. Document in `services/mail/README.md`
4. Add to `.env.example`

### Adding a New Endpoint

1. Create route in appropriate router (`app/routers/`)
2. Add business logic in service layer (`app/services/`)
3. Add data access in repository if needed (`app/repositories/`)
4. Write tests for all layers

### Adding a New Template

1. Create HTML file in `app/templates/`
2. Use `{placeholder}` for dynamic content (single braces)
3. Load via `settings.load_template("filename.html")`
4. Replace placeholders with `.replace("{placeholder}", value)`

### Modifying Campaign Schema

1. Update models in `app/models/campaign.py`
2. Update repository methods in `app/repositories/campaign_repository.py`
3. Update service logic in `app/services/campaign_service.py`
4. Update tests to match new schema
5. Document in `services/mail/README.md`

## Debugging

### Check Scheduler

The scheduler runs every `SCHEDULER_CHECK_INTERVAL_MINUTES` minutes. Logs show:

```
Scheduler started
Found due campaigns count=X
Executing scheduled campaign campaign_id=X scheduled_time=X
```

### Check Email Sending

Email service logs each send:

```
Starting email batch total_recipients=X
Email sent recipient=X
Failed to send email recipient=X error=X
```

### MongoDB Queries

Use Motor's async driver. Always handle ObjectId conversion:

```python
from bson import ObjectId

# String to ObjectId
oid = ObjectId(campaign_id)

# Query
doc = await collection.find_one({"_id": oid})
```
