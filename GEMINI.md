<!-- AUTO-GENERATED from .ai/INSTRUCTIONS.md; run `make sync-prompts` to update. -->

# AI Agents Guide

Instructions for AI coding assistants working on this codebase.

## Project Overview

This is a monorepo for GDG on Campus Yaşar University's core software infrastructure. It contains backend microservices, frontend applications, and utility scripts.

## Tech Stack

| Layer              | Technology                            |
| ------------------ | ------------------------------------- |
| Backend            | Python 3.14, FastAPI, Motor (MongoDB) |
| Frontend           | React, TypeScript, Vite               |
| Package Managers   | uv (Python), Bun (JS/TS)              |
| Linters/Formatters | Ruff (Python), Biome (JS/TS)          |
| Task Runner        | Makefile                              |

## Directory Structure

```
├── services/           # Backend microservices (FastAPI)
│   ├── form/           # Form management service
│   │   └── app/
│   │       ├── main.py       # Entry point
│   │       ├── routers/      # API routes
│   │       ├── models/       # Pydantic models
│   │       ├── services/     # Business logic
│   │       ├── db/           # Database (MongoDB)
│   │       └── utils/        # Helpers
│   └── mail/           # Email campaign service
│       └── app/
│           ├── main.py       # Entry point
│           ├── config.py     # Settings (Pydantic BaseSettings)
│           ├── routers/      # API routes
│           ├── models/       # Pydantic models
│           ├── repositories/ # Data access layer
│           ├── services/     # Business logic
│           ├── templates/    # HTML templates
│           ├── db/           # Database (MongoDB)
│           └── utils/        # Helpers
├── frontend/           # Frontend applications (React)
│   └── form/           # Form management UI
│       └── src/
│           ├── components/   # Reusable components
│           ├── pages/        # Route components
│           ├── hooks/        # Custom hooks
│           ├── services/     # API calls
│           ├── types/        # TypeScript definitions
│           └── utils/        # Helpers
├── scripts/            # Utility scripts
├── docs/               # Documentation & conventions
├── .ai/                # AI agent instructions
│   ├── INSTRUCTIONS.md      # Global instructions (this file)
│   └── backend/mail/        # Mail service detailed docs
└── .github/            # GitHub workflows, templates, CODEOWNERS
```

## Service-Specific Instructions

For detailed context on specific services, see:

- **Mail Service**: `services/mail/{CLAUDE│AGENTS│GEMINI}.md` - Campaign scheduling, email sending, unsubscribe flow

## Development Commands

### Makefile (Run from root)

```bash
make help               # List all commands
make install            # Install all dependencies (backend + frontend)
make dev                # Run both backend and frontend dev servers
make lint               # Lint and auto-fix both backend and frontend
make format             # Format both backend and frontend
make clean              # Remove cache and build artifacts
make run-form-service   # Start form FastAPI dev server
make run-form-frontend  # Start Vite dev server
make run-mail-service   # Start mail FastAPI dev server
make test-mail-backen   # Run mail service tests
make run-mail-campaign  # Run email campaign CLI
make sync-prompts       # Sync AI prompt files
```

### Backend (Python)

```bash
make install            # Install all dependencies
make run-form-service   # Run dev server
make format             # Format code
make lint               # Lint code
```

### Frontend (React/TypeScript)

```bash
make install            # Install all dependencies
make run-form-frontend  # Run dev server
make format             # Format code
make lint               # Lint code
```

## Coding Conventions

### Python (Backend)

| Type      | Convention  | Example            |
| --------- | ----------- | ------------------ |
| Files     | snake_case  | `user_router.py`   |
| Functions | snake_case  | `get_user_by_id()` |
| Classes   | PascalCase  | `UserResponse`     |
| Constants | UPPER_SNAKE | `MAX_RETRIES`      |
| Variables | snake_case  | `user_count`       |

**Rules:**

- Use `uv` for dependencies, never pip
- Use `async/await` for all I/O operations (DB, API calls)
- Strict type hints required for all function arguments and return values
- Use Pydantic models for data validation
- Separate logic: `routers/` (HTTP handling) → `services/` (business logic)
- Follow Ruff defaults

### React/TypeScript (Frontend)

| Type             | Convention           | Example               |
| ---------------- | -------------------- | --------------------- |
| Components       | PascalCase           | `UserCard.tsx`        |
| Hooks            | camelCase with `use` | `useAuth.ts`          |
| Utils            | camelCase            | `formatDate.ts`       |
| Types/Interfaces | PascalCase           | `User`, `ApiResponse` |
| Variables        | camelCase            | `userName`            |
| Constants        | UPPER_SNAKE          | `API_URL`             |

**Rules:**

- Use `bun` for packages, never npm
- Use function components only
- Define prop interfaces for all components
- Avoid `any` type - use strict TypeScript
- One component per file
- Extract reusable logic to custom hooks

## Git Workflow

### Branch Naming

- `feat/<issue-number>-<slug>` - New features (e.g., `feat/42-new-dashboard`)
- `fix/<issue-number>-<slug>` - Bug fixes (e.g., `fix/55-button-overlap`)
- `docs/<issue-number>-<slug>` - Documentation updates

### Commit Message Prefixes

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `ref:` - Code refactoring
- `ci:` - CI/CD changes
- `style:` - Formatting (no code change)

### Pull Request Rules

1. **Never commit directly to `main`**
2. Create a branch from `main`
3. Run formatters before opening PR (`make format`)
4. **PR Titles:**
   - Must be all lowercase
   - Must include scope (e.g., `fix(ff): ...`)

   | Tag | Scope               |
   | --- | ------------------- |
   | fb  | **`form-backend`**  |
   | ff  | **`form-frontend`** |
   | ma  | **`mail`**          |

5. **PR Template:** Agents must read `.github/PULL_REQUEST_TEMPLATE.md`
6. Link issues in PR description (`Closes #123`)
7. Request review from `@seberatolmez` or `@dogukanurker`
8. At least one admin approval required
9. **Always use "Squash and merge"**

## Important Files

| File                               | Purpose                              |
| ---------------------------------- | ------------------------------------ |
| `Makefile`                         | Central entry point for dev commands |
| `services/form/pyproject.toml`     | Form backend dependencies            |
| `services/mail/pyproject.toml`     | Mail backend dependencies            |
| `services/mail/app/config.py`      | Mail service settings                |
| `frontend/form/package.json`       | Frontend dependencies                |
| `frontend/form/vite.config.ts`     | Frontend build config                |
| `frontend/biome.json`              | Biome (JS/TS linter) config          |
| `.pre-commit-config.yaml`          | Pre-commit hooks config              |
| `docs/*.md`                        | Detailed conventions                 |
| `.ai/backend/mail/INSTRUCTIONS.md` | Mail service AI instructions         |

## Configuration & Secrets

- Use `.env` files for service settings
- **Never commit secrets** - use `.env.example` as template
- Document required env variables in service README

## Testing Guidelines

- Mail service: `make test-mail-service` runs 126+ tests with pytest
- Form service: No tests yet
- If adding tests, include clear command in service README
- Consider adding Makefile target (e.g., `make test-<service>`)
