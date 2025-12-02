# GDG on Campus Yasar University - Core

Monorepo for GDG on Campus Yasar University projects.

## Structure

```
├── services/       # Backend microservices (FastAPI)
├── frontend/       # Frontend applications (React)
├── scripts/        # Utility scripts (data sync, etc.)
└── docs/           # Documentation
```

### System Design

https://app.eraser.io/workspace/pKbd4uRkiVb5bCq2z27R

## Getting Started

### Clone the repository

```bash
git clone https://github.com/GDG-on-Campus-Yasar-University/core.git
cd core
```

### Read the docs

- [Git Basics](docs/git-basics.md) - Clone, branch, commit
- [GitHub Workflow](docs/github-workflow.md) - Issues, PRs, reviews
- [FastAPI Conventions](docs/fastapi-conventions.md) - Python backend guidelines
- [React Conventions](docs/react-conventions.md) - Frontend guidelines
- [AI Usage](docs/ai-usage.md) - AI tools guidelines

## Development

### Python (Backend)

We use [uv](https://docs.astral.sh/uv/) for dependency management and [Ruff](https://docs.astral.sh/ruff/) for linting/formatting.

```bash
# Install uv (if not installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Format
uv run ruff format .

# Lint
uv run ruff check .
```

### React (Frontend)

We use [bun](https://bun.sh/) for package management and [Biome](https://biomejs.dev/) for linting/formatting.

```bash
# Install bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Format
bun run biome format --write .

# Lint
bun run biome check .
```

## Workflow

1. Create an issue for your task
2. Create a branch from `main`
3. Make changes and commit
4. Push and create a Pull Request
5. Add both reviewers: **@seberatolmez** and **@dogukanurker**
6. Wait for **both** to approve
7. **Squash and merge** (not regular merge)

**Never commit directly to `main`.** Always use **Squash and merge** to keep history clean.

## License

Internal use only.
