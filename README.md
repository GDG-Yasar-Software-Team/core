# GDG on Campus Yasar University - Core

Monorepo for GDG on Campus Yasar University projects.

<details>
<summary><b>Scope legend for conventional commits</b></summary>
<br>

| Tag | Scope               |
| --- | ------------------- |
| fb  | **`form-backend`**  |
| ff  | **`form-frontend`** |

</details>
</div>

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

# Format code
make format                 # Format both backend and frontend
make format-backend         # Format backend only
make format-frontend        # Format frontend only

# Run services
make run-form-backend       # Run form service (FastAPI)
make run-form-frontend      # Run form frontend dev server

# Utilities
make send-emails            # Run email sender script
```

### Python (Backend)

We use [uv](https://docs.astral.sh/uv/) for dependency management and [Ruff](https://docs.astral.sh/ruff/) for linting/formatting.

```bash
# Install uv (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies (in service directory)
cd services/form && uv sync

# Format (from root)
make format-backend

# Lint (from service directory)
cd services/form && uv run ruff check .
```

### React (Frontend)

We use [bun](https://bun.sh/) for package management and [Biome](https://biomejs.dev/) for linting/formatting.

```bash
# Install bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies (in frontend directory)
cd frontend/form && bun install

# Format (from root)
make format-frontend

# Lint (from frontend directory)
cd frontend/form && bun run biome check .
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
