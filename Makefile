.PHONY: help install lint format clean dev run-form-service run-form-frontend run-mail-service run-mail-campaign test-mail-service run-user-service test-user-service run-event-service test-event-service sync-prompts

help:
	@echo "Available commands:"
	@echo "  make install            - Install all dependencies"
	@echo "  make lint               - Lint and auto-fix both backend and frontend"
	@echo "  make format             - Format both backend and frontend"
	@echo "  make clean              - Remove cache and build artifacts"
	@echo "  make dev                - Run both backend and frontend dev servers"
	@echo "  make run-form-service   - Run form backend (FastAPI)"
	@echo "  make run-form-frontend  - Run form frontend development server"
	@echo "  make run-mail-service   - Run mail backend (FastAPI)"
	@echo "  make run-mail-campaign  - Run mail campaign CLI script"
	@echo "  make test-mail-service  - Run mail service tests"
	@echo "  make run-user-service   - Run user backend (FastAPI)"
	@echo "  make test-user-service  - Run user service tests"
	@echo "  make run-event-service  - Run event backend (FastAPI)"
	@echo "  make test-event-service - Run event service tests"
	@echo "  make sync-prompts       - Sync AI prompts"

install:
	@echo "Installing form backend dependencies..."
	cd services/form && uv sync --all-extras
	@echo "Installing mail backend dependencies..."
	cd services/mail && uv sync --all-extras
	@echo "Installing user backend dependencies..."
	cd services/user && uv sync --all-extras
	@echo "Installing event backend dependencies..."
	cd services/event && uv sync --all-extras
	@echo "Installing frontend dependencies..."
	cd frontend/form && bun install
	@echo "All dependencies installed!"

lint:
	@echo "Linting and fixing form backend code..."
	cd services/form && uv run ruff check --fix .
	@echo "Linting and fixing mail backend code..."
	cd services/mail && uv run ruff check --fix .
	@echo "Linting and fixing user backend code..."
	cd services/user && uv run ruff check --fix .
	@echo "Linting and fixing event backend code..."
	cd services/event && uv run ruff check --fix .
	@echo "Linting and fixing frontend code..."
	cd frontend/form && bun run biome check --write .
	@echo "All linting complete!"

format:
	@echo "Formatting form backend code..."
	cd services/form && uv run ruff format .
	@echo "Formatting mail backend code..."
	cd services/mail && uv run ruff format .
	@echo "Formatting user backend code..."
	cd services/user && uv run ruff format .
	@echo "Formatting event backend code..."
	cd services/event && uv run ruff format .
	@echo "Formatting frontend code..."
	cd frontend/form && bun run biome check --write .
	@echo "All code formatted!"

clean:
	@echo "Cleaning cache and build artifacts..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules/.cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "Clean complete!"

dev:
	@echo "Starting backend and frontend dev servers..."
	@trap 'kill 0' INT; \
	(cd services/form && uv run fastapi dev) & \
	(cd frontend/form && bun dev) & \
	wait

run-form-service:
	@echo "Starting form service..."
	cd services/form && uv run fastapi dev

run-form-frontend:
	@echo "Starting form frontend development server..."
	cd frontend/form && bun dev

run-mail-service:
	@echo "Starting mail service..."
	cd services/mail && uv run fastapi dev

run-mail-campaign:
	@echo "Running mail campaign CLI..."
	cd scripts && uv run run_mail_campaign.py $(ARGS)

test-mail-service:
	@echo "Running mail service tests..."
	cd services/mail && uv run pytest -v --cov=app
	@echo "Tests complete!"

run-user-service:
	@echo "Starting user service..."
	cd services/user && uv run fastapi dev

test-user-service:
	@echo "Running user service tests..."
	cd services/user && uv run pytest -v --cov=app
	@echo "Tests complete!"

run-event-service:
	@echo "Starting event service..."
	cd services/event && uv run fastapi dev

test-event-service:
	@echo "Running event service tests..."
	cd services/event && uv run pytest -v --cov=app
	@echo "Tests complete!"

sync-prompts:
	@echo "Syncing prompts..."
	cd scripts && uv run sync_prompts.py
	@echo "Prompts synced!"
