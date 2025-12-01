# FastAPI Conventions

## Official Documentation

- **FastAPI**: https://fastapi.tiangolo.com/
- **Pydantic**: https://docs.pydantic.dev/
- **uv**: https://docs.astral.sh/uv/
- **Ruff**: https://docs.astral.sh/ruff/

Please read the official docs. Feel free to ask questions to the team if you need help!

---

## Project Structure

```
services/your-service/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app entry
│   ├── routers/         # API routes
│   ├── models/          # Pydantic models
│   ├── services/        # Business logic
│   └── utils/           # Helper functions
├── pyproject.toml       # Dependencies (uv)
└── README.md
```

## Dependencies

We use **uv** for dependency management.

```bash
# Install uv (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create new project
uv init

# Add dependency
uv add fastapi uvicorn

# Install dependencies
uv sync

# Run your app
uv run uvicorn app.main:app --reload
```

## Code Style

We use **Ruff** for linting and formatting. It runs automatically on PRs.

```bash
# Format code
uv run ruff format .

# Check linting
uv run ruff check .

# Fix auto-fixable issues
uv run ruff check --fix .
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | snake_case | `user_router.py` |
| Functions | snake_case | `get_user_by_id()` |
| Classes | PascalCase | `UserResponse` |
| Constants | UPPER_SNAKE | `MAX_RETRIES` |
| Variables | snake_case | `user_count` |

## API Routes

```python
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}")
async def get_user(user_id: int):
    """Get user by ID."""
    user = await fetch_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Pydantic Models

```python
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True
```

## Best Practices

1. **Use type hints everywhere**
   ```python
   def calculate_total(items: list[Item]) -> float:
   ```

2. **Use async functions for I/O operations**
   ```python
   async def fetch_data():
   ```

3. **Use dependency injection**
   ```python
   @router.get("/")
   async def get_items(db: Session = Depends(get_db)):
   ```

4. **Handle errors properly**
   ```python
   raise HTTPException(status_code=400, detail="Invalid input")
   ```

5. **Add docstrings to endpoints**
   ```python
   @router.post("/")
   async def create_user(user: UserCreate):
       """Create a new user account."""
   ```

## Environment Variables

Use `.env` files (never commit them):

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    api_key: str

    class Config:
        env_file = ".env"
```

