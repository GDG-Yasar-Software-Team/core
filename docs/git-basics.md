# Git Basics

## Clone the Repository

```bash
git clone https://github.com/GDG-on-Campus-Yasar-University/core.git
cd core
```

## Daily Workflow

### 1. Always pull latest changes first

```bash
git checkout main
git pull origin main
```

### 2. Create a new branch for your work

```bash
git checkout -b feature/your-feature-name
```

Branch naming:
- `feature/` - new features
- `fix/` - bug fixes
- `docs/` - documentation updates

### 3. Make your changes and commit

```bash
git add .
git commit -m "feat: add user login"
```

Commit message prefixes:
- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation
- `refactor:` - code refactoring
- `style:` - formatting, no code change

### 4. Push your branch

```bash
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

Go to GitHub and create a PR. See [github-workflow.md](github-workflow.md) for details.

## Useful Commands

| Command | Description |
|---------|-------------|
| `git status` | See changed files |
| `git diff` | See what changed |
| `git log --oneline` | View commit history |
| `git branch` | List branches |
| `git checkout main` | Switch to main branch |

## Rules

- **Never commit directly to `main`**
- Always create a branch for your work
- Always create a PR for review

