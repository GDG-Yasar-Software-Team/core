# GDG on Campus Yasar University - Core

Monorepo for GDG on Campus Yasar University projects.

## Scope Legend for Conventional Commits

We should use this scopes in PR titles:

| Tag | Scope               |
| --- | ------------------- |
| fb  | **`form-backend`**  |
| ff  | **`form-frontend`** |
| ma  | **`mail`**          |

#### Example Usage

- feat(fb): add pagination feature to get submissions endpoint
- ref(fb): move pagination logic to service layer
- fix(ff): fix submit button onclick event
- chore(ff): update dependencies

## Structure

```
├── services/       # Backend microservices (FastAPI)
├── frontend/       # Frontend applications (React)
├── scripts/        # Utility scripts (data sync, etc.)
└── docs/           # Documentation
```

## System Design

Full system architecture and design documentation:

🔗 [View System Design on Eraser](https://app.eraser.io/workspace/pKbd4uRkiVb5bCq2z27R)

## Getting Started

### Clone the repository

```bash
git clone https://github.com/GDG-Yasar-Software-Team/core.git
cd core
```

### Read the docs

- [Git Basics](docs/git-basics.md) - Clone, branch, commit
- [GitHub Workflow](docs/github-workflow.md) - Issues, PRs, reviews
- [FastAPI Conventions](docs/fastapi-conventions.md) - Python backend guidelines
- [React Conventions](docs/react-conventions.md) - Frontend guidelines
- [AI Usage](docs/ai-usage.md) - AI tools guidelines

## Development

### Quick Start with Makefile

We provide a Makefile for common development tasks:

```bash
# Show all available commands
make help

# Setup
make install                # Install all dependencies (backend + frontend)

# Development
make dev                    # Run both backend and frontend dev servers
make run-form-backend       # Run form service (FastAPI) only
make run-form-frontend      # Run form frontend dev server only

# Code quality
make lint                   # Lint & auto-fix both backend and frontend
make format                 # Format both backend and frontend

# Utilities
make clean                  # Remove cache and build artifacts
make send-emails            # Run email sender script
```

### Form Backend

FastAPI service using [uv](https://docs.astral.sh/uv/) and [Ruff](https://docs.astral.sh/ruff/).

```bash
make install            # Install dependencies
make run-form-backend   # Run dev server
make lint               # Lint & auto-fix
make format             # Format code
```

### Form Frontend

React app using [Bun](https://bun.sh/) and [Biome](https://biomejs.dev/).

```bash
make install            # Install dependencies
make run-form-frontend  # Run dev server
make lint               # Lint & auto-fix
make format             # Format code
```

## Workflow

1. Create an issue for your task
2. Create a branch from `main`
3. Make changes and commit
4. Push and create a Pull Request
5. Add reviewers: **@seberatolmez** or **@dogukanurker**
6. Wait for at least one approval
7. **Squash and merge** (not regular merge)

**Never commit directly to `main`.** Always use **Squash and merge** to keep history clean.

## License

Internal use only.
