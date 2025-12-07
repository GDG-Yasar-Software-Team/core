# Contributing

Welcome to GDG on Campus Yasar University!

## Getting Started

1. Clone the repo
2. Read the docs in `/docs`
3. Ask questions if needed

## Workflow

1. Pick an issue from the board
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes
4. Push and create a PR
5. Add reviewers: @seberatolmez or @dogukanurker
6. Wait for at least one approval
7. Merge

## Branch Naming

- `feature/` - new features
- `fix/` - bug fixes
- `docs/` - documentation

## Commit Messages

Use prefixes:

- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation
- `refactor:` - code refactoring
- `ci:` - CI/CD changes

## Code Style

- **Python**: Ruff (runs automatically)
- **React/TS**: Biome (runs automatically)

## Pre-commit Hooks

We use pre-commit hooks to ensure code quality. Install them after cloning:

```bash
uv tool install pre-commit
pre-commit install
```

Hooks run automatically on commit. If blocked, fix issues and commit again.

## Questions?

Ask the team! We're here to help.
