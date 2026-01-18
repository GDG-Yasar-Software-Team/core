.PHONY: help install lint lint-backend lint-frontend format-backend format-frontend format clean dev send-emails run-form-backend run-form-frontend sync-prompts

help:
	@echo "Available commands:"
	@echo "  make install            - Install all dependencies"
	@echo "  make lint               - Lint and auto-fix both backend and frontend"
	@echo "  make lint-backend       - Lint and auto-fix backend code with ruff"
	@echo "  make lint-frontend      - Lint and auto-fix frontend code with biome"
	@echo "  make format             - Format both backend and frontend"
	@echo "  make format-backend     - Format backend code with ruff"
	@echo "  make format-frontend    - Format frontend code with biome"
	@echo "  make clean              - Remove cache and build artifacts"
	@echo "  make dev                - Run both backend and frontend dev servers"
	@echo "  make run-form-backend   - Run form backend (FastAPI)"
	@echo "  make run-form-frontend  - Run form frontend development server"
	@echo "  make send-emails        - Run email sender script"
	@echo "  make sync-prompts       - Sync AI prompts"

install:
	@echo "Installing backend dependencies..."
	cd services/form && uv sync
	@echo "Installing frontend dependencies..."
	cd frontend/form && bun install
	@echo "All dependencies installed!"

lint-backend:
	@echo "Linting and fixing backend code..."
	cd services/form && uv run ruff check --fix .
	@echo "Backend linting complete!"

lint-frontend:
	@echo "Linting and fixing frontend code..."
	cd frontend/form && bun run biome check --write .
	@echo "Frontend linting complete!"

lint: lint-backend lint-frontend
	@echo "All linting complete!"

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

format-backend:
	@echo "Formatting backend code..."
	cd services/form && uv run ruff format .
	@echo "Backend formatting complete!"

format-frontend:
	@echo "Formatting frontend code..."
	cd frontend/form && bun run biome check --write .
	@echo "Frontend formatting complete!"

format: format-backend format-frontend
	@echo "All code formatted successfully!"

send-emails:
	@echo "Running email sender script..."
	cd scripts && uv run send_email_campaign.py
	@echo "Email sending complete!"

run-form-backend:
	@echo "Starting form service..."
	cd services/form && uv run fastapi dev

run-form-frontend:
	@echo "Starting form frontend development server..."
	cd frontend/form && bun dev

sync-prompts:
	@echo "Syncing prompts..."
	cd scripts && uv run sync_prompts.py
	@echo "Prompts synced!"
