# AI Agents Guide

Instructions for AI coding assistants working on this codebase.

## Stack

- **Backend**: Python 3.14, FastAPI, uv (package manager), Ruff (linter)
- **Frontend**: React, TypeScript, Bun (package manager), Biome (linter)

## Structure

```
services/   → FastAPI microservices
frontend/   → React applications
scripts/    → Python utility scripts
docs/       → Documentation
```

## Conventions

### Python
- Use `uv` for dependencies, not pip
- Use `async` for I/O operations
- Use type hints everywhere
- Follow Ruff defaults

### React/TypeScript
- Use `bun` for packages, not npm
- Use function components
- Define prop interfaces
- Avoid `any` type

## Commands

```bash
# Python
uv sync
uv run ruff format .
uv run ruff check .

# Frontend
bun install
bun run biome check .
```

## Rules

- Never commit to `main` directly
- All PRs need review from @seberatolmez and @dogukanurker
- Use squash and merge

